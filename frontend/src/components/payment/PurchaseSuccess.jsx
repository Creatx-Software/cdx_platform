import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import Loader from '../common/Loader';

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get payment_intent from URL params or location state
  const urlParams = new URLSearchParams(location.search);
  const paymentIntentId = urlParams.get('payment_intent') || location.state?.paymentIntentId;

  useEffect(() => {
    if (!paymentIntentId) {
      setError('No payment information found. Redirecting to purchase page...');
      setTimeout(() => navigate('/purchase'), 3000);
      return;
    }

    fetchTransactionDetails();
  }, [paymentIntentId, navigate]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/transactions?payment_intent=${paymentIntentId}`);

      if (response.data.success && response.data.transactions.length > 0) {
        setTransactionData(response.data.transactions[0]);
      } else {
        setError('Transaction not found');
      }
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />;
      case 'processing':
        return <ClockIcon className="w-16 h-16 text-blue-500 mx-auto animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-16 h-16 text-yellow-500 mx-auto" />;
      default:
        return <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'completed':
        return {
          title: 'Purchase Successful!',
          message: 'Your CDX tokens have been successfully transferred to your wallet.',
          color: 'text-green-600'
        };
      case 'processing':
        return {
          title: 'Processing Your Purchase',
          message: 'Your payment was successful. We are now transferring your CDX tokens to your wallet.',
          color: 'text-blue-600'
        };
      case 'pending':
        return {
          title: 'Payment Received',
          message: 'Your payment is being processed. Token transfer will begin shortly.',
          color: 'text-yellow-600'
        };
      default:
        return {
          title: 'Transaction Failed',
          message: 'There was an issue with your transaction. Please contact support if this persists.',
          color: 'text-red-600'
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return <Loader message="Loading transaction details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/purchase')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Go to Purchase Page
          </button>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Transaction Not Found</h2>
          <p className="text-gray-600">We couldn't find your transaction details.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(transactionData.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success/Status Header */}
        <div className="bg-white shadow rounded-lg p-8 text-center mb-8">
          {getStatusIcon(transactionData.status)}
          <h1 className={`text-3xl font-bold mt-4 ${statusInfo.color}`}>
            {statusInfo.title}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {statusInfo.message}
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction Details</h2>

          <div className="space-y-4">
            {/* Transaction ID */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Transaction ID:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">{transactionData.id}</span>
                <button
                  onClick={() => copyToClipboard(transactionData.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(transactionData.amount_usd)}
              </span>
            </div>

            {/* Tokens Purchased */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">CDX Tokens:</span>
              <span className="font-semibold">
                {formatNumber(transactionData.token_amount)} CDX
              </span>
            </div>

            {/* Token Price */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Token Price:</span>
              <span className="font-semibold">
                {formatCurrency(transactionData.token_price_at_purchase)} per CDX
              </span>
            </div>

            {/* Recipient Wallet */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Recipient Wallet:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm truncate max-w-xs">
                  {transactionData.recipient_wallet_address}
                </span>
                <button
                  onClick={() => copyToClipboard(transactionData.recipient_wallet_address)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Solana Transaction */}
            {transactionData.solana_transaction_signature && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Solana Transaction:</span>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://explorer.solana.com/tx/${transactionData.solana_transaction_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                  >
                    View on Explorer
                  </a>
                  <button
                    onClick={() => copyToClipboard(transactionData.solana_transaction_signature)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Purchase Date */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Purchase Date:</span>
              <span className="font-semibold">
                {new Date(transactionData.created_at).toLocaleString()}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                transactionData.status === 'completed' ? 'bg-green-100 text-green-800' :
                transactionData.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                transactionData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {transactionData.status.charAt(0).toUpperCase() + transactionData.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
          >
            View All Transactions
          </button>
          <button
            onClick={() => navigate('/purchase')}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
          >
            Buy More Tokens
          </button>
        </div>

        {/* Auto-refresh for processing transactions */}
        {(transactionData.status === 'processing' || transactionData.status === 'pending') && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              This page will automatically refresh to show updates.
            </p>
            <button
              onClick={fetchTransactionDetails}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseSuccess;