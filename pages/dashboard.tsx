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

interface VaultData {
  saveRate: number;
  lockPeriod: number;
  balance: number;
  lastSaveTime: number;
}

// Define icons object with inline SVGs
const icons = {
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-7-2a5 5 0 100-10 5 5 0 000 10z" />
    </svg>
  ),
  wallet: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm14 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  ),
  history: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  exchange: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
};

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
    const initializeProgram = async () => {
      if (!publicKey) return;
      try {
        // Initialize program here
        // const newProgram = await getProgram();
        // setProgram(newProgram);
      } catch (error) {
        console.error('Error initializing program:', error);
        setError('Failed to initialize program');
      }
    };

    initializeProgram();
  }, [publicKey]);

  useEffect(() => {
    const fetchVaultData = async () => {
      if (!publicKey || !program) return;
      try {
        // Fetch vault data using program
        // const data = await program.account.vault.fetch(vaultPDA);
        // setVaultData(data);
      } catch (err) {
        console.error('Error fetching vault data:', err);
        setError('Failed to fetch vault data');
      }
    };

    fetchVaultData();
  }, [program, publicKey]);

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
                  {icons.wallet}
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
                  {icons.chart}
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
                  {icons.history}
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