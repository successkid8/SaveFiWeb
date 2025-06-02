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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/20 to-transparent" />
              )}
              
              <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${step.color} backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-500/10`}>
                <div className="text-5xl mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
                
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
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
