import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import adminService from '../services/adminService';
import Loader from '../../components/common/Loader';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_transactions: 0,
    has_next: false,
    has_prev: false
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    start_date: '',
    end_date: '',
    search: '',
    user_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.current_page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.current_page,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value && value !== 'all'))
      };

      const response = await adminService.getTransactions(params);

      if (response.success) {
        setTransactions(response.transactions);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetails = async (transactionId) => {
    try {
      // Since we have full transaction data in the list, we can use it directly
      // In a real implementation, you might want to fetch additional details
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setSelectedTransaction(transaction);
        setShowTransactionModal(true);
      }
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setError('Failed to load transaction details');
    }
  };

  const retryTransaction = async (transactionId) => {
    try {
      // This would call an admin API to retry a failed transaction
      const response = await adminService.retryTransaction(transactionId);
      if (response.success) {
        fetchTransactions(); // Refresh the list
      }
    } catch (err) {
      console.error('Error retrying transaction:', err);
      setError('Failed to retry transaction');
    }
  };

  const exportTransactions = async () => {
    try {
      const params = {
        format: 'csv',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value && value !== 'all'))
      };

      // This would call the admin export endpoint
      const response = await adminService.exportTransactions(params);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
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

  const clearFilters = () => {
    setFilters({
      status: 'all',
      start_date: '',
      end_date: '',
      search: '',
      user_id: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all platform transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={exportTransactions}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchTransactions}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                placeholder="Enter user ID"
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Transaction ID, email, wallet address..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loader message="Loading transactions..." />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400 mt-1">
              Transactions will appear here as users make purchases
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-mono text-sm font-medium text-gray-900">
                            #{transaction.id}
                          </div>
                          {transaction.stripe_payment_intent_id && (
                            <div className="text-xs text-gray-500">
                              Stripe: {transaction.stripe_payment_intent_id.slice(0, 12)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.user_email || `User #${transaction.user_id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {transaction.user_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.amount_usd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(transaction.token_amount)} CDX
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchTransactionDetails(transaction.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </button>
                          {transaction.status === 'failed' && (
                            <button
                              onClick={() => retryTransaction(transaction.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <ArrowPathIcon className="w-4 h-4 mr-1" />
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.user_email || `User #${transaction.user_id}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-semibold">{formatCurrency(transaction.amount_usd)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tokens</p>
                      <p className="font-semibold">{formatNumber(transaction.token_amount)} CDX</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => fetchTransactionDetails(transaction.id)}
                      className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    {transaction.status === 'failed' && (
                      <button
                        onClick={() => retryTransaction(transaction.id)}
                        className="text-green-600 hover:text-green-900 text-sm flex items-center"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_prev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{pagination.current_page}</span> of{' '}
                      <span className="font-medium">{pagination.total_pages}</span>
                      {' '}({pagination.total_transactions} total transactions)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={!pagination.has_prev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {pagination.current_page}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={!pagination.has_next}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  �
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Transaction Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-mono font-medium">#{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount (USD)</p>
                      <p className="font-medium">{formatCurrency(selectedTransaction.amount_usd)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CDX Tokens</p>
                      <p className="font-medium">{formatNumber(selectedTransaction.token_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Token Price</p>
                      <p className="font-medium">{formatCurrency(selectedTransaction.token_price_at_purchase)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                    </div>
                    {selectedTransaction.completed_at && (
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="font-medium">{formatDate(selectedTransaction.completed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment & Blockchain Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Payment & Blockchain</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">User</p>
                      <p className="font-medium">{selectedTransaction.user_email || `User #${selectedTransaction.user_id}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Recipient Wallet</p>
                      <p className="font-mono text-sm break-all">{selectedTransaction.recipient_wallet_address}</p>
                    </div>
                    {selectedTransaction.stripe_payment_intent_id && (
                      <div>
                        <p className="text-sm text-gray-500">Stripe Payment Intent</p>
                        <p className="font-mono text-sm">{selectedTransaction.stripe_payment_intent_id}</p>
                      </div>
                    )}
                    {selectedTransaction.solana_transaction_signature && (
                      <div>
                        <p className="text-sm text-gray-500">Solana Transaction</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm break-all">{selectedTransaction.solana_transaction_signature}</p>
                          <a
                            href={`https://explorer.solana.com/tx/${selectedTransaction.solana_transaction_signature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs whitespace-nowrap"
                          >
                            View on Explorer
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.error_message && (
                      <div>
                        <p className="text-sm text-gray-500">Error Message</p>
                        <p className="text-red-600 text-sm">{selectedTransaction.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                {selectedTransaction.status === 'failed' && (
                  <button
                    onClick={() => {
                      retryTransaction(selectedTransaction.id);
                      setShowTransactionModal(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Retry Transaction
                  </button>
                )}
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;