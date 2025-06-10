import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 text-center bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">SaveFi</h3>
            <p className="text-gray-400 text-sm">
              Automated savings on Solana
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Links</h3>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-gray-400 hover:text-white text-sm">
                Dashboard
              </Link>
              <Link href="/vault" className="block text-gray-400 hover:text-white text-sm">
                Vault
              </Link>
              <Link href="/set-plan" className="block text-gray-400 hover:text-white text-sm">
                Set Plan
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white text-sm">
                Twitter
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm">
                Discord
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm">
                Telegram
              </a>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm">© 2025 SaveFi.fun. All rights reserved.</p>
      </div>
    </footer>
  );
} 