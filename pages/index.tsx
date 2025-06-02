import { useEffect, lazy, Suspense } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import Lottie from 'react-lottie';
import animationData from '../public/vault-animation.json';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import WhySaveFi from '../components/WhySaveFi';
import DashboardPreview from '../components/DashboardPreview';
import TokenUtility from '../components/TokenUtility';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';

// Dynamic import for WalletMultiButton with SSR disabled
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

// Types
interface VaultData {
  dailyVolume: number;
  saveRate: number;
  vaultBalance: number;
  timeToUnlock: string;
}

// Analytics component
const Analytics = () => {
  const router = useRouter();
  useEffect(() => {
    const trackPageView = (url: string) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX', {
          page_path: url,
        });
      }
    };
    router.events.on('routeChangeComplete', trackPageView);
    return () => router.events.off('routeChangeComplete', trackPageView);
  }, [router.events]);
  return null;
};

const Home: NextPage = () => {
  // Mock vault data (to be replaced with real data later)
  const vaultData: VaultData = {
    dailyVolume: 10,
    saveRate: 10,
    vaultBalance: 5,
    timeToUnlock: '25 days',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>SaveFi - Your Financial Freedom Starts Here</title>
        <meta name="description" content="SaveFi - The future of decentralized savings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Analytics */}
      <Analytics />

      {/* Header */}
      <header className="flex justify-between items-center p-6" aria-label="Main navigation">
        <h1 className="text-2xl font-bold">SaveFi.fun</h1>
        <div className="flex items-center gap-4">
          {/* Default WalletMultiButton removed */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center">
        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
          <HeroSection />
          <HowItWorks />
          <WhySaveFi />
          <DashboardPreview vaultData={vaultData} />
          <TokenUtility />
          <FAQ />
          <FinalCTA />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center bg-gray-900">
        <p>© 2025 SaveFi.fun. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;