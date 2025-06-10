import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      icon: '🪙',
      title: 'Set Your Save Rate',
      description: 'Pick a % of each trade to save (e.g., 10%).',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      icon: '⚙️',
      title: 'SaveSOL Vault Locks It',
      description: 'We wrap that amount into SaveSOL and lock it for 1 month.',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      icon: '🎁',
      title: 'Withdraw Later',
      description: 'After the lock, unlock your vault and enjoy your saved SOL.',
      color: 'from-yellow-500/20 to-yellow-600/20'
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden flex justify-center items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three simple steps to start building your wealth while you trade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔐',
              title: 'Connect Your Wallet',
              description: 'Connect your wallet - your money stays in your control',
              gradient: 'from-blue-500 to-purple-500'
            },
            {
              icon: '⚡',
              title: 'Set Save Rate',
              description: 'Choose how much to save from each trade',
              gradient: 'from-green-500 to-emerald-500'
            },
            {
              icon: '📈',
              title: 'Start Saving',
              description: 'SaveFi automatically saves from your trades',
              gradient: 'from-yellow-500 to-orange-500'
            }
          ].map((step, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                {step.title}
              </h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            What SaveFi Provides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">Automatic Savings</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-1">✓</span>
                  <span>Save from every trade automatically</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-1">✓</span>
                  <span>Works with 5 major DEXs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-1">✓</span>
                  <span>Set your own save rate</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">Your Control</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-1">✓</span>
                  <span>Your money stays in your wallet</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-1">✓</span>
                  <span>Choose when to withdraw</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-1">✓</span>
                  <span>Adjust settings anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Ready to start saving?{' '}
            <a href="#connect" className="text-purple-400 hover:text-purple-300 underline">
              Connect your wallet
            </a>{' '}
            to get started.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
