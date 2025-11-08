import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const TokenManagement = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create or edit
  const [selectedToken, setSelectedToken] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [tokenForm, setTokenForm] = useState({
    token_symbol: '',
    token_name: '',
    blockchain: 'Solana',
    token_address: '',
    price_per_token: '',
    min_purchase_amount: '10',
    max_purchase_amount: '10000',
    daily_purchase_limit: '50000',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/tokens/admin/all');

      if (response.data.success) {
        setTokens(response.data.tokens);
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTokenForm({
      token_symbol: '',
      token_name: '',
      blockchain: 'Solana',
      token_address: '',
      price_per_token: '',
      min_purchase_amount: '10',
      max_purchase_amount: '10000',
      daily_purchase_limit: '50000',
      description: '',
      is_active: true
    });
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setSelectedToken(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (token) => {
    setTokenForm({
      token_symbol: token.token_symbol,
      token_name: token.token_name,
      blockchain: token.blockchain,
      token_address: token.token_address || '',
      price_per_token: token.price_per_token.toString(),
      min_purchase_amount: token.min_purchase_amount.toString(),
      max_purchase_amount: token.max_purchase_amount.toString(),
      daily_purchase_limit: token.daily_purchase_limit.toString(),
      description: token.description || '',
      is_active: token.is_active
    });
    setModalMode('edit');
    setSelectedToken(token);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedToken(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setProcessingId(selectedToken?.id || 'new');

      // Map frontend snake_case to backend camelCase
      // Convert empty strings to null for optional fields
      const payload = {
        tokenName: tokenForm.token_name || null,
        tokenSymbol: tokenForm.token_symbol || null,
        tokenAddress: tokenForm.token_address || null,
        blockchain: tokenForm.blockchain || 'Solana',
        pricePerToken: parseFloat(tokenForm.price_per_token) || 0,
        currency: 'USD',
        minPurchaseAmount: parseFloat(tokenForm.min_purchase_amount) || 10,
        maxPurchaseAmount: parseFloat(tokenForm.max_purchase_amount) || 10000,
        minTokenAmount: 100, // Default minimum tokens
        maxTokenAmount: 100000, // Default maximum tokens
        dailyPurchaseLimit: parseFloat(tokenForm.daily_purchase_limit) || 50000,
        isActive: tokenForm.is_active !== undefined ? tokenForm.is_active : true,
        description: tokenForm.description || null,
        displayOrder: 0,
        logoUrl: null
      };

      let response;
      if (modalMode === 'create') {
        response = await api.post('/tokens', payload);
      } else {
        response = await api.put(`/tokens/${selectedToken.id}`, payload);
      }

      if (response.data.success) {
        fetchTokens();
        handleCloseModal();
        alert(`Token ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      }
    } catch (err) {
      console.error('Error saving token:', err);
      alert(err.response?.data?.message || err.response?.data?.error || `Failed to ${modalMode} token`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (tokenId, currentStatus) => {
    try {
      setProcessingId(tokenId);

      const endpoint = currentStatus
        ? `/tokens/${tokenId}`
        : `/tokens/${tokenId}/activate`;

      const method = currentStatus ? 'delete' : 'patch';

      const response = await api[method](endpoint);

      if (response.data.success) {
        fetchTokens();
      }
    } catch (err) {
      console.error('Error toggling token status:', err);
      alert(err.response?.data?.error || 'Failed to update token status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewStats = async (tokenId) => {
    try {
      const response = await api.get(`/tokens/${tokenId}/stats`);

      if (response.data.success) {
        const stats = response.data.stats;
        alert(`Token Sales Statistics:

Total Sales: $${stats.total_sales_usd}
Total Volume: ${stats.total_token_volume} tokens
Total Transactions: ${stats.total_transactions}
Pending Fulfillments: ${stats.pending_fulfillments}
Completed Fulfillments: ${stats.completed_fulfillments}`);
      }
    } catch (err) {
      console.error('Error fetching token stats:', err);
      alert('Failed to load token statistics');
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
      day: 'numeric'
    });
  };

  if (loading && !tokens.length) {
    return (
      <div className="p-8">
        <Loader message="Loading tokens..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Token Management</h1>
          <p className="text-gray-600 mt-2">Manage cryptocurrency tokens available for purchase</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 shadow-lg"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Token
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tokens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">No tokens configured</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add New Token" to create your first token
            </p>
          </div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
                token.is_active ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{token.token_symbol}</h3>
                    <p className="text-sm opacity-90">{token.token_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    token.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {token.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Price */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Price:</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(token.price_per_token)}
                  </span>
                </div>

                {/* Blockchain */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blockchain:</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {token.blockchain}
                  </span>
                </div>

                {/* Purchase Limits */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Min Purchase:</span>
                      <span className="font-medium">{formatCurrency(token.min_purchase_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Purchase:</span>
                      <span className="font-medium">{formatCurrency(token.max_purchase_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Limit:</span>
                      <span className="font-medium">{formatCurrency(token.daily_purchase_limit)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {token.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {token.description}
                    </p>
                  </div>
                )}

                {/* Token Address */}
                {token.token_address && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Token Address:</p>
                    <p className="text-xs font-mono text-gray-700 truncate">
                      {token.token_address}
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(token.created_at)}</span>
                  </div>
                  {token.updated_at && (
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{formatDate(token.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-4 py-3 space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(token)}
                    disabled={processingId === token.id}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewStats(token.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                  >
                    <ChartBarIcon className="w-4 h-4 mr-1" />
                    Stats
                  </button>
                </div>
                <button
                  onClick={() => handleToggleActive(token.id, token.is_active)}
                  disabled={processingId === token.id}
                  className={`w-full flex items-center justify-center px-3 py-2 text-sm rounded-md disabled:opacity-50 ${
                    token.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {token.is_active ? (
                    <>
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {modalMode === 'create' ? 'Add New Token' : `Edit ${selectedToken?.token_symbol}`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token Symbol */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Symbol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenForm.token_symbol}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      token_symbol: e.target.value.toUpperCase()
                    }))}
                    placeholder="BTC, ETH, SOL..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenForm.token_name}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      token_name: e.target.value
                    }))}
                    placeholder="Bitcoin, Ethereum, Solana..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Blockchain and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blockchain <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={tokenForm.blockchain}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      blockchain: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Solana">Solana</option>
                    <option value="Ethereum">Ethereum</option>
                    <option value="BSC">Binance Smart Chain</option>
                    <option value="Polygon">Polygon</option>
                    <option value="Avalanche">Avalanche</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Token (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    required
                    value={tokenForm.price_per_token}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      price_per_token: e.target.value
                    }))}
                    placeholder="0.50"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Token Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Address (Optional)
                </label>
                <input
                  type="text"
                  value={tokenForm.token_address}
                  onChange={(e) => setTokenForm(prev => ({
                    ...prev,
                    token_address: e.target.value
                  }))}
                  placeholder="0x... or token mint address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Purchase Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Purchase ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tokenForm.min_purchase_amount}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      min_purchase_amount: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Purchase ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tokenForm.max_purchase_amount}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      max_purchase_amount: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Limit ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tokenForm.daily_purchase_limit}
                    onChange={(e) => setTokenForm(prev => ({
                      ...prev,
                      daily_purchase_limit: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={tokenForm.description}
                  onChange={(e) => setTokenForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Brief description of the token..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={tokenForm.is_active}
                  onChange={(e) => setTokenForm(prev => ({
                    ...prev,
                    is_active: e.target.checked
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Token is active and available for purchase
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId !== null
                    ? 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Token'
                    : 'Update Token'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={processingId !== null}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagement;
