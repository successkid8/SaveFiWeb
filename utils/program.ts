import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import idlJson from '../target/idl/savefi.json';

// Program ID
export const PROGRAM_ID = new PublicKey('2Q4yUWhagMoXvij3YN7uutUUJ9kvXGs9TwX2fh6YEkZu');

// Initialize program
export const getProgram = (connection: Connection, wallet: any) => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return new Program(idlJson as any, PROGRAM_ID, provider);
};

// Vault PDA
export const getVaultPDA = (user: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), user.toBuffer()],
    PROGRAM_ID
  );
};

// Proxy Account PDA
export const getProxyAccountPDA = (user: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('proxy'), user.toBuffer()],
    PROGRAM_ID
  );
};

// Fee Account PDA
export const getFeeAccountPDA = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('fee_account')],
    PROGRAM_ID
  );
};

// Mint Authority PDA
export const getMintAuthorityPDA = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mint_authority')],
    PROGRAM_ID
  );
}; 