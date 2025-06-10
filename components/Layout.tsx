import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { connected } = useWallet();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m0 0h4m-4 0a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z" /></svg>
      ),
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-7-2a5 5 0 100-10 5 5 0 000 10z" /></svg>
      ),
    },
    {
      href: '/set-plan',
      label: 'Set Plan',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
    },
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
              {navItems.map(({ href, label, svg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    router.pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/60 hover:text-foreground hover:bg-card'
                  }`}
                >
                  {svg}
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