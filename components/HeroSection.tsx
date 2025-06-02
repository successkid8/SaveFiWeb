import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import SharedWalletButton from './SharedWalletButton';

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[250px] w-[350px] mx-auto flex items-center justify-center bg-purple-500/10 rounded-lg backdrop-blur-sm">
          <span className="text-4xl animate-bounce">🔒</span>
        </div>
      );
    }
    return this.props.children;
  }
}

const HeroSection = () => {
  const [animationError, setAnimationError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    setMounted(true);
    // Dynamically import animation data
    import('../public/vault-animation.json').then((data) => {
      setAnimationData(data.default);
    });
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Optimize particles - reduce number and add staggered animation
  const particles = Array.from({ length: 10 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${i * 0.5}s`,
    duration: `${5 + Math.random() * 5}s`
  }));

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-16 text-center">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-900 to-black" />
      
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Optimized floating particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Main Content */}
          <div className="w-full max-w-3xl mx-auto mb-16 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight animate-fade-in">
              Trade like a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-gradient">
                degen
              </span>
              .<br />
              Save like a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 animate-gradient">
                legend
              </span>
              .
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Every trade you make, a small % gets saved automatically into a locked vault for your future self.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {connected ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Link
                    href="/set-plan"
                    className="group w-full sm:w-auto bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/30"
                  >
                    Set Your Save Plan
                    <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <SharedWalletButton />
                </div>
              ) : (
                <SharedWalletButton className="w-full sm:w-auto" />
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            {[
              {
                icon: '🚀',
                title: 'Fast Setup',
                description: 'Get started in less than 5 minutes',
                gradient: 'from-blue-500 to-purple-500'
              },
              {
                icon: '🔒',
                title: 'Secure',
                description: 'Your funds are always safe',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: '💎',
                title: 'Rewarding',
                description: 'Earn rewards while you save',
                gradient: 'from-yellow-500 to-orange-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Stats with loading states */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '$2.5M+', label: 'Total Saved' },
              { value: '10K+', label: 'Active Users' },
              { value: '$500K+', label: 'Rewards Paid' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div
                key={index}
                className="glass p-6 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Enhanced Animation with error boundary */}
          <div className="mt-16">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="h-[250px] w-[350px] mx-auto flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              }>
                {!animationError && animationData ? (
                  <Lottie
                    options={defaultOptions}
                    height={250}
                    width={350}
                    isClickToPauseDisabled={true}
                    eventListeners={[
                      {
                        eventName: 'error',
                        callback: () => setAnimationError(true)
                      }
                    ]}
                  />
                ) : (
                  <div className="h-[250px] w-[350px] mx-auto flex items-center justify-center bg-purple-500/10 rounded-lg backdrop-blur-sm">
                    <span className="text-4xl animate-bounce">🔒</span>
                  </div>
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
