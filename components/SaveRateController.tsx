import React, { useState } from 'react';

interface SaveRateControllerProps {
  currentRate: number;
  onRateChange: (rate: number) => void;
}

const SaveRateController: React.FC<SaveRateControllerProps> = ({
  currentRate,
  onRateChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempRate, setTempRate] = useState(currentRate);

  const handleSave = () => {
    if (tempRate >= 1 && tempRate <= 50) {
      onRateChange(tempRate);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempRate(currentRate);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {isEditing ? (
          <>
            <input
              type="number"
              min="1"
              max="50"
              value={tempRate}
              onChange={(e) => setTempRate(Number(e.target.value))}
              className="w-24 px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold">{currentRate}%</div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
            >
              Edit Rate
            </button>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>1%</span>
          <span>50%</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={currentRate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #9333ea ${currentRate * 2}%, #374151 ${currentRate * 2}%)`,
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Save Rate Information</h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• Minimum save rate: 1%</li>
          <li>• Maximum save rate: 50%</li>
          <li>• Changes take effect immediately</li>
          <li>• Applied to all active DEX trades</li>
        </ul>
      </div>
    </div>
  );
};

export default SaveRateController; 