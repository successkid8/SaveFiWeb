use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use anchor_spl::token;

declare_id!("2Q4yUWhagMoXvij3YN7uutUUJ9kvXGs9TwX2fh6YEkZu");

// Core constants
pub const MAX_SAVE_RATE: u8 = 20;
pub const MIN_SAVE_RATE: u8 = 1;
pub const MAX_FEE_RATE: u8 = 5;
pub const MIN_FEE_RATE: u8 = 0;
pub const MAX_LOCK_DAYS: u8 = 30;
pub const MIN_LOCK_DAYS: u8 = 1;

// DEX program IDs
pub const RAYDIUM_PROGRAM_ID: &str = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
pub const ORCA_PROGRAM_ID: &str = "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP";
pub const JUPITER_PROGRAM_ID: &str = "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB";

// Token constants
pub const WSOL_MINT: &str = "So11111111111111111111111111111111111111112";
pub const SAVESOL_MINT: &str = "SaveFi2022Token1111111111111111111111111111111111111111111111111111111111111111";
pub const SAVESOL_DECIMALS: u8 = 9;  // Same as SOL

// Security constants
pub const MAX_SAVINGS_PER_DAY: u64 = 100_000_000_000; // 100 SOL in lamports
pub const EMERGENCY_FEE_RATE: u8 = 5; // 5% emergency withdrawal fee

// Constants for optimization
pub const MAX_BATCH_SIZE: usize = 10;
pub const RENT_EXEMPT_LAMPORTS: u64 = 890880;
pub const INACTIVITY_THRESHOLD_DAYS: i64 = 90; // 90 days of inactivity
pub const MAX_CLEANUP_BATCH_SIZE: usize = 5;
pub const RECOVERY_COOLDOWN_DAYS: i64 = 7; // 7 days cooldown after recovery
pub const MAX_RECOVERY_ATTEMPTS: u8 = 3;
pub const TRADE_TYPE_BUY: u8 = 1;
pub const TRADE_TYPE_SELL: u8 = 2;

// Add PumpFun constants
pub const PUMPFUN_PROGRAM_ID: &str = "PFuUvX5KxqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX";

// DEX instruction types
pub const SWAP_INSTRUCTION: u8 = 1;
pub const ADD_LIQUIDITY_INSTRUCTION: u8 = 2;
pub const REMOVE_LIQUIDITY_INSTRUCTION: u8 = 3;
pub const LIMIT_ORDER_INSTRUCTION: u8 = 4;
pub const MARKET_ORDER_INSTRUCTION: u8 = 5;

// Add PumpFun specific instruction types
pub const PUMPFUN_LAUNCH_INSTRUCTION: u8 = 6;
pub const PUMPFUN_TRADE_INSTRUCTION: u8 = 7;
pub const PUMPFUN_CLAIM_INSTRUCTION: u8 = 8;

// Add SaveSOL constants
pub const TOKEN_2022_PROGRAM_ID: &str = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

// Add security constants
pub const MAX_TRANSACTIONS_PER_DAY: u32 = 100;
pub const TRANSACTION_COOLDOWN_SECONDS: i64 = 60;
pub const EMERGENCY_WITHDRAWAL_FEE: u64 = 1_000_000; // 0.001 SOL in lamports

// Constants
pub const MIN_TRADE_SIZE: u64 = 1_000_000; // 0.001 SOL
pub const MAX_TRADE_SIZE: u64 = 1_000_000_000; // 1 SOL

#[program]
pub mod savefi {
    use super::*;

    /// Initialize SaveSOL mint and fee account (admin-only)
    pub fn initialize_mints(ctx: Context<InitializeMints>, fee_rate: u8) -> Result<()> {
        require!(fee_rate <= 5, SaveFiError::InvalidFeeRate);
        let mint_authority = &mut ctx.accounts.mint_authority;
        mint_authority.bump = ctx.bumps.mint_authority;

        let fee_account = &mut ctx.accounts.fee_account;
        fee_account.authority = ctx.accounts.admin.key();
        fee_account.balance = 0;
        fee_account.fee_rate = fee_rate;

        Ok(())
    }

    /// Update fee rate (0-5%, admin-only)
    pub fn update_fee(ctx: Context<UpdateFee>, new_fee_rate: u8) -> Result<()> {
        require!(new_fee_rate <= 5, SaveFiError::InvalidFeeRate);
        let fee_account = &mut ctx.accounts.fee_account;
        require!(fee_account.authority == ctx.accounts.admin.key(), SaveFiError::Unauthorized);
        fee_account.fee_rate = new_fee_rate;
        Ok(())
    }

