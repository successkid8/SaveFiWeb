import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorProgram } from '../utils/anchor';
import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createVault, updateSaveRate, getVaultData, withdrawFromVault } from '../utils/anchor';

export const useSaveFi = () => {
  const wallet = useWallet();
  const { program, loading } = useAnchorProgram();
  const [vaultPDA, setVaultPDA] = useState<PublicKey | null>(null);
  const [vaultData, setVaultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Create a new vault
  const createNewVault = useCallback(async (saveRate: number, dexAddresses: PublicKey[]) => {
    if (!program || !wallet.connected) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const result = await createVault(program, wallet, saveRate, dexAddresses);
      if (result.success) {
        setVaultPDA(result.vaultPDA);
        await fetchVaultData();
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [program, wallet]);

  // Update save rate
  const updateVaultSaveRate = useCallback(async (newSaveRate: number) => {
    if (!program || !wallet.connected || !vaultPDA) {
      setError('Wallet not connected or vault not found');
      return { success: false, error: 'Wallet not connected or vault not found' };
    }

    try {
      const result = await updateSaveRate(program, wallet, vaultPDA, newSaveRate);
      if (result.success) {
        await fetchVaultData();
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [program, wallet, vaultPDA]);

  // Fetch vault data
  const fetchVaultData = useCallback(async () => {
    if (!program || !vaultPDA) {
      return { success: false, error: 'Program or vault not initialized' };
    }

    try {
      const result = await getVaultData(program, vaultPDA);
      if (result.success) {
        setVaultData(result.vault);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [program, vaultPDA]);

  // Withdraw from vault
  const withdraw = useCallback(async (amount: number) => {
    if (!program || !wallet.connected || !vaultPDA) {
      setError('Wallet not connected or vault not found');
      return { success: false, error: 'Wallet not connected or vault not found' };
    }

    try {
      const result = await withdrawFromVault(program, wallet, vaultPDA, amount);
      if (result.success) {
        await fetchVaultData();
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [program, wallet, vaultPDA, fetchVaultData]);

  return {
    loading,
    error,
    vaultData,
    vaultPDA,
    createNewVault,
    updateVaultSaveRate,
    fetchVaultData,
    withdraw,
  };
}; 