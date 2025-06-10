import { AnchorProvider, Program, web3, Idl } from '@project-serum/anchor';
import { useWallet, useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, TransactionSignature } from '@solana/web3.js';
import { useState, useEffect, useMemo } from 'react';
import idlJson from '../target/idl/savefi.json';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { PROGRAM_ID } from './program';
import { Savefi } from '../target/types/savefi';

// Create a proper IDL object
const idl: Idl = {
  version: idlJson.metadata.version,
  name: idlJson.metadata.name,
  instructions: idlJson.instructions.map((ix: any) => ({
    name: ix.name,
    accounts: ix.accounts.map((acc: any) => ({
      name: acc.name,
      isMut: acc.writable,
      isSigner: acc.signer || false,
      ...(acc.pda && {
        pda: {
          seeds: acc.pda.seeds.map((seed: any) => ({
            kind: seed.kind,
            ...(seed.value && { value: seed.value }),
            ...(seed.path && { path: seed.path })
          }))
        }
      })
    })),
    args: ix.args.map((arg: any) => ({
      name: arg.name,
      type: arg.type
    }))
  })),
  accounts: idlJson.accounts.map((acc: any) => ({
    name: acc.name,
    type: {
      kind: "struct",
      fields: acc.type?.fields?.map((field: any) => ({
        name: field.name,
        type: field.type
      })) || []
    }
  })),
  errors: idlJson.errors.map((err: any) => ({
    code: err.code,
    name: err.name,
    msg: err.msg
  })),
  metadata: {
    address: PROGRAM_ID.toString(),
    ...idlJson.metadata
  }
};

// Helper function to safely create PublicKey from environment variable
const getPublicKeyFromEnv = (envVar: string | undefined, fallback: string): PublicKey => {
  try {
    return new PublicKey(envVar || fallback);
  } catch (error) {
    console.warn(`Invalid public key for ${envVar}, using fallback`);
    return new PublicKey(fallback);
  }
};

// Constants with fallback values
export const SAVESOL_MINT = getPublicKeyFromEnv(
  process.env.NEXT_PUBLIC_SAVE_TOKEN_MINT,
  '11111111111111111111111111111111'
);

export const CONFIG_PDA = getPublicKeyFromEnv(
  process.env.NEXT_PUBLIC_CONFIG_PDA,
  '11111111111111111111111111111111'
);

export const ADMIN_PUBKEY = getPublicKeyFromEnv(
  process.env.NEXT_PUBLIC_ADMIN_PUBKEY,
  '11111111111111111111111111111111'
);

// Initialize the Anchor provider
export const getProvider = (connection: Connection, wallet: any) => {
  return new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
};

// Initialize the program
export const getProgram = (provider: AnchorProvider) => {
  return new Program(idl, PROGRAM_ID, provider);
};

