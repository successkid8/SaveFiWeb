import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { getProgram, initializeVault } from '../utils/anchor';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaLock, FaInfoCircle, FaExchangeAlt, FaPiggyBank, FaWallet } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getVaultPDA, getProxyAccountPDA } from '../utils/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import Link from 'next/link';

const PROGRAM_CONSTANTS = {
    // Delegation limits
    MAX_DELEGATION_SOL: 5,
    MIN_DELEGATION_SOL: 0.001,
    DAILY_LIMIT_SOL: 50,
    
    // Lock periods
    MIN_LOCK_DAYS: 1,
    MAX_LOCK_DAYS: 30,
    
    // Savings rates
    MIN_SAVE_RATE: 1,
    MAX_SAVE_RATE: 20,
    
    // Fee rates
    MIN_FEE_RATE: 0,
    MAX_FEE_RATE: 5,
    
    // Subscription
    SUBSCRIPTION_FEE_SOL: 0.25,
    SUBSCRIPTION_PERIOD_DAYS: 7,
    
    // Cooldown
    DELEGATION_COOLDOWN_HOURS: 1
};

const SetPlan = () => {
  const { publicKey: wallet, wallet: walletAdapter } = useWallet();
  const { connection } = useConnection();
  const [saveRate, setSaveRate] = useState(10);
  const [lockDays, setLockDays] = useState(7);
  const [previewAmount, setPreviewAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'initializing' | 'delegating'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [platformFee, setPlatformFee] = useState(2);
  const [maxDelegationAmount, setMaxDelegationAmount] = useState(5);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const router = useRouter();

  const handleLockDaysChange = (days: number) => {
    setLockDays(days);
    setMaxDelegationAmount(PROGRAM_CONSTANTS.MAX_DELEGATION_SOL);
  };

  const handleDelegationAmountChange = (amount: number) => {
    if (amount < lockDays) {
      setShowLockWarning(true);
    } else {
      setShowLockWarning(false);
    }
    setMaxDelegationAmount(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !connection) {
        setError('Please connect your wallet first');
        return;
    }

    try {
        setLoading(true);
        setLoadingStep('initializing');
        setError(null);
        setSuccess(null);
        setTxHash(null);

        // Validate inputs with specific error messages
        if (saveRate < PROGRAM_CONSTANTS.MIN_SAVE_RATE || saveRate > PROGRAM_CONSTANTS.MAX_SAVE_RATE) {
            throw new Error(`Save rate must be between ${PROGRAM_CONSTANTS.MIN_SAVE_RATE}-${PROGRAM_CONSTANTS.MAX_SAVE_RATE}%`);
        }
        if (lockDays < PROGRAM_CONSTANTS.MIN_LOCK_DAYS || lockDays > PROGRAM_CONSTANTS.MAX_LOCK_DAYS) {
            throw new Error(`Lock period must be between ${PROGRAM_CONSTANTS.MIN_LOCK_DAYS}-${PROGRAM_CONSTANTS.MAX_LOCK_DAYS} days`);
        }

        // Initialize vault through Anchor program
        const provider = new AnchorProvider(connection, walletAdapter as any, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
        });
        const program = getProgram(provider);
        
        // Get PDAs
        const [vault] = await PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), wallet.toBuffer()],
            program.programId
        );
        const [proxyAccount] = await PublicKey.findProgramAddressSync(
            [Buffer.from("proxy"), wallet.toBuffer()],
            program.programId
        );

        // Get vault token account
        const vaultTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(process.env.NEXT_PUBLIC_SAVE_TOKEN_MINT!),
            vault,
            true
        );

        // Call initialize_vault
        const tx = await program.methods
            .initializeVault(
                new BN(saveRate),
                new BN(lockDays)
            )
            .accounts({
                vault: vault,
                proxyAccount: proxyAccount,
                vaultTokenAccount: vaultTokenAccount,
                saveTokenMint: new PublicKey(process.env.NEXT_PUBLIC_SAVE_TOKEN_MINT!),
                user: wallet,
                config: new PublicKey(process.env.NEXT_PUBLIC_CONFIG_ACCOUNT!),
                admin: new PublicKey(process.env.NEXT_PUBLIC_ADMIN_ACCOUNT!),
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .rpc();

        setTxHash(tx);
        setSuccess('Vault created successfully!');
        
        // Wait for confirmation
        await connection.confirmTransaction(tx, 'confirmed');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);

    } catch (err) {
        console.error('Error creating vault:', err);
        let errorMessage = 'Failed to create vault';
        
        if (err instanceof Error) {
            // Handle specific Anchor errors
            if (err.message.includes('VaultAlreadyInitialized')) {
                errorMessage = 'You already have a vault. Please use your existing vault.';
            } else if (err.message.includes('InvalidSaveRate')) {
                errorMessage = `Save rate must be between ${PROGRAM_CONSTANTS.MIN_SAVE_RATE}-${PROGRAM_CONSTANTS.MAX_SAVE_RATE}%`;
            } else if (err.message.includes('InvalidLockPeriod')) {
                errorMessage = `Lock period must be between ${PROGRAM_CONSTANTS.MIN_LOCK_DAYS}-${PROGRAM_CONSTANTS.MAX_LOCK_DAYS} days`;
            } else {
                errorMessage = err.message;
            }
        }
        
        setError(errorMessage);
    } finally {
        setLoading(false);
        setLoadingStep('idle');
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold text-white mb-4">Connect your wallet to set your savings plan</h2>
          <p className="text-gray-300">Please connect your wallet to continue</p>
        </div>
        <Footer />
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
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Set Your Save Plan</h1>
            <p className="text-xl text-gray-300">Configure your automated savings strategy</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Save Rate Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaPiggyBank className="text-purple-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Save Rate
                        </h3>
                        <p className="text-sm text-gray-400">How much to save from each trade</p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Save Rate: {saveRate}%</span>
                        <span className="text-purple-400">{saveRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={saveRate}
                        onChange={(e) => setSaveRate(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-gray-400 text-sm mt-2">
                        <span>1%</span>
                        <span>20%</span>
                    </div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-gray-300">
                        <span className="text-purple-400 font-medium">Example:</span> On a 1 SOL trade, you'll save {(1 * saveRate / 100).toFixed(2)} SOL
                    </p>
                </div>
            </motion.div>

            {/* Lock Period Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaLock className="text-blue-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Lock Period
                        </h3>
                        <p className="text-sm text-gray-400">How long to lock your savings</p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Lock Period: {lockDays} days</span>
                        <span className="text-blue-400">{lockDays} days</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={lockDays}
                        onChange={(e) => handleLockDaysChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-gray-400 text-sm mt-2">
                        <span>1 day</span>
                        <span>30 days</span>
                    </div>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-gray-300">
                        <span className="text-blue-400 font-medium">Note:</span> Your savings will be locked for {lockDays} days after each trade. You can extend this period later.
                    </p>
                </div>
            </motion.div>

            {/* Platform Fee Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <FaInfoCircle className="text-green-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                            Platform Fee
                        </h3>
                        <p className="text-sm text-gray-400">Current platform fee</p>
                    </div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="text-gray-300">
                        <span className="text-green-400 font-medium">{platformFee}%</span> of each trade goes to the platform
                    </p>
                </div>
            </motion.div>

            {/* Fund Delegation Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <FaWallet className="text-yellow-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Fund Delegation
                        </h3>
                        <p className="text-sm text-gray-400">Set your maximum delegation amount</p>
                    </div>
                </div>

                {/* Delegation Settings */}
                <div className="space-y-4">
                    <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                        <h4 className="text-white font-medium mb-3">Delegation Settings</h4>
                        
                        {/* Limits Info */}
                        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-4">
                            <h5 className="text-blue-400 font-medium mb-2">Platform Limits</h5>
                            <div className="space-y-2">
                                <p className="text-gray-300 text-sm">
                                    <span className="text-blue-400 font-medium">Daily Limit:</span> {PROGRAM_CONSTANTS.DAILY_LIMIT_SOL} SOL
                                </p>
                                <p className="text-gray-300 text-sm">
                                    <span className="text-blue-400 font-medium">Max per Transaction:</span> {PROGRAM_CONSTANTS.MAX_DELEGATION_SOL} SOL
                                </p>
                                <p className="text-gray-300 text-sm">
                                    <span className="text-blue-400 font-medium">Min per Transaction:</span> {PROGRAM_CONSTANTS.MIN_DELEGATION_SOL} SOL
                                </p>
                            </div>
                        </div>

                        {/* Max Amount Setting */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm mb-2">
                                Maximum Delegation Amount (SOL)
                            </label>
                            <input
                                type="number"
                                min={PROGRAM_CONSTANTS.MIN_DELEGATION_SOL}
                                max={PROGRAM_CONSTANTS.MAX_DELEGATION_SOL}
                                step="0.1"
                                value={maxDelegationAmount}
                                onChange={(e) => handleDelegationAmountChange(Number(e.target.value))}
                                className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <p className="text-gray-400 text-xs mt-1">
                                Maximum amount that can be delegated per transaction
                            </p>
                        </div>

                        {showLockWarning && (
                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20 mt-4">
                                <p className="text-red-400 text-sm">
                                    ⚠️ Warning: Your delegation amount is less than your lock period. This may affect your savings plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Subscription Info */}
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <h4 className="text-white font-medium mb-3">Subscription Information</h4>
                        <div className="space-y-2">
                            <p className="text-gray-300 text-sm">
                                <span className="text-purple-400 font-medium">Subscription Period:</span> {PROGRAM_CONSTANTS.SUBSCRIPTION_PERIOD_DAYS} days
                            </p>
                            <p className="text-gray-300 text-sm">
                                <span className="text-purple-400 font-medium">Subscription Fee:</span> {PROGRAM_CONSTANTS.SUBSCRIPTION_FEE_SOL} SOL
                            </p>
                            <p className="text-gray-300 text-sm italic">
                                Note: Subscription status and renewal can be managed from your vault page
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FAQ Reference */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <FaInfoCircle className="text-indigo-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                            Need More Information?
                        </h3>
                        <p className="text-sm text-gray-400">Check out our comprehensive FAQ section</p>
                    </div>
                </div>

                <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                    <p className="text-gray-300 mb-4">
                        For detailed information about SaveFi's features, limits, and security, visit our FAQ section on the home page.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
                    >
                        View FAQ Section
                    </Link>
                </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 space-y-4"
            >
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <p className="text-green-400">{success}</p>
                        {txHash && (
                            <a 
                                href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 text-sm mt-2 inline-block"
                            >
                                View Transaction →
                            </a>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all relative ${
                        loading
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>
                                {loadingStep === 'initializing' ? 'Creating Vault...' : 
                                 loadingStep === 'delegating' ? 'Setting up Delegation...' : 
                                 'Processing...'}
                            </span>
                        </div>
                    ) : (
                        'Create Vault'
                    )}
                </button>
            </motion.div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SetPlan;