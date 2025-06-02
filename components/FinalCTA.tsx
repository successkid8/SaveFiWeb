import React from 'react';
import SharedWalletButton from './SharedWalletButton';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black/50 to-purple-900/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Start Saving?
        </h2>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Join thousands of traders who are building wealth with SaveFi.
          Start your journey to financial freedom today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SharedWalletButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-full !px-8 !py-3 !text-lg" />
          <button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-3 text-lg transition-all duration-200">
            Learn More
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Fast Setup</h3>
            <p className="text-gray-400">Get started in less than 5 minutes</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-400">Your funds are always safe</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-2">Rewarding</h3>
            <p className="text-gray-400">Earn rewards while you save</p>
          </div>
        </div>

        <div className="mt-16 text-sm text-gray-400">
          <p>Join our community</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Discord</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Telegram</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Medium</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
