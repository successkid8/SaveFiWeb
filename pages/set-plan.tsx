import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import Head from 'next/head';
import Link from 'next/link';
import idl from '../idl/savefi.json';
import SharedWalletButton from '../components/SharedWalletButton';

// Keep dummy program ID for now
const programID = new PublicKey('11111111111111111111111111111111');

// Example save rates with descriptions
const SAVE_RATES = [
  { value: 5, label: '5%', description: 'Conservative - Save a small portion of each trade' },
  { value: 10, label: '10%', description: 'Balanced - Recommended for most traders' },
  { value: 15, label: '15%', description: 'Aggressive - Save more for faster growth' },
  { value: 20, label: '20%', description: 'Very Aggressive - Maximum savings rate' },
];

// Example lock periods
const LOCK_PERIODS = [
  { value: 30, label: '1 Month', description: 'Short-term lock for flexibility' },
  { value: 90, label: '3 Months', description: 'Medium-term for better rewards' },
  { value: 180, label: '6 Months', description: 'Long-term for maximum rewards' },
];

// Example daily volumes
const DAILY_VOLUMES = [
  { value: 1000, label: '$1K', description: 'Small trader' },
  { value: 5000, label: '$5K', description: 'Medium trader' },
  { value: 10000, label: '$10K', description: 'Active trader' },
  { value: 50000, label: '$50K', description: 'Professional trader' },
];

// Create a wrapper for the wallet adapter to match Anchor's expected type
const getAnchorWallet = (wallet: any) => {
  if (!wallet) return null;
  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };
};

const SetPlan = () => {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [saveRate, setSaveRate] = useState<number>(5);
  const [lockPeriod, setLockPeriod] = useState<number>(30);
  const [dailyVolume, setDailyVolume] = useState(5000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Calculate estimated monthly savings
  const calculateMonthlySavings = () => {
    const dailySavings = (dailyVolume * saveRate) / 100;
    const monthlySavings = dailySavings * 30;
    return monthlySavings.toFixed(2);
  };

  // Calculate estimated annual rewards
  const calculateAnnualRewards = () => {
    const monthlySavings = parseFloat(calculateMonthlySavings());
    const baseAPY = 5; // Base APY of 5%
    const lockPeriodMultiplier = lockPeriod / 30; // Additional APY based on lock period
    const totalAPY = baseAPY + lockPeriodMultiplier;
    const annualRewards = (monthlySavings * 12 * totalAPY) / 100;
    return annualRewards.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const anchorWallet = getAnchorWallet(wallet);
      if (!anchorWallet) {
        throw new Error('Wallet not properly initialized');
      }

      const provider = new AnchorProvider(connection, anchorWallet, {});
      const program = new Program(idl as any, programID, provider);

      const [vaultPda] = await PublicKey.findProgramAddress(
        [Buffer.from('vault'), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .createVault(new BN(saveRate), new BN(lockPeriod))
        .accounts({
          vault: vaultPda,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      setTxHash(tx);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating vault:', err);
      let errorMessage = 'Failed to create vault';
      
      if (err instanceof Error) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL for transaction fees. Please fund your wallet.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-8">Connect Your Wallet</h1>
          <p className="text-xl text-gray-300 mb-12">
            Please connect your wallet to set up your savings plan.
          </p>
          <SharedWalletButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-full !px-8 !py-3 !text-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20">
      <Head>
        <title>Set Your Save Plan - SaveFi</title>
        <meta name="description" content="Configure your automatic savings plan with SaveFi" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Set Your Save Plan</h1>
          <p className="text-xl text-gray-300">
            Configure how much you want to save from each trade
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Vault Created Successfully!</h2>
            <p className="text-gray-300 mb-4">
              Your savings plan is now active. {saveRate}% of each trade will be automatically saved.
            </p>
            {txHash && (
              <p className="text-sm text-gray-400 mb-8">
                Transaction: {txHash.slice(0, 8)}...{txHash.slice(-8)}
              </p>
            )}
            <Link
              href="/dashboard"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Daily Volume Selection */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Select Daily Trading Volume</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {DAILY_VOLUMES.map((volume) => (
                  <button
                    key={volume.value}
                    onClick={() => setDailyVolume(volume.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      dailyVolume === volume.value
                        ? 'bg-purple-600 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <div className="text-2xl font-bold mb-2">{volume.label}</div>
                    <div className="text-sm text-gray-400">{volume.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Rate Selection */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Select Save Rate</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SAVE_RATES.map((rate) => (
                  <button
                    key={rate.value}
                    onClick={() => setSaveRate(rate.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      saveRate === rate.value
                        ? 'bg-purple-600 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <div className="text-2xl font-bold mb-2">{rate.label}</div>
                    <div className="text-sm text-gray-400">{rate.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lock Period Selection */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Select Lock Period</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LOCK_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setLockPeriod(period.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      lockPeriod === period.value
                        ? 'bg-purple-600 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <div className="text-2xl font-bold mb-2">{period.label}</div>
                    <div className="text-sm text-gray-400">{period.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Plan Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Daily Volume:</span>
                  <span className="font-semibold">${dailyVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Save Rate:</span>
                  <span className="font-semibold">{saveRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Lock Period:</span>
                  <span className="font-semibold">{lockPeriod} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Savings:</span>
                  <span className="font-semibold text-green-400">${calculateMonthlySavings()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Estimated Annual Rewards:</span>
                  <span className="font-semibold text-green-400">${calculateAnnualRewards()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Effective APY:</span>
                  <span className="font-semibold text-green-400">
                    {(5 + (lockPeriod / 30)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Vault...
                </div>
              ) : (
                'Create Vault'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetPlan;