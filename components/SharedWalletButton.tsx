import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Dynamically import WalletMultiButton with SSR disabled
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

interface SharedWalletButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

const SharedWalletButton: React.FC<SharedWalletButtonProps> = ({ 
  className = '',
  variant = 'primary'
}) => {
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!mounted) return null;

  if (connected && publicKey) {
    return (
      <button
        onClick={disconnect}
        className={`flex items-center justify-center gap-2 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 ${className}`}
      >
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="hidden xs:inline">{formatAddress(publicKey.toString())}</span>
        <span className="xs:hidden">Connected</span>
      </button>
    );
  }

  return (
    <div className={`wallet-adapter-button-trigger ${className}`}>
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !px-4 sm:!px-6 !py-3 sm:!py-4 !text-base sm:!text-lg !font-semibold !transition-all !duration-300 hover:!scale-105" />
    </div>
  );
};

export default SharedWalletButton; 