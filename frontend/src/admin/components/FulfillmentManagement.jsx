import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const FulfillmentManagement = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [fulfillmentData, setFulfillmentData] = useState({
    transactionHash: '',
    notes: ''
  });
  const [fulfillmentStats, setFulfillmentStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, processing, all

  useEffect(() => {
    fetchPendingFulfillments();
    fetchFulfillmentStats();
  }, [filterStatus]);

  const fetchPendingFulfillments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: '50',
        offset: '0'
      });

      const response = await api.get(`/admin/fulfillments/pending?${params}`);

      if (response.data.success) {
        let transactions = response.data.transactions;

        // Apply filter
        if (filterStatus !== 'all') {
          transactions = transactions.filter(tx => tx.fulfillment_status === filterStatus);
        }

        setPendingTransactions(transactions);
      }
    } catch (err) {
      console.error('Error fetching pending fulfillments:', err);
      setError('Failed to load pending fulfillments');
    } finally {
      setLoading(false);
    }
  };

  const fetchFulfillmentStats = async () => {
    try {
      const response = await api.get('/admin/fulfillments/stats');
      if (response.data.success) {
        setFulfillmentStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching fulfillment stats:', err);
    }
  };

  const handleOpenFulfillModal = (transaction) => {
    setSelectedTransaction(transaction);
    setFulfillmentData({
      transactionHash: '',
      notes: ''
    });
    setShowFulfillModal(true);
  };

  const handleCloseFulfillModal = () => {
    setShowFulfillModal(false);
    setSelectedTransaction(null);
    setFulfillmentData({
      transactionHash: '',
      notes: ''
    });
  };

  const handleFulfillTransaction = async (e) => {
    e.preventDefault();

    if (!selectedTransaction) return;

    try {
      setProcessingId(selectedTransaction.id);

      const response = await api.post(`/admin/fulfillments/${selectedTransaction.id}/fulfill`, {
        transactionHash: fulfillmentData.transactionHash,
        notes: fulfillmentData.notes
      });

      if (response.data.success) {
        // Remove from list
        setPendingTransactions(prev =>
          prev.filter(tx => tx.id !== selectedTransaction.id)
        );

        handleCloseFulfillModal();
        fetchFulfillmentStats();

        // Show success message
        alert('Transaction fulfilled successfully! User will receive an email notification.');
      }
    } catch (err) {
      console.error('Error fulfilling transaction:', err);
      alert(err.response?.data?.error || 'Failed to fulfill transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      setProcessingId(transactionId);

      const response = await api.put(`/admin/fulfillments/${transactionId}/status`, {
        status: newStatus,
        notes: `Status changed to ${newStatus}`
      });

      if (response.data.success) {
        // Update local state
        setPendingTransactions(prev =>
          prev.map(tx =>
            tx.id === transactionId
              ? { ...tx, fulfillment_status: newStatus }
              : tx
          )
        );

        fetchFulfillmentStats();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setProcessingId(null);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      processing: { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading && !pendingTransactions.length) {
    return (
      <div className="p-8">
        <Loader message="Loading pending fulfillments..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fulfillment Management</h1>
        <p className="text-gray-600 mt-2">Manage and fulfill pending token orders</p>
      </div>

      {/* Stats Cards */}
      {fulfillmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {fulfillmentStats.pending_count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Processing</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {fulfillmentStats.processing_count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {fulfillmentStats.completed_today || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Fulfillment Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {fulfillmentStats.avg_fulfillment_time_hours?.toFixed(1) || '0'}h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending Only</option>
            <option value="processing">Processing Only</option>
            <option value="all">All Unfulfilled</option>
          </select>
        </div>

        <button
          onClick={() => {
            fetchPendingFulfillments();
            fetchFulfillmentStats();
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {pendingTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">No pending fulfillments</p>
            <p className="text-sm text-gray-400 mt-1">
              All orders have been fulfilled. Great job!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token / Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-900">
                          #{transaction.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          UUID: {transaction.transaction_uuid?.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.email}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.first_name} {transaction.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(transaction.token_amount)} {transaction.token_symbol}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(transaction.usd_amount)} • {transaction.blockchain}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-gray-900 max-w-xs truncate">
                        {transaction.recipient_wallet_address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Payment:</div>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {transaction.payment_status}
                        </span>
                        <div className="text-xs text-gray-500 mt-2">Fulfillment:</div>
                        {getStatusBadge(transaction.fulfillment_status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                      <button
                        onClick={() => handleOpenFulfillModal(transaction)}
                        disabled={processingId === transaction.id}
                        className="flex items-center text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md disabled:opacity-50 w-full justify-center"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Mark Fulfilled
                      </button>

                      {transaction.fulfillment_status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(transaction.id, 'processing')}
                          disabled={processingId === transaction.id}
                          className="flex items-center text-blue-600 hover:text-blue-900 w-full justify-center"
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Set Processing
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Fulfill Transaction #{selectedTransaction.id}
            </h2>

            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">User:</span>
                <span className="text-sm font-medium">{selectedTransaction.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Token:</span>
                <span className="text-sm font-medium">
                  {formatNumber(selectedTransaction.token_amount)} {selectedTransaction.token_symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Blockchain:</span>
                <span className="text-sm font-medium">{selectedTransaction.blockchain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Wallet Address:</span>
                <span className="text-xs font-mono">{selectedTransaction.recipient_wallet_address}</span>
              </div>
            </div>

            <form onSubmit={handleFulfillTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Hash <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fulfillmentData.transactionHash}
                  onChange={(e) => setFulfillmentData(prev => ({
                    ...prev,
                    transactionHash: e.target.value
                  }))}
                  placeholder="Enter blockchain transaction hash"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The transaction hash from the blockchain after sending tokens
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={fulfillmentData.notes}
                  onChange={(e) => setFulfillmentData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Add any notes about this fulfillment..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={processingId === selectedTransaction.id}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === selectedTransaction.id ? 'Processing...' : 'Confirm Fulfillment'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseFulfillModal}
                  disabled={processingId === selectedTransaction.id}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                ⓘ After confirming, the user will receive an email notification with the transaction hash.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FulfillmentManagement;
