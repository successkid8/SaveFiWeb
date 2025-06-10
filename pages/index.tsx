import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

// Define icons object with inline SVGs
const icons = {
  lock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-7-2a5 5 0 100-10 5 5 0 000 10z" />
    </svg>
  ),
  exchange: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  robot: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  handshake: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
  coins: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  sync: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
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
              {icons.lock}
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
              {icons.exchange}
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
              {icons.chart}
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
              {icons.robot}
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
              {icons.lock}
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
              {icons.shield}
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
              {icons.handshake}
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
              {icons.coins}
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
              {icons.sync}
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