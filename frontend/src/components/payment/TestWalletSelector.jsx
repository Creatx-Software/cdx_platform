import React from 'react';

// Test wallet addresses for development
const TEST_WALLETS = [
  {
    name: "Test Wallet 1",
    address: "EtdYHR3ewVQ85H2FumPUZGkMgH9geo6kZt4tGKMvsKHX"
  },
  {
    name: "Test Wallet 2",
    address: "7dGQ1T6EbRMbprLsGDvfMimzu9NpZx5Vuz9Mf82BQ7tJ"
  },
  {
    name: "Test Wallet 3",
    address: "9gpMZqerpg7WLR8DR6Y9Bq71hVnDNEZ3wYYmjUFN4W6M"
  },
  {
    name: "Test Wallet 4",
    address: "GEDEQfcp9WcoAUQcdhNQM8M4j7hpzXdNbn6ELacSJCNf"
  },
  {
    name: "Test Wallet 5",
    address: "HYusBZkFR8bKuGfjdvz8CttxHXUfKyybqdrob1uWMQCD"
  }
];

export const TestWalletSelector = ({ onWalletSelect, className = '' }) => {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleWalletClick = (wallet) => {
    onWalletSelect(wallet.address);
  };

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-medium text-yellow-800">
          Development Mode - Test Wallets
        </h3>
      </div>

      <p className="text-xs text-yellow-700 mb-3">
        Click any wallet below to quickly fill in a test Solana address:
      </p>

      <div className="space-y-2">
        {TEST_WALLETS.map((wallet, index) => (
          <button
            key={index}
            onClick={() => handleWalletClick(wallet)}
            className="w-full text-left p-2 bg-white border border-yellow-200 rounded hover:bg-yellow-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {wallet.name}
              </span>
              <span className="text-xs text-gray-500">
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-yellow-200">
        <p className="text-xs text-yellow-600">
          💡 These are generated test wallets for development only.
          In production, users will enter their real Solana wallet addresses.
        </p>
      </div>
    </div>
  );
};

export default TestWalletSelector;