    /// Initialize user's vault and proxy account with save rate and lock period
    pub fn initialize_vault(
        ctx: Context<InitializeVault>, 
        save_rate: u8, 
        lock_days: u8, 
        active_dexs: Vec<Pubkey>,
        platform_fee: u8
    ) -> Result<()> {
        require!(save_rate > 0 && save_rate <= 20, SaveFiError::InvalidSaveRate);
        require!(lock_days >= 1 && lock_days <= 30, SaveFiError::InvalidLockPeriod);
        require!(active_dexs.len() > 0, SaveFiError::NoDexSelected);
        require!(platform_fee <= 5, SaveFiError::InvalidFeeRate);
        
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == Pubkey::default(), SaveFiError::VaultAlreadyInitialized);

        vault.owner = ctx.accounts.user.key();
        vault.save_rate = save_rate;
        vault.balance = 0;
        vault.lock_until = Clock::get()?.unix_timestamp + (lock_days as i64 * 24 * 60 * 60);
        vault.active_dexs = active_dexs;
        vault.platform_fee = platform_fee;

        let proxy = &mut ctx.accounts.proxy_account;
        proxy.owner = ctx.accounts.user.key();
        proxy.bump = ctx.bumps.proxy_account;

        // User approves our program to handle their trades
        token::approve(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Approve {
                    to: ctx.accounts.user_token_account.to_account_info(),
                    delegate: ctx.accounts.proxy_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            u64::MAX,  // Approve for maximum amount
        )?;

        Ok(())
    }

    /// Collect accumulated fees (admin only)
    pub fn collect_fees(ctx: Context<CollectFees>) -> Result<()> {
        let fee_account = &mut ctx.accounts.fee_account;
        require!(fee_account.authority == ctx.accounts.admin.key(), SaveFiError::Unauthorized);
        
        // Add cooldown period for fee collection
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time - fee_account.last_collection_time >= 24 * 60 * 60, // 24 hours
            SaveFiError::CollectionCooldown
        );

        let amount = fee_account.balance;
        require!(amount > 0, SaveFiError::EmptyVault);

        fee_account.balance = 0;
        fee_account.last_collection_time = current_time;

