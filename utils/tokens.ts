import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Token-2022 Program ID
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

// SaveSOL token mint (replace with actual mint address)
export const SAVESOL_MINT = new PublicKey('11111111111111111111111111111111');
export const SAVESOL_DECIMALS = 9;

// Utility functions
export const getTokenProgramId = (isToken2022: boolean) => {
  return isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
};

export const getAssociatedTokenAddress = async (
  mint: PublicKey,
  owner: PublicKey,
  isToken2022: boolean = false
): Promise<PublicKey> => {
  const [address] = await PublicKey.findProgramAddress(
    [
      owner.toBuffer(),
      getTokenProgramId(isToken2022).toBuffer(),
      mint.toBuffer(),
    ],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  );
  return address;
};

export const formatTokenBalance = (balance: number, decimals: number): string => {
  return (balance / Math.pow(10, decimals)).toFixed(decimals);
};

export const convertToTokenAmount = (amount: number, decimals: number): number => {
  return amount * Math.pow(10, decimals);
};

export const isValidTokenAmount = (amount: number, decimals: number): boolean => {
  return amount >= 0 && amount <= Math.pow(2, 64) - 1;
};

export const isToken2022Mint = (mint: PublicKey): boolean => {
  return mint.equals(SAVESOL_MINT);
}; 