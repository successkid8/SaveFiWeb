import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FaHome, FaChartLine, FaCog, FaWallet } from 'react-icons/fa';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { connected } = useWallet();

  const navItems = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { href: '/set-plan', label: 'Set Plan', icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            SaveFi
          </Link>
          <div className="flex items-center space-x-4">
            <WalletMultiButton className="!bg-primary hover:!bg-primary-hover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    router.pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/60 hover:text-foreground hover:bg-card'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout; 