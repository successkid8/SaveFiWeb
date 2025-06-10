use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, MintTo, Token, TokenAccount},
};

declare_id!("9EMHk6auGYrXY8N6n5bVbiGj9AsHcWQCci3ctTH4uUUi"); 

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
    pub fn initialize_vault(ctx: Context<InitializeVault>, save_rate: u8, lock_days: u8) -> Result<()> {
        require!(save_rate > 0 && save_rate <= 20, SaveFiError::InvalidSaveRate);
        require!(lock_days >= 1 && lock_days <= 30, SaveFiError::InvalidLockPeriod);
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == Pubkey::default(), SaveFiError::VaultAlreadyInitialized);

        vault.owner = ctx.accounts.user.key();
        vault.save_rate = save_rate;
        vault.balance = 0;
        vault.lock_until = Clock::get()?.unix_timestamp + (lock_days as i64 * 24 * 60 * 60);

        let proxy = &mut ctx.accounts.proxy_account;
        proxy.owner = ctx.accounts.user.key();
        proxy.bump = ctx.bumps.proxy_account;

        Ok(())
    }

    /// Process trade (buy or sell) with automatic deductions
    pub fn process_trade(ctx: Context<ProcessTrade>, trade_amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.proxy_account.owner, SaveFiError::Unauthorized);

        // 1-20% savings
        let save_amount = (trade_amount as u128 * vault.save_rate as u128 / 100) as u64;
        if save_amount > 0 {
            token::mint_to(
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
        }

        // 0-5% admin-set fee
        let fee_account = &mut ctx.accounts.fee_account;
        let fee_amount = (trade_amount as u128 * fee_account.fee_rate as u128 / 100) as u64;
        if fee_amount > 0 {
            fee_account.balance += fee_amount; // Update balance first
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.proxy_account.to_account_info(),
                    to: ctx.accounts.fee_account.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, fee_amount)?;
        }

        // Transfer remaining SOL to user (sell) or DEX pool (buy)
        let remaining_amount = trade_amount.checked_sub(save_amount).unwrap().checked_sub(fee_amount).unwrap();
        if remaining_amount > 0 {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.proxy_account.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, remaining_amount)?;
        }

        Ok(())
    }

    /// Withdraw savings after lock period
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.owner == ctx.accounts.user.key(), SaveFiError::Unauthorized);
        require!(
            Clock::get()?.unix_timestamp >= vault.lock_until,
            SaveFiError::VaultLocked
        );
        let amount = vault.balance;
        require!(amount > 0, SaveFiError::EmptyVault);

        vault.balance = 0; // Update balance first
        token::burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.save_token_mint.to_account_info(),
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                &[&[b"vault".as_ref(), ctx.accounts.user.key.as_ref(), &[ctx.bumps.vault]]],
            ),
            amount,
        )?;

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;
        
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
    pub save_token_mint: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct ProcessTrade<'info> {
    #[account(mut, seeds = [b"vault", proxy_account.owner.as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut, seeds = [b"proxy", proxy_account.owner.as_ref()], bump)]
    pub proxy_account: Account<'info, ProxyAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub save_token_mint: Account<'info, TokenAccount>,
    #[account(seeds = [b"mint_authority"], bump = mint_authority.bump)]
    pub mint_authority: Account<'info, MintAuthority>,
    #[account(mut, seeds = [b"fee_account"], bump)]
    pub fee_account: Account<'info, FeeAccount>,
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub save_token_mint: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub save_rate: u8,
    pub balance: u64,
    pub lock_until: i64,
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
}