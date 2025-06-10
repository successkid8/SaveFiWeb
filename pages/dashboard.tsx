import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useAnchorProgram, getVaultData } from '../utils/anchor';
import { getVaultPDA } from '../utils/program';
import { PublicKey } from '@solana/web3.js';
import { FaChartLine, FaWallet, FaHistory, FaExchangeAlt } from 'react-icons/fa';

interface VaultData {
  saveRate: number;
  lockPeriod: number;
  balance: number;
  lastSaveTime: number;
}

const Dashboard = () => {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { program, loading } = useAnchorProgram();
  const [mounted, setMounted] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [saveRate, setSaveRate] = useState(0);
  const [lastSave, setLastSave] = useState<Date | null>(null);
  const [totalTrades, setTotalTrades] = useState(0);
  const [totalSwaps, setTotalSwaps] = useState(0);
  const [dexStats, setDexStats] = useState({
    raydium: 0,
    orca: 0,
    jupiter: 0,
    serum: 0,
    pumpfun: 0
  });
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  useEffect(() => {
    const fetchVaultData = async () => {
      if (program && publicKey) {
        try {
          const [pda] = getVaultPDA(publicKey);
          const { success, vault } = await getVaultData(program, pda);
          if (success && vault) {
            setTotalSaved(vault.balance.toNumber() / 1e9); // Convert from lamports to SOL
            setSaveRate(vault.saveRate);
            setLastSave(new Date(vault.lastDepositTime.toNumber() * 1000));
            setTotalTrades(vault.dailyTransactionCount);
            // TODO: Implement DEX stats tracking
          }
        } catch (error) {
          console.error('Error fetching vault data:', error);
        }
      }
    };

    if (!loading) {
      fetchVaultData();
    }
  }, [program, publicKey, loading]);

  useEffect(() => {
    const fetchVaultData = async () => {
      if (!publicKey) return;

      try {
        setLoading(true);
        const program = getProgram(connection);
        const [vaultPDA] = await PublicKey.findProgramAddress(
          [Buffer.from('vault'), publicKey.toBuffer()],
          program.programId
        );

        const { success, vault } = await program.account.vault.fetch(vaultPDA);
        if (success && vault) {
          setVaultData({
            saveRate: vault.saveRate.toNumber(),
            lockPeriod: vault.lockPeriod.toNumber(),
            balance: vault.balance.toNumber(),
            lastSaveTime: vault.lastSaveTime.toNumber(),
          });
        }
      } catch (err) {
        console.error('Error fetching vault data:', err);
        setError('Failed to fetch vault data');
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [publicKey, connection]);

  if (!mounted || loading) return null;

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Connect your wallet to view your dashboard</h2>
        <p className="text-foreground/60">Please connect your wallet to access your savings information</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Error</h2>
        <p className="text-foreground/60">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaWallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground/60">Total Saved</h3>
                  <p className="text-2xl font-semibold text-foreground">{vaultData?.balance || 0} SOL</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <FaChartLine className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground/60">Save Rate</h3>
                  <p className="text-2xl font-semibold text-foreground">{vaultData?.saveRate || 0}%</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaHistory className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground/60">Last Save</h3>
                  <p className="text-2xl font-semibold text-foreground">
                    {vaultData?.lastSaveTime ? new Date(vaultData.lastSaveTime * 1000).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DEX Statistics */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">DEX Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🦅</span>
                  <h3 className="text-lg font-bold text-white">Raydium</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold text-blue-400">{dexStats.raydium} SOL</p>
                <p className="text-sm text-gray-400">Saved from swaps</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🐋</span>
                  <h3 className="text-lg font-bold text-white">Orca</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold text-purple-400">{dexStats.orca} SOL</p>
                <p className="text-sm text-gray-400">Saved from swaps</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-lg font-bold text-white">Jupiter</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold text-green-400">{dexStats.jupiter} SOL</p>
                <p className="text-sm text-gray-400">Saved from swaps</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">💉</span>
                  <h3 className="text-lg font-bold text-white">Serum</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold text-yellow-400">{dexStats.serum} SOL</p>
                <p className="text-sm text-gray-400">Saved from swaps</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🚀</span>
                  <h3 className="text-lg font-bold text-white">PumpFun</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold text-red-400">{dexStats.pumpfun} SOL</p>
                <p className="text-sm text-gray-400">Saved from swaps</p>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">User Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Trades</h3>
                <p className="text-3xl font-bold text-white">{totalTrades}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Swaps</h3>
                <p className="text-3xl font-bold text-white">{totalSwaps}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard; 