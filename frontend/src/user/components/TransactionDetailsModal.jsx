import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import transactionService from '../../services/transactionService';
import Loader from '../../components/common/Loader';

const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionDetails();
    }
  }, [isOpen, transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await transactionService.getTransactionDetails(transactionId);

      if (response.success) {
        setTransaction(response.transaction);
      }
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(type);
      setTimeout(() => setCopying(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRetryTransaction = async () => {
    try {
      setRetrying(true);

      const response = await transactionService.retryTransaction(transactionId);

      if (response.success) {
        // Refresh transaction details
        await fetchTransactionDetails();
      }
    } catch (err) {
      console.error('Error retrying transaction:', err);
      setError('Failed to retry transaction');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-2">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const openSolanaExplorer = (signature) => {
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    window.open(explorerUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction Details
            </h2>
            {transaction && (
              <p className="text-sm text-gray-500 mt-1">
                Transaction #{transaction.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader message="Loading transaction details..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchTransactionDetails}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="flex space-x-2">
                  {transaction.status === 'failed' && (
                    <button
                      onClick={handleRetryTransaction}
                      disabled={retrying}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      {retrying ? 'Retrying...' : 'Retry Transaction'}
                    </button>
                  )}
                  <button
                    onClick={fetchTransactionDetails}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount Paid</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(transaction.amount_usd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CDX Tokens</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(transaction.token_amount)} CDX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Token Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(transaction.token_price_at_purchase)} per CDX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  {transaction.stripe_payment_intent_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Stripe Payment ID</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-gray-900">
                          {transaction.stripe_payment_intent_id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transaction.stripe_payment_intent_id, 'stripe')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copying === 'stripe' ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment Status</span>
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blockchain Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Details</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Recipient Wallet</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-900">
                        {transaction.recipient_wallet_address ?
                          `${transaction.recipient_wallet_address.slice(0, 8)}...${transaction.recipient_wallet_address.slice(-8)}` :
                          'Not specified'
                        }
                      </span>
                      {transaction.recipient_wallet_address && (
                        <button
                          onClick={() => copyToClipboard(transaction.recipient_wallet_address, 'wallet')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copying === 'wallet' ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {transaction.solana_transaction_signature && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Solana Transaction</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-gray-900">
                          {`${transaction.solana_transaction_signature.slice(0, 8)}...${transaction.solana_transaction_signature.slice(-8)}`}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transaction.solana_transaction_signature, 'solana')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copying === 'solana' ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openSolanaExplorer(transaction.solana_transaction_signature)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Blockchain Status</span>
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.blockchain_status || 'Pending'}
                    </span>
                  </div>

                  {transaction.blockchain_confirmations > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Confirmations</span>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.blockchain_confirmations}
                      </span>
                    </div>
                  )}

                  {transaction.current_wallet_balance !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Current Wallet Balance</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatNumber(transaction.current_wallet_balance)} CDX
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Information */}
              {(transaction.failure_reason || transaction.error_message) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Error Information</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    {transaction.failure_reason && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-red-800">Failure Reason:</span>
                        <p className="text-sm text-red-700 mt-1">{transaction.failure_reason}</p>
                      </div>
                    )}
                    {transaction.error_message && (
                      <div>
                        <span className="text-sm font-medium text-red-800">Error Message:</span>
                        <p className="text-sm text-red-700 mt-1">{transaction.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm text-gray-900">{formatDate(transaction.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900">{formatDate(transaction.updated_at)}</span>
                  </div>
                  {transaction.tokens_sent_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tokens Sent</span>
                      <span className="text-sm text-gray-900">{formatDate(transaction.tokens_sent_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;