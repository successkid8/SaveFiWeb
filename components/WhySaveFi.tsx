import React from 'react';
import SharedWalletButton from './SharedWalletButton';

const WhySaveFi: React.FC = () => {
  const benefits = [
    {
      icon: '🔒',
      title: 'Secure Savings',
      description: 'Your funds are locked in a time-locked vault, ensuring you save for your future.'
    },
    {
      icon: '💎',
      title: 'Rewards Program',
      description: 'Earn additional rewards for maintaining your savings and participating in the ecosystem.'
    },
    {
      icon: '📈',
      title: 'Growth Potential',
      description: 'Benefit from compound interest and platform growth while your savings are locked.'
    },
    {
      icon: '🔄',
      title: 'Automated Process',
      description: 'Set it and forget it - your savings are automatically deducted from your trades.'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose SaveFi?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're revolutionizing the way traders save and build wealth in the crypto space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{benefit.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-6 rounded-2xl bg-purple-600/20 backdrop-blur-sm border border-purple-500/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Saving?</h3>
            <p className="text-gray-300 mb-6">
              Join thousands of traders who are building wealth with SaveFi.
            </p>
            <SharedWalletButton className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 text-lg transition-all duration-200" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySaveFi;
