import React from 'react';

interface DexMonitorProps {
  activeDexs: string[];
  onDexToggle: (dex: string) => void;
}

const SUPPORTED_DEXS = [
  { id: 'raydium', name: 'Raydium', icon: '🦅' },
  { id: 'orca', name: 'Orca', icon: '🐋' },
  { id: 'jupiter', name: 'Jupiter', icon: '🪐' },
  { id: 'serum', name: 'Serum', icon: '💉' },
  { id: 'pumpfun', name: 'PumpFun', icon: '🚀' }
];

const DexMonitor: React.FC<DexMonitorProps> = ({ activeDexs, onDexToggle }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUPPORTED_DEXS.map((dex) => (
          <div
            key={dex.id}
            className={`p-4 rounded-lg border ${
              activeDexs.includes(dex.id)
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{dex.icon}</span>
                <div>
                  <h3 className="font-medium">{dex.name}</h3>
                  <p className="text-sm text-gray-400">
                    {activeDexs.includes(dex.id) ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDexToggle(dex.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeDexs.includes(dex.id)
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {activeDexs.includes(dex.id) ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-2">DEX Integration Status</h4>
        <div className="space-y-2">
          {SUPPORTED_DEXS.map((dex) => (
            <div key={dex.id} className="flex items-center justify-between">
              <span className="text-sm">{dex.name}</span>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeDexs.includes(dex.id) ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {activeDexs.includes(dex.id) ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DexMonitor; 