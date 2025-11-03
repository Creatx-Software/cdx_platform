import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenPurchase from '../../components/payment/TokenPurchase';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const PurchasePage = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Purchase CDX Tokens
            </h2>
            <p className="text-gray-600">
              Buy CDX tokens securely with your credit card and receive them instantly on Solana blockchain
            </p>
          </div>

          {/* Token Purchase Component */}
          <TokenPurchase />

          {/* Additional Info Section */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              How it works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Enter Details</h4>
                <p className="text-sm text-gray-600">
                  Enter the amount you want to spend and your Solana wallet address
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Secure Payment</h4>
                <p className="text-sm text-gray-600">
                  Pay securely with your credit card through Stripe's encrypted system
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Receive Tokens</h4>
                <p className="text-sm text-gray-600">
                  CDX tokens are automatically sent to your Solana wallet within minutes
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Secure & Safe
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your payment information is protected by bank-level encryption.
                    We never store your credit card details, and all transactions are processed securely through Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchasePage;