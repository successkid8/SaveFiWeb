import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Token() {
  const router = useRouter();
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>SaveFi Token - Coming Soon</title>
        <meta name="description" content="The SaveFi token that powers the future of automated savings on Solana." />
      </Head>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Token Header */}
          <section className="bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              SaveFi Token
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-300 mb-6"
            >
              Coming Soon
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block p-6 rounded-xl bg-yellow-600/20 border border-yellow-500/20"
            >
              <p className="text-xl text-white font-semibold">Token Launch Details Coming Soon</p>
              <p className="text-gray-300 mt-2">Join our community to stay updated</p>
              <div className="mt-4 text-sm text-gray-400">
                Contract Address: <span className="font-mono">xxxx...xxxx</span>
              </div>
            </motion.div>
          </section>

          {/* Token Features */}
          <section className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              Future Benefits
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">Zero Fees</h3>
                <p className="text-gray-300">Hold SFI tokens to eliminate all platform fees</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">Priority Access</h3>
                <p className="text-gray-300">Get early access to new features and DEXs</p>
              </motion.div>
            </div>
          </section>

          {/* How to Buy */}
          <section className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              How to Buy
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4">Buy on Solana DEXs</h3>
                <div className="space-y-4">
                  <p className="text-gray-300">Once launched, you can buy SFI tokens on Solana DEXs:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Connect your Solana wallet</li>
                    <li>Select SFI token (CA: xxxx...xxxx)</li>
                    <li>Choose your preferred DEX</li>
                    <li>Swap SOL for SFI tokens</li>
                  </ul>
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400">Note: Trading pairs and liquidity will be available after token launch</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Coming Soon */}
          <section className="bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
            >
              Stay Updated
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-300 mb-6"
            >
              Follow us on social media for the latest updates
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block p-4 rounded-xl bg-blue-600/20 border border-blue-500/20"
            >
              <p className="text-lg text-white">Token launch details will be announced soon</p>
            </motion.div>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
} 