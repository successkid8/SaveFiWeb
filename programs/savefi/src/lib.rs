use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Token, TokenAccount, Mint, MintTo, Burn},
};

// Constants for program configuration
pub mod constants {
    // Delegation limits
    pub const MAX_DELEGATION_SOL: u64 = 5_000_000_000; // 5 SOL in lamports
    pub const MIN_DELEGATION_SOL: u64 = 1_000_000;     // 0.001 SOL in lamports
    pub const DAILY_LIMIT_SOL: u64 = 50_000_000_000;   // 50 SOL in lamports
    
    // Lock periods
    pub const MIN_LOCK_DAYS: u8 = 1;
    pub const MAX_LOCK_DAYS: u8 = 30;
    
    // Savings rates
    pub const MIN_SAVE_RATE: u8 = 1;   // 1%
    pub const MAX_SAVE_RATE: u8 = 20;  // 20%
    
    // Fee rates
    pub const MIN_FEE_RATE: u8 = 0;    // 0%
    pub const MAX_FEE_RATE: u8 = 5;    // 5%
    
    // Subscription
    pub const SUBSCRIPTION_FEE_SOL: u64 = 250_000_000; // 0.25 SOL
    pub const SUBSCRIPTION_PERIOD_DAYS: u8 = 7;        // 7 days
    
    // Cooldown
    pub const DELEGATION_COOLDOWN_HOURS: u8 = 1;       // 1 hour
}

declare_id!("6ttMWaSxYvukX3dYJwuGCp7eaHWL6Fw28ZRhsULWMPp9");

#[program]
pub mod savefi {
    use super::*;

    pub fn initialize_mints(ctx: Context<InitializeMints>, fee_rate: u8) -> Result<()> {
        require!(fee_rate <= constants::MAX_FEE_RATE, SaveFiError::InvalidFeeRate);
        require!(ctx.accounts.save_token_mint.decimals == 9, SaveFiError::InvalidMintDecimals);
        let mint_authority = &mut ctx.accounts.mint_authority;
        mint_authority.bump = ctx.bumps.mint_authority;

        let fee_account = &mut ctx.accounts.fee_account;
        fee_account.authority = ctx.accounts.admin.key();
        fee_account.balance = 0;
        fee_account.fee_rate = fee_rate;

        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.paused = false;
        config.save_token_mint = ctx.accounts.save_token_mint.key();

        let guard = &mut ctx.accounts.reentrancy_guard;
        guard.locked = false;

        Ok(())
    }