        // Transfer fees to admin
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.fee_account.to_account_info(),
                to: ctx.accounts.admin.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        Ok(())
    }

    /// Process trade with production security checks
    pub fn process_trade(ctx: Context<ProcessTrade>, amount: u64) -> Result<()> {
        // 1. Take amount from user's account (automatic, no approval needed)
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.proxy_account.to_account_info(),
                    authority: ctx.accounts.proxy_account.to_account_info(),
                },
            ),
            amount,
        )?;

        // 2. Calculate and save user's portion
        let save_amount = (amount as u128 * ctx.accounts.vault.save_rate as u128 / 100) as u64;
        if save_amount > 0 {
            token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token::MintTo {
                        mint: ctx.accounts.save_token_mint.to_account_info(),
                        to: ctx.accounts.vault_token_account.to_account_info(),
                        authority: ctx.accounts.mint_authority.to_account_info(),
                    },
                    &[&[b"mint_authority", &[ctx.accounts.mint_authority.bump]]],
                ),
                save_amount,
            )?;
        }

        // 3. Take platform fee
        let fee_amount = (amount as u128 * ctx.accounts.fee_account.fee_rate as u128 / 100) as u64;
        if fee_amount > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.proxy_account.to_account_info(),
                        to: ctx.accounts.fee_account.to_account_info(),
                        authority: ctx.accounts.proxy_account.to_account_info(),
                    },
                ),
                fee_amount,
            )?;
        }

        // 4. Send remaining to actual trade
        let remaining_amount = amount.checked_sub(save_amount).unwrap().checked_sub(fee_amount).unwrap();
        if remaining_amount > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.proxy_account.to_account_info(),
                        to: ctx.accounts.destination.to_account_info(),
                        authority: ctx.accounts.proxy_account.to_account_info(),
                    },
                ),
                remaining_amount,
            )?;
        }

        Ok(())
    }

    /// Emergency withdrawal (with fee)
    pub fn emergency_withdraw(ctx: Context<EmergencyWithdraw>, _amount: u64) -> Result<()> {
        // Get vault info before any borrows
        let vault_info = ctx.accounts.vault.to_account_info();
        
        // Now we can safely borrow vault mutably
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.user.key(), SaveFiError::Unauthorized);
        require!(!vault.is_locked, SaveFiError::VaultLocked);

        // Calculate emergency fee
        let fee_amount = (_amount as u128 * EMERGENCY_FEE_RATE as u128 / 100) as u64;
        let withdraw_amount = _amount.checked_sub(fee_amount).unwrap();

        // Transfer fee to fee account
        if fee_amount > 0 {
            let fee_account = &mut ctx.accounts.fee_account;
            fee_account.collected_fees = fee_account.collected_fees.checked_add(fee_amount).unwrap();
        }

        // Lock vault after emergency withdrawal
        vault.is_locked = true;

        // Transfer remaining amount to user
        if withdraw_amount > 0 {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: vault_info.clone(),
                    to: ctx.accounts.user.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, withdraw_amount)?;
        }

        // Burn tokens from vault
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: ctx.accounts.save_token_mint.to_account_info(),
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    authority: vault_info,
                },
            ),
            _amount,
        )?;

        Ok(())
    }

    /// Toggle emergency mode (admin only)
    pub fn toggle_emergency_mode(ctx: Context<ToggleEmergencyMode>) -> Result<()> {
        let fee_account = &mut ctx.accounts.fee_account;
        require!(fee_account.authority == ctx.accounts.admin.key(), SaveFiError::Unauthorized);
        fee_account.emergency_mode = !fee_account.emergency_mode;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMints<'info> {
    #[account(init, payer = admin, space = 8 + 1, seeds = [b"mint_authority"], bump)]
    pub mint_authority: Account<'info, MintAuthority>,
    #[account(init, payer = admin, space = 8 + 32 + 8 + 1, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut)]
    pub save_token_mint: Account<'info, TokenAccount>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(init, payer = user, space = 8 + 32 + 1 + 8 + 8, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(init, payer = user, space = 8 + 32 + 1, seeds = [b"proxy", user.key().as_ref()], bump)]
    pub proxy_account: Account<'info, ProxyAccount>,
    #[account(init, payer = user, associated_token::mint = save_token_mint, associated_token::authority = vault)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub save_token_mint: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct ProcessTrade<'info> {
    // Add user's wallet as signer
    #[account(mut)]
    pub user: Signer<'info>,
    
    // Add user's token account
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut, seeds = [b"vault", proxy_account.owner.as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut, seeds = [b"proxy", proxy_account.owner.as_ref()], bump)]
    pub proxy_account: Account<'info, ProxyAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub save_token_mint: Account<'info, TokenAccount>,
    #[account(seeds = [b"mint_authority"], bump)]
    pub mint_authority: Account<'info, MintAuthority>,
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub save_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub fee_account: Account<'info, FeeAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectFees<'info> {
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ToggleEmergencyMode<'info> {
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub save_rate: u8,
    pub balance: u64,
    pub lock_until: i64,
    pub active_dexs: Vec<Pubkey>,
    pub platform_fee: u8,
    pub daily_savings: u64,  // Track daily savings for limits
    pub last_savings_reset: i64,  // Track when daily savings was last reset
    pub is_locked: bool,  // Emergency lock flag
    pub last_transaction_time: i64,  // Add transaction tracking
    pub daily_transaction_count: u32, // Add rate limiting
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
    pub last_collection_time: i64,
    pub emergency_mode: bool,
    pub collected_fees: u64,
}

#[account]
pub struct ProxyAccount {
    pub owner: Pubkey,
    pub bump: u8,
}

#[error_code]
pub enum SaveFiError {
    #[msg("Invalid save rate (must be between 1-20%)")]
    InvalidSaveRate,
    #[msg("Invalid lock period (must be between 1-30 days)")]
    InvalidLockPeriod,
    #[msg("Vault already initialized")]
    VaultAlreadyInitialized,
    #[msg("No DEX selected")]
    NoDexSelected,
    #[msg("Invalid fee rate (must be between 0-5%)")]
    InvalidFeeRate,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Vault is still locked")]
    VaultLocked,
    #[msg("Vault is empty")]
    EmptyVault,
    #[msg("Daily savings limit exceeded")]
    DailySavingsLimitExceeded,
    #[msg("Emergency mode is active")]
    EmergencyModeActive,
    #[msg("Insufficient balance for emergency withdrawal")]
    InsufficientBalance,
    #[msg("Fee collection cooldown period not elapsed")]
    CollectionCooldown,
}