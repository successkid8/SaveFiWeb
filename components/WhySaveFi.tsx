import React from 'react';
import SharedWalletButton from './SharedWalletButton';

const WhySaveFi: React.FC = () => {
  const features = [
    {
      icon: '💸',
      title: 'Save While Trading',
      description: 'Automatically save a portion of every trade you make'
    },
    {
      icon: '🔐',
      title: 'Your Money, Your Control',
      description: 'Your funds stay in your wallet - we never hold them'
    },
    {
      icon: '📊',
      title: 'Multiple DEXs',
      description: 'Save from trades on 5 major Solana DEXs'
    },
    {
      icon: '⚡',
      title: 'Simple Setup',
      description: 'Connect wallet, set save rate, start saving'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What SaveFi Does
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Save automatically from your trades. Your money, your control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-6 rounded-2xl bg-purple-600/20 backdrop-blur-sm border border-purple-500/20">
            <h3 className="text-2xl font-bold mb-4">Start Saving Now</h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to begin
            </p>
            <SharedWalletButton className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 text-lg transition-all duration-200" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySaveFi;
