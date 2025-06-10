import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaWallet, FaChartLine, FaLock, FaUnlock } from 'react-icons/fa';

interface DashboardProps {
  vaultData?: {
    dailyVolume: number;
    saveRate: number;
    vaultBalance: number;
    timeToUnlock: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ vaultData }) => {
  const { publicKey } = useWallet();

  // Mock data - replace with real data later
  const mockData = {
    totalSaved: 1500,
    saveRate: 10, // 10% save rate
    nextUnlock: '2024-04-15',
    estimatedEarnings: 75,
    savingsStreak: 15,
    lastDeposit: '2024-03-20',
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Saved</p>
              <h3 className="text-2xl font-bold mt-1">${mockData.totalSaved}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <FaWallet className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-400 text-sm">Current Save Rate</p>
            <p className="text-xl font-semibold mt-1">{mockData.saveRate}%</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Next Unlock</p>
              <h3 className="text-2xl font-bold mt-1">{mockData.nextUnlock}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <FaLock className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-400 text-sm">Estimated Earnings</p>
            <p className="text-xl font-semibold mt-1">${mockData.estimatedEarnings}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Savings Streak</p>
              <h3 className="text-2xl font-bold mt-1">{mockData.savingsStreak} days</h3>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <FaChartLine className="text-purple-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-400 text-sm">Last Deposit</p>
            <p className="text-xl font-semibold mt-1">{mockData.lastDeposit}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Vault Actions</h3>
          <div className="space-y-4">
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              Withdraw Savings
            </button>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              Update Save Rate
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <p className="font-medium">Automatic Save</p>
                <p className="text-sm text-gray-400">March 20, 2024</p>
              </div>
              <p className="text-green-500">+$100</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <p className="font-medium">Platform Fee</p>
                <p className="text-sm text-gray-400">March 19, 2024</p>
              </div>
              <p className="text-red-500">-$1.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 