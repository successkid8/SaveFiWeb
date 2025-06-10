import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorProgram } from '../utils/anchor';
import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { initializeVault, getVaultData, withdraw } from '../utils/anchor';

export const useSaveFi = () => {
  const wallet = useWallet();
  const { program, loading } = useAnchorProgram();
  const [vaultPDA, setVaultPDA] = useState<PublicKey | null>(null);
  const [vaultData, setVaultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Create a new vault
  const createVault = useCallback(async (saveRate: number, lockDays: number) => {
    if (!wallet.connected || !program) return;
    setActionLoading(true);
    try {
      const result = await initializeVault(program, wallet.publicKey, saveRate, lockDays);
      if (result.success) {
        // (initializeVault returns { success: boolean }, so no vaultPDA is returned)
      }
    } catch (err) {
      console.error("Error creating vault:", err);
    } finally { setActionLoading(false); }
  }, [wallet, program]);

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
  const withdrawFromVault = useCallback(async (vaultPDA: PublicKey) => {
    if (!wallet.connected || !program) return;
    setActionLoading(true);
    try {
      const result = await withdraw(program, vaultPDA);
      if (result.success) {
        await fetchVaultData();
      }
    } catch (err) {
      console.error("Error withdrawing from vault:", err);
    } finally { setActionLoading(false); }
  }, [wallet, program, fetchVaultData]);

  return {
    loading,
    actionLoading,
    error,
    vaultData,
    vaultPDA,
    createVault,
    fetchVaultData,
    withdrawFromVault,
  };
}; 