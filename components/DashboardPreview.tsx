import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dynamically import Chart.js with no SSR
const Chart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false }
);

interface VaultData {
  dailyVolume: number;
  saveRate: number;
  vaultBalance: number;
  timeToUnlock: string;
}

interface DashboardPreviewProps {
  vaultData?: VaultData;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ vaultData }) => {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '1Y'>('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const { publicKey } = useWallet();

  // Mock data for demonstration
  const stats = [
    {
      icon: '💰',
      label: 'Total Saved',
      value: `$${(vaultData?.vaultBalance || 0 * 100).toLocaleString()}`,
      change: '+12.5%',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      icon: '📈',
      label: 'Daily Volume',
      value: `$${vaultData?.dailyVolume.toLocaleString() || 0}`,
      change: '+5.2%',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      icon: '🎁',
      label: 'Rewards Earned',
      value: `$${(vaultData?.vaultBalance || 0 * 0.05).toLocaleString()}`,
      change: '+8.3%',
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      icon: '⏳',
      label: 'Time to Unlock',
      value: vaultData?.timeToUnlock || '15 days',
      color: 'from-yellow-500/20 to-yellow-600/20'
    }
  ];

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true);
    setTimeout(() => {
      // Generate mock chart data
      const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      const data = Array.from({ length: 30 }, () => Math.random() * 1000 + 500);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Savings Balance',
            data,
            fill: true,
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            borderColor: 'rgba(147, 51, 234, 1)',
            tension: 0.4
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [timeframe]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(147, 51, 234, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Savings{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Dashboard
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Track your savings, rewards, and vault status in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10`}
            >
              <div className="text-3xl mb-4">{stat.icon}</div>
              <p className="text-gray-400 mb-2">{stat.label}</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.change && (
                  <span className="ml-2 text-sm text-green-400">{stat.change}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Savings History</h3>
              <div className="flex space-x-2">
                {(['1W', '1M', '1Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-2 rounded-lg ${
                      timeframe === period
                        ? 'bg-purple-600'
                        : 'bg-white/10 hover:bg-white/20'
                    } text-sm transition-all duration-200`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 bg-white/5 rounded-lg p-4">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : chartData ? (
                <Chart data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-8 py-3 text-lg transition-all duration-300 shadow-lg shadow-purple-500/20">
            View Full Dashboard
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
