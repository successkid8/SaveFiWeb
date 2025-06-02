import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-4 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

const TokenUtility: React.FC = () => {
  const utilities = [
    {
      title: 'Governance',
      description: 'Participate in platform decisions and vote on proposals.',
      icon: '🗳️',
      tooltip: 'Vote on platform upgrades, fee changes, and new features'
    },
    {
      title: 'Fee Discounts',
      description: 'Get reduced fees on platform operations based on your token holdings.',
      icon: '💎',
      tooltip: 'Up to 50% discount on trading fees with token staking'
    },
    {
      title: 'Staking Rewards',
      description: 'Earn additional rewards by staking your tokens.',
      icon: '🌱',
      tooltip: 'Earn up to 20% APY by staking your tokens'
    },
    {
      title: 'Premium Features',
      description: 'Access exclusive features and early access to new products.',
      icon: '⭐',
      tooltip: 'Get early access to new vaults and features'
    }
  ];

  const [activeTab, setActiveTab] = useState<'distribution' | 'tokenomics'>('distribution');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-900/20 to-black/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            SaveFi Token Utility
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our token powers the ecosystem and rewards long-term holders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {utilities.map((utility, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110">
                  {utility.icon}
                </div>
                <div>
                  <Tooltip content={utility.tooltip}>
                    <h3 className="text-xl font-semibold mb-2 cursor-help">
                      {utility.title}
                    </h3>
                  </Tooltip>
                  <p className="text-gray-400">{utility.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('distribution')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'distribution'
                    ? 'bg-purple-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Distribution
              </button>
              <button
                onClick={() => setActiveTab('tokenomics')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'tokenomics'
                    ? 'bg-purple-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Tokenomics
              </button>
            </div>

            {activeTab === 'distribution' ? (
              <div className="space-y-4">
                {[
                  { label: 'Community', value: 40, color: 'from-purple-500 to-purple-600' },
                  { label: 'Development', value: 30, color: 'from-blue-500 to-blue-600' },
                  { label: 'Team', value: 20, color: 'from-green-500 to-green-600' },
                  { label: 'Reserve', value: 10, color: 'from-yellow-500 to-yellow-600' }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: '0%' }}
                        onAnimationEnd={(e) => {
                          e.currentTarget.style.width = `${item.value}%`;
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Total Supply', value: '1,000,000,000' },
                  { label: 'Initial Price', value: '$0.01' },
                  { label: 'Vesting Period', value: '12 months' },
                  { label: 'Initial Market Cap', value: '$10M' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <p className="text-gray-400 mb-2">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Token Benefits</h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Early Access',
                  description: 'Get first access to new features and vaults',
                  icon: '🚀'
                },
                {
                  title: 'Fee Reduction',
                  description: 'Up to 50% off on platform fees',
                  icon: '💰'
                },
                {
                  title: 'Governance Rights',
                  description: 'Vote on platform decisions',
                  icon: '🗳️'
                },
                {
                  title: 'Staking Rewards',
                  description: 'Earn passive income through staking',
                  icon: '🌱'
                }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-2xl">{benefit.icon}</div>
                  <div>
                    <h4 className="font-semibold">{benefit.title}</h4>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenUtility;
