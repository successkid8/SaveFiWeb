import React from 'react';

interface Trade {
  id: string;
  dex: string;
  type: 'buy' | 'sell';
  amount: number;
  saved: number;
  timestamp: number;
}

interface TransactionHistoryProps {
  trades: Trade[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ trades }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="space-y-4">
      {trades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No transactions yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3">Date</th>
                <th className="pb-3">DEX</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {trades.map((trade) => (
                <tr key={trade.id} className="text-sm">
                  <td className="py-3 text-gray-400">
                    {formatDate(trade.timestamp)}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700">
                      {trade.dex}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.type === 'buy'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatAmount(trade.amount)}
                  </td>
                  <td className="py-3 text-right font-medium text-purple-400">
                    {formatAmount(trade.saved)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-400">Transaction Summary</h4>
          <div className="text-sm text-gray-400">
            Total Transactions: {trades.length}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Total Volume</div>
            <div className="text-lg font-medium">
              {formatAmount(
                trades.reduce((sum, trade) => sum + trade.amount, 0)
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Saved</div>
            <div className="text-lg font-medium text-purple-400">
              {formatAmount(
                trades.reduce((sum, trade) => sum + trade.saved, 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory; 