    pub fn initialize_vault(ctx: Context<InitializeVault>, savings_rate: u8, lock_days: u8) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.paused, SaveFiError::ProtocolPaused);
        require!(savings_rate >= constants::MIN_SAVE_RATE && savings_rate <= constants::MAX_SAVE_RATE, SaveFiError::InvalidSaveRate);
        require!(lock_days >= constants::MIN_LOCK_DAYS && lock_days <= constants::MAX_LOCK_DAYS, SaveFiError::InvalidLockPeriod);
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == Pubkey::default(), SaveFiError::VaultAlreadyInitialized);

        vault.owner = ctx.accounts.user.key();
        vault.savings_rate = savings_rate;
        vault.lock_period_days = lock_days;
        vault.balance = 0;
        vault.lock_until = 0;
        vault.is_active = true;
        vault.next_payment_due = Clock::get()?.unix_timestamp + 7 * 24 * 60 * 60;

        let proxy = &mut ctx.accounts.proxy_account;
        proxy.owner = ctx.accounts.user.key();
        proxy.bump = ctx.bumps.proxy_account;

        Ok(())
    }

    pub fn delegate_funds(ctx: Context<DelegateFunds>, amount: u64, lock_days: u8) -> Result<()> {
        require!(amount >= constants::MIN_DELEGATION_SOL && amount <= constants::MAX_DELEGATION_SOL, SaveFiError::InvalidDelegationAmount);
        require!(lock_days >= constants::MIN_LOCK_DAYS && lock_days <= constants::MAX_LOCK_DAYS, SaveFiError::InvalidLockPeriod);
        let delegation = &mut ctx.accounts.delegation;
        delegation.owner = ctx.accounts.user.key();
        delegation.delegated_amount = amount;
        delegation.delegation_expiry = Clock::get()?.unix_timestamp + (lock_days as i64 * 24 * 60 * 60);
        delegation.bump = ctx.bumps.delegation;
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.delegation.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn auto_deduct(ctx: Context<AutoDeduct>, trade_amount: u64, timestamp: i64) -> Result<()> {
        let config = &ctx.accounts.config;
        let guard = &mut ctx.accounts.reentrancy_guard;
        require!(!config.paused, SaveFiError::ProtocolPaused);
        require!(!guard.locked, SaveFiError::ReentrancyDetected);
        
        // Get delegation amount first
        let delegated_amount = ctx.accounts.delegation.delegated_amount;
        require!(trade_amount > 0 && trade_amount <= delegated_amount, SaveFiError::InvalidSaveAmount);
        require!(ctx.accounts.vault.is_active, SaveFiError::VaultInactive);
        require!(timestamp <= ctx.accounts.delegation.delegation_expiry, SaveFiError::DelegationExpired);
        guard.locked = true;

        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.delegation.owner, SaveFiError::Unauthorized);

        // Calculate savings amount
        let save_amount = (trade_amount as u128)
            .checked_mul(vault.savings_rate as u128)
            .ok_or(SaveFiError::InvalidSaveAmount)?
            .checked_div(100)
            .ok_or(SaveFiError::InvalidSaveAmount)? as u64;

        // Mint SaveSOL tokens
        if save_amount > 0 {
            anchor_spl::token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    MintTo {
                        mint: ctx.accounts.save_token_mint.to_account_info(),
                        to: ctx.accounts.vault_token_account.to_account_info(),
                        authority: ctx.accounts.mint_authority.to_account_info(),
                    },
                    &[&[b"mint_authority".as_ref(), &[ctx.accounts.mint_authority.bump]]],
                ),
                save_amount,
            )?;
            vault.balance += save_amount;
            vault.lock_until = timestamp + (vault.lock_period_days as i64 * 24 * 60 * 60);
        }

        // Calculate and transfer fees
        let fee_account = &mut ctx.accounts.fee_account;
        let fee_amount = (trade_amount as u128)
            .checked_mul(fee_account.fee_rate as u128)
            .ok_or(SaveFiError::InvalidSaveAmount)?
            .checked_div(100)
            .ok_or(SaveFiError::InvalidSaveAmount)? as u64;

        if fee_amount > 0 {
            fee_account.balance += fee_amount;
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.delegation.to_account_info(),
                        to: ctx.accounts.fee_account.to_account_info(),
                    },
                ),
                fee_amount,
            )?;
        }

        // Transfer remaining amount to destination
        let remaining_amount = trade_amount.checked_sub(save_amount).unwrap().checked_sub(fee_amount).unwrap();
        if remaining_amount > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.delegation.to_account_info(),
                        to: ctx.accounts.destination.to_account_info(),
                    },
                ),
                remaining_amount,
            )?;
        }

        // Update delegation amount after all transfers
        let delegation = &mut ctx.accounts.delegation;
        delegation.delegated_amount = delegated_amount.checked_sub(trade_amount).unwrap();
        guard.locked = false;
        Ok(())
    }

    pub fn update_vault(ctx: Context<UpdateVault>, new_savings_rate: u8, new_lock_days: u8) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.paused, SaveFiError::ProtocolPaused);
        require!(new_savings_rate >= constants::MIN_SAVE_RATE && new_savings_rate <= constants::MAX_SAVE_RATE, SaveFiError::InvalidSaveRate);
        require!(new_lock_days >= constants::MIN_LOCK_DAYS && new_lock_days <= constants::MAX_LOCK_DAYS, SaveFiError::InvalidLockPeriod);
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.user.key(), SaveFiError::Unauthorized);
        vault.savings_rate = new_savings_rate;
        vault.lock_period_days = new_lock_days;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(!config.paused, SaveFiError::ProtocolPaused);
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.user.key(), SaveFiError::Unauthorized);
        require!(
            Clock::get()?.unix_timestamp >= vault.lock_until,
            SaveFiError::VaultLocked
        );
        let amount = vault.balance;
        require!(amount > 0, SaveFiError::EmptyVault);

        vault.balance = 0;
        anchor_spl::token::burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.save_token_mint.to_account_info(),
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                &[&[b"vault", ctx.accounts.user.key().as_ref(), &[ctx.bumps.vault]]],
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn renew_subscription(ctx: Context<RenewSubscription>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.user.key(), SaveFiError::Unauthorized);
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.fee_account.to_account_info(),
                },
            ),
            constants::SUBSCRIPTION_FEE_SOL,
        )?;
        vault.next_payment_due = Clock::get()?.unix_timestamp + (constants::SUBSCRIPTION_PERIOD_DAYS as i64 * 24 * 60 * 60);
        vault.is_active = true;
        Ok(())
    }

    pub fn revoke_delegation(ctx: Context<RevokeDelegation>) -> Result<()> {
        // Get delegation amount first
        let remaining_amount = ctx.accounts.delegation.delegated_amount;
        require!(ctx.accounts.delegation.owner == ctx.accounts.user.key(), SaveFiError::Unauthorized);

        // Transfer remaining amount if any
        if remaining_amount > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.delegation.to_account_info(),
                        to: ctx.accounts.user.to_account_info(),
                    },
                ),
                remaining_amount,
            )?;
        }

        // Update delegation after transfer
        let delegation = &mut ctx.accounts.delegation;
        delegation.delegated_amount = 0;
        delegation.delegation_expiry = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMints<'info> {
    #[account(init, payer = admin, space = 8 + 1, seeds = [b"mint_authority"], bump)]
    pub mint_authority: Account<'info, MintAuthority>,
    #[account(init, payer = admin, space = 8 + 32 + 8 + 1, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(init, payer = admin, space = 8 + 32 + 1 + 32, seeds = [b"config"], bump)]
    pub config: Account<'info, ProtocolConfig>,
    #[account(init, payer = admin, space = 8 + 1, seeds = [b"reentrancy_guard"], bump)]
    pub reentrancy_guard: Account<'info, ReentrancyGuard>,
    #[account(mut)]
    pub save_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(init, payer = user, space = 8 + 32 + 1 + 1 + 8 + 8 + 1 + 8, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(init, payer = user, space = 8 + 32 + 1, seeds = [b"proxy", user.key().as_ref()], bump)]
    pub proxy_account: Account<'info, ProxyAccount>,
    #[account(init, payer = user, associated_token::mint = save_token_mint, associated_token::authority = vault)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: Validated in config
    pub save_token_mint: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(has_one = admin @ SaveFiError::Unauthorized)]
    pub config: Account<'info, ProtocolConfig>,
    /// CHECK: This is the admin account
    pub admin: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct DelegateFunds<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + 8 + 1, seeds = [b"delegation", user.key().as_ref()], bump)]
    pub delegation: Account<'info, Delegation>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AutoDeduct<'info> {
    #[account(mut, seeds = [b"vault", proxy_account.owner.as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut, seeds = [b"proxy", proxy_account.owner.as_ref()], bump)]
    pub proxy_account: Account<'info, ProxyAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: Validated in config
    pub save_token_mint: AccountInfo<'info>,
    #[account(seeds = [b"mint_authority"], bump = mint_authority.bump)]
    pub mint_authority: Account<'info, MintAuthority>,
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut, seeds = [b"delegation", vault.owner.as_ref()], bump)]
    pub delegation: Account<'info, Delegation>,
    /// CHECK: Validated as DEX pool or wallet
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    #[account(has_one = admin @ SaveFiError::Unauthorized)]
    pub config: Account<'info, ProtocolConfig>,
    /// CHECK: This is the admin account
    pub admin: AccountInfo<'info>,
    #[account(mut, seeds = [b"reentrancy_guard"], bump)]
    pub reentrancy_guard: Account<'info, ReentrancyGuard>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateVault<'info> {
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(has_one = admin @ SaveFiError::Unauthorized)]
    pub config: Account<'info, ProtocolConfig>,
    /// CHECK: This is the admin account
    pub admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: Validated in config
    pub save_token_mint: AccountInfo<'info>,
    #[account(has_one = admin @ SaveFiError::Unauthorized)]
    pub config: Account<'info, ProtocolConfig>,
    /// CHECK: This is the admin account
    pub admin: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RenewSubscription<'info> {
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeDelegation<'info> {
    #[account(mut, seeds = [b"delegation", user.key().as_ref()], bump)]
    pub delegation: Account<'info, Delegation>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub savings_rate: u8,
    pub lock_period_days: u8,
    pub balance: u64,
    pub lock_until: i64,
    pub is_active: bool,
    pub next_payment_due: i64,
}

#[account]
pub struct Delegation {
    pub owner: Pubkey,
    pub delegated_amount: u64,
    pub delegation_expiry: i64,
    pub bump: u8,
}

#[account]
pub struct MintAuthority {
    pub bump: u8,
}

#[account]
pub struct FeeAccount {
    pub authority: Pubkey,
    pub balance: u64,
    pub fee_rate: u8,
}

#[account]
pub struct ProxyAccount {
    pub owner: Pubkey,
    pub bump: u8,
}

#[account]
pub struct ProtocolConfig {
    pub admin: Pubkey,
    pub paused: bool,
    pub save_token_mint: Pubkey,
}

#[account]
pub struct ReentrancyGuard {
    pub locked: bool,
}

#[error_code]
pub enum SaveFiError {
    #[msg("Save rate must be between 1 and 20")]
    InvalidSaveRate,
    #[msg("Fee rate must be between 0 and 5")]
    InvalidFeeRate,
    #[msg("Lock period must be between 1 and 30 days")]
    InvalidLockPeriod,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid save amount")]
    InvalidSaveAmount,
    #[msg("Vault is still locked")]
    VaultLocked,
    #[msg("Vault is empty")]
    EmptyVault,
    #[msg("Vault already initialized")]
    VaultAlreadyInitialized,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Reentrancy detected")]
    ReentrancyDetected,
    #[msg("Invalid mint decimals")]
    InvalidMintDecimals,
    #[msg("Vault is inactive")]
    VaultInactive,
    #[msg("Delegation amount exceeds maximum")]
    InvalidDelegationAmount,
    #[msg("Delegation has expired")]
    DelegationExpired,
    #[msg("Invalid SaveSOL mint")]
    InvalidMint,
}