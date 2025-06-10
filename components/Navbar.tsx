import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaBars, FaTimes, FaHome, FaChartLine, FaLock, FaCog, FaCoins, FaWallet } from 'react-icons/fa';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { connected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/dashboard', label: 'Dashboard', icon: FaChartLine, requiresAuth: true },
    { href: '/vault', label: 'Vault', icon: FaLock },
    { href: '/set-plan', label: 'Set Plan', icon: FaCog },
    { href: '/token', label: 'SaveFi Token', icon: FaCoins },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-primary-800/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold mr-3 transform transition-transform group-hover:scale-105 shadow-lg shadow-primary-500/20">
                SF
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                SaveFi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              if (link.requiresAuth && !connected) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(link.href)
                      ? 'text-white bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border border-primary-500/20 shadow-lg shadow-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:shadow-lg hover:shadow-primary-500/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="ml-4">
              <WalletMultiButton className="!bg-gradient-to-r !from-primary-600 !to-secondary-500 hover:!from-primary-700 hover:!to-secondary-600 !rounded-lg !p-2 !text-sm !font-medium !shadow-lg !shadow-primary-500/20 transition-all duration-200">
                <FaWallet className="w-5 h-5" />
              </WalletMultiButton>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <WalletMultiButton className="!bg-gradient-to-r !from-primary-600 !to-secondary-500 hover:!from-primary-700 hover:!to-secondary-600 !rounded-lg !p-2 !text-sm !font-medium !shadow-lg !shadow-primary-500/20 mr-2">
              <FaWallet className="w-5 h-5" />
            </WalletMultiButton>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-primary-800/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !connected) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(link.href)
                      ? 'text-white bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border border-primary-500/20 shadow-lg shadow-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 