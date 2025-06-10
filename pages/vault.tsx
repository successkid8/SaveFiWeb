import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useAnchorProgram, getVaultData, withdraw, setLockPeriod } from '../utils/anchor';
import { getVaultPDA } from '../utils/program';
import { PublicKey } from '@solana/web3.js';

export default function Vault() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { program, loading } = useAnchorProgram();
  const [mounted, setMounted] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [lockPeriod, setLockPeriod] = useState(0);
  const [nextUnlock, setNextUnlock] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [saveRate, setSaveRate] = useState(0);
  const [vaultPDA, setVaultPDA] = useState<PublicKey | null>(null);
  const [extendLockDays, setExtendLockDays] = useState(7);

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
          setVaultPDA(pda);
          
          const { success, vault } = await getVaultData(program, pda);
          if (success && vault) {
            setTotalBalance(vault.balance.toNumber() / 1e9); // Convert from lamports to SOL
            setLockPeriod(vault.lockPeriod);
            setNextUnlock(new Date(vault.lockUntil.toNumber() * 1000));
            setIsLocked(vault.isLocked);
            setSaveRate(vault.saveRate);
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

  const handleWithdraw = async () => {
    if (!isLocked && totalBalance > 0 && program && publicKey && vaultPDA) {
      try {
        const { success, tx } = await withdraw(
          program,
          { publicKey },
          vaultPDA,
          totalBalance * 1e9 // Convert from SOL to lamports
        );
        
        if (success) {
          // Refresh vault data
          const { vault } = await getVaultData(program, vaultPDA);
          if (vault) {
            setTotalBalance(vault.balance.toNumber() / 1e9);
            setIsLocked(vault.isLocked);
          }
        }
      } catch (error) {
        console.error('Error withdrawing:', error);
      }
    }
  };

  const handleExtendLock = async () => {
    if (extendLockDays >= 1 && extendLockDays <= 30 && program && publicKey && vaultPDA) {
      try {
        const { success, tx } = await setLockPeriod(
          program,
          { publicKey },
          vaultPDA,
          extendLockDays
        );
        
        if (success) {
          // Refresh vault data
          const { vault } = await getVaultData(program, vaultPDA);
          if (vault) {
            setLockPeriod(vault.lockPeriod);
            setNextUnlock(new Date(vault.lockUntil.toNumber() * 1000));
          }
        }
      } catch (error) {
        console.error('Error extending lock period:', error);
      }
    }
  };

  if (!mounted || loading) return null;

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
          {/* Vault Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Your Vault</h1>
            <p className="text-xl text-gray-300">Manage your savings and withdrawals</p>
          </div>

          {/* Vault Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Total Balance</h3>
              <p className="text-2xl md:text-3xl font-bold text-blue-400">{totalBalance} SOL</p>
              <p className="text-sm text-gray-400 mt-2">Total amount saved</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Lock Period</h3>
              <p className="text-2xl md:text-3xl font-bold text-purple-400">{lockPeriod} days</p>
              <p className="text-sm text-gray-400 mt-2">Current lock period</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Next Unlock</h3>
              <p className="text-2xl md:text-3xl font-bold text-green-400">
                {nextUnlock ? nextUnlock.toLocaleDateString() : '-'}
              </p>
              <p className="text-sm text-gray-400 mt-2">Available for withdrawal</p>
            </div>
          </div>

          {/* Vault Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Vault Settings</h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Save Rate</h3>
                  <p className="text-gray-400">Current save rate: {saveRate}%</p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={saveRate}
                  onChange={(e) => setSaveRate(Number(e.target.value))}
                  className="bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-32"
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Extend Lock Period</h3>
                  <p className="text-gray-400">Add days to lock period</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={extendLockDays}
                    onChange={(e) => setExtendLockDays(Number(e.target.value))}
                    className="bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-32"
                  />
                  <button
                    onClick={handleExtendLock}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Extend
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Withdrawal</h2>
            {totalBalance > 0 ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Available Balance</h3>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">{totalBalance} SOL</p>
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={isLocked}
                    className={`${
                      isLocked
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    } text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 w-full md:w-auto`}
                  >
                    {isLocked ? 'Locked' : 'Withdraw All'}
                  </button>
                </div>
                {isLocked && (
                  <div className="bg-gray-700/50 rounded-xl p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Locked Funds</h3>
                    <p className="text-gray-400">Your funds are locked until {nextUnlock?.toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No funds available for withdrawal</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
} 