// Initialize vault
export async function initializeVault(
  program: Program<Idl>,
  user: PublicKey,
  savingsRate: number,
  lockDays: number
): Promise<{ success: boolean }> {
  try {
    const tx = await program.methods
      .initializeVault(savingsRate, lockDays)
      .accounts({
        vault: await getVaultPDA(user),
        proxyAccount: await getProxyPDA(user),
        vaultTokenAccount: await getAssociatedTokenAddress(user, SAVESOL_MINT),
        saveTokenMint: SAVESOL_MINT,
        user,
        config: CONFIG_PDA,
        admin: ADMIN_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    return { success: true };
  } catch (error) {
    console.error('Error initializing vault:', error);
    return { success: false };
  }
}

// Set save rate
export const setSaveRate = async (
  program: Program,
  wallet: any,
  vaultPDA: PublicKey,
  newSaveRate: number
) => {
  try {
    const tx = await program.methods
      .setSaveRate(newSaveRate)
      .accounts({
        vault: vaultPDA,
        user: wallet.publicKey,
      })
      .rpc();

    return { success: true, tx };
  } catch (error) {
    console.error('Error setting save rate:', error);
    return { success: false, error };
  }
};

// Set lock period
export const setLockPeriod = async (
  program: Program,
  wallet: any,
  vaultPDA: PublicKey,
  lockDays: number
) => {
  try {
    const tx = await program.methods
      .setLockPeriod(lockDays)
      .accounts({
        vault: vaultPDA,
        user: wallet.publicKey,
      })
      .rpc();

    return { success: true, tx };
  } catch (error) {
    console.error('Error setting lock period:', error);
    return { success: false, error };
  }
};

// Get vault data
export const getVaultData = async (program: Program, vaultPDA: PublicKey) => {
  try {
    const vault = await program.account.vault.fetch(vaultPDA);
    return { success: true, vault };
  } catch (error) {
    console.error('Error fetching vault data:', error);
    return { success: false, error };
  }
};

// Withdraw from vault
export async function withdraw(
  program: Program<Idl>,
  vaultPDA: PublicKey
): Promise<{ success: boolean }> {
  try {
    const tx = await program.methods
      .withdraw()
      .accounts({
        vault: vaultPDA,
        user: program.provider.publicKey,
        vaultTokenAccount: await getAssociatedTokenAddress(program.provider.publicKey, SAVESOL_MINT),
        saveTokenMint: SAVESOL_MINT,
        config: CONFIG_PDA,
        admin: ADMIN_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return { success: true };
  } catch (error) {
    console.error('Error withdrawing:', error);
    return { success: false };
  }
}

// Emergency withdraw
export const emergencyWithdraw = async (
  program: Program,
  wallet: any,
  vaultPDA: PublicKey,
  amount: number
) => {
  try {
    const [feeAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('fee_account')],
      program.programId
    );

    const tx = await program.methods
      .emergencyWithdraw(amount)
      .accounts({
        vault: vaultPDA,
        user: wallet.publicKey,
        vaultTokenAccount: await getAssociatedTokenAddress(
          wallet.publicKey,
          new PublicKey(process.env.NEXT_PUBLIC_SAVE_TOKEN_MINT!)
        ),
        saveTokenMint: new PublicKey(process.env.NEXT_PUBLIC_SAVE_TOKEN_MINT!),
        feeAccount: feeAccountPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { success: true, tx };
  } catch (error) {
    console.error('Error emergency withdrawing from vault:', error);
    return { success: false, error };
  }
};

// Simulate a DEX trade for testing
export const simulateDexTrade = async (
  program: Program,
  wallet: any,
  amount: number,
  dexType: 'raydium' | 'orca' | 'jupiter' | 'serum' | 'pumpfun'
) => {
  try {
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [proxyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('proxy'), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [feeAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('fee_account')],
      program.programId
    );

    const tx = await program.methods
      .processTrade(amount)
      .accounts({
        vault: vaultPDA,
        proxyAccount: proxyPDA,
        feeAccount: feeAccountPDA,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { success: true, tx };
  } catch (error) {
    console.error('Error simulating DEX trade:', error);
    return { success: false, error };
  }
};

// Hook for using Anchor program
export const useAnchorProgram = () => {
  const wallet = useWallet();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initProgram = async () => {
      if (wallet.connected) {
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com');
        const provider = getProvider(connection, wallet);
        const program = getProgram(provider);
        setProgram(program);
      }
      setLoading(false);
    };

    initProgram();
  }, [wallet.connected]);

  return { program, loading };
};

// Derive vault PDA
export async function getVaultPDA(user: PublicKey): Promise<PublicKey> {
    const [vault] = await PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), user.toBuffer()],
        new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
    );
    return vault;
}

// Derive proxy account PDA
export async function getProxyPDA(user: PublicKey): Promise<PublicKey> {
    const [proxyAccount] = await PublicKey.findProgramAddressSync(
        [Buffer.from("proxy"), user.toBuffer()],
        new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
    );
    return proxyAccount;
}

// Update vault settings
export async function updateVault(
  program: Program<Idl>,
  vaultPDA: PublicKey,
  newSavingsRate: number,
  newLockDays: number
): Promise<{ success: boolean }> {
  try {
    const tx = await program.methods
      .updateVault(newSavingsRate, newLockDays)
      .accounts({
        vault: vaultPDA,
        user: program.provider.publicKey,
        config: CONFIG_PDA,
        admin: ADMIN_PUBKEY,
      })
      .rpc();
    return { success: true };
  } catch (error) {
    console.error('Error updating vault:', error);
    return { success: false };
  }
} 