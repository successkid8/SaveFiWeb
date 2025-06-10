import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaLock, FaChartLine, FaExchangeAlt, FaShieldAlt, FaRobot, FaHandshake, FaCoins, FaSync } from 'react-icons/fa';

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

const Home: FC = () => {
  const { connected } = useWallet();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              Trade like a degen.<br />
              Save like a legend.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Every trade you make, a small % gets saved automatically into a locked vault for your future self.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!connected ? (
                <button
                  onClick={() => router.push('/set-plan')}
                  className="btn-primary text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  View Dashboard
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white mb-8 text-center"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaLock />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">1. Set Your Save Rate</h3>
            <p className="text-gray-300">
              Choose how much you want to save from each trade (1-20%). Your preferences are stored securely on-chain.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaExchangeAlt />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">2. Trade Normally</h3>
            <p className="text-gray-300">
              Continue trading as usual. We'll automatically deduct your chosen percentage from each trade.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaChartLine />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">3. Watch Your Savings Grow</h3>
            <p className="text-gray-300">
              Monitor your savings in real-time through our dashboard. Withdraw anytime after your lock period.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white mb-8 text-center"
        >
          Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaRobot />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Auto-Save</h3>
            <p className="text-gray-300">
              Set your save rate and let SaveFi handle the rest. Every trade automatically contributes to your savings.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaLock />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Flexible Control</h3>
            <p className="text-gray-300">
              Choose how much to save (1-20%) and how long to lock your savings (1-30 days). Update anytime.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaShieldAlt />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Secure Vault</h3>
            <p className="text-gray-300">
              Each vault is a unique PDA. Only you can access your funds. Built on Solana with smart contracts you can trust.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaHandshake />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Smart Delegation</h3>
            <p className="text-gray-300">
              Delegate funds up to {PROGRAM_CONSTANTS.MAX_DELEGATION_SOL} SOL per transaction. Revoke anytime.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaCoins />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">SaveSOL Tokens</h3>
            <p className="text-gray-300">
              Your savings are automatically converted to SaveSOL tokens. Track your progress in real-time.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="text-3xl mb-4 text-purple-500">
              <FaSync />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Auto-Renewal</h3>
            <p className="text-gray-300">
              {PROGRAM_CONSTANTS.SUBSCRIPTION_PERIOD_DAYS}-day subscription with auto-renewal. Manage in your vault.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Saving?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Create your vault, set your preferences, and let SaveFi handle your savings automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/set-plan" className="btn-primary">
              Create Vault
            </Link>
            <Link href="/faq" className="btn-secondary">
              View FAQ
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;