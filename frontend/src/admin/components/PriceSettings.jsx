import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import adminService from '../services/adminService';
import Loader from '../../components/common/Loader';

const PriceSettings = () => {
  const [tokenConfig, setTokenConfig] = useState({
    token_price: 0,
    min_purchase_amount: 0,
    max_purchase_amount: 0,
    total_supply: 0,
    available_supply: 0,
    is_sale_active: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState(null);

  useEffect(() => {
    fetchTokenConfig();
  }, []);

  const fetchTokenConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getTokenConfig();

      if (response.success) {
        setTokenConfig(response.config);
        setOriginalConfig(response.config);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error fetching token config:', err);
      setError('Failed to load token configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedConfig = {
      ...tokenConfig,
      [field]: value
    };

    setTokenConfig(updatedConfig);

    // Check if there are changes
    const changed = JSON.stringify(updatedConfig) !== JSON.stringify(originalConfig);
    setHasChanges(changed);
  };

  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await adminService.updateTokenConfig(tokenConfig);

      if (response.success) {
        setSuccess('Token configuration updated successfully');
        setOriginalConfig(tokenConfig);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error updating token config:', err);
      setError(err.response?.data?.error || 'Failed to update token configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetChanges = () => {
    setTokenConfig(originalConfig);
    setHasChanges(false);
    setError(null);
    setSuccess(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
  };

  const calculatePurchaseRange = () => {
    if (!tokenConfig.token_price) return { min: 0, max: 0 };

    const minTokens = Math.floor(tokenConfig.min_purchase_amount / tokenConfig.token_price);
    const maxTokens = Math.floor(tokenConfig.max_purchase_amount / tokenConfig.token_price);

    return { min: minTokens, max: maxTokens };
  };

  const purchaseRange = calculatePurchaseRange();

  if (loading) {
    return <Loader message="Loading token configuration..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price & Token Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure token pricing and purchase limits
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            tokenConfig.is_sale_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              tokenConfig.is_sale_active ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {tokenConfig.is_sale_active ? 'Sale Active' : 'Sale Inactive'}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Main Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Pricing */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Token Pricing</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={tokenConfig.token_price}
                  onChange={(e) => handleInputChange('token_price', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current price per CDX token
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Purchase Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={tokenConfig.min_purchase_amount}
                  onChange={(e) => handleInputChange('min_purchase_amount', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum purchase: {formatNumber(purchaseRange.min)} CDX tokens
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Purchase Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={tokenConfig.max_purchase_amount}
                  onChange={(e) => handleInputChange('max_purchase_amount', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum purchase: {formatNumber(purchaseRange.max)} CDX tokens
              </p>
            </div>
          </div>
        </div>

        {/* Token Supply */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="w-6 h-6 text-purple-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Token Supply</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Supply
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={tokenConfig.total_supply}
                onChange={(e) => handleInputChange('total_supply', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total CDX tokens that will ever exist
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Supply
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max={tokenConfig.total_supply}
                value={tokenConfig.available_supply}
                onChange={(e) => handleInputChange('available_supply', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                CDX tokens available for purchase
              </p>
            </div>

            {/* Supply Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Supply Remaining</span>
                <span>
                  {formatNumber(tokenConfig.available_supply)} / {formatNumber(tokenConfig.total_supply)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: tokenConfig.total_supply > 0
                      ? `${(tokenConfig.available_supply / tokenConfig.total_supply) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tokenConfig.total_supply > 0
                  ? `${((tokenConfig.available_supply / tokenConfig.total_supply) * 100).toFixed(1)}% remaining`
                  : 'No supply configured'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Sale Status</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Token Sale</h3>
            <p className="text-sm text-gray-500">
              {tokenConfig.is_sale_active
                ? 'Users can currently purchase CDX tokens'
                : 'Token purchases are temporarily disabled'
              }
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleInputChange('is_sale_active', !tokenConfig.is_sale_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                tokenConfig.is_sale_active ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tokenConfig.is_sale_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-700">
              {tokenConfig.is_sale_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Purchase Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(tokenConfig.token_price)}
            </p>
            <p className="text-sm text-blue-800">Price per CDX</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(tokenConfig.min_purchase_amount)} - {formatCurrency(tokenConfig.max_purchase_amount)}
            </p>
            <p className="text-sm text-blue-800">Purchase Range (USD)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(purchaseRange.min)} - {formatNumber(purchaseRange.max)}
            </p>
            <p className="text-sm text-blue-800">Token Range (CDX)</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {hasChanges && (
          <button
            onClick={handleResetChanges}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Reset Changes
          </button>
        )}
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges || updating}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Warning Messages */}
      {tokenConfig.available_supply <= 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-3" />
          <p className="text-yellow-700">
            Warning: No tokens available for purchase. Users will not be able to buy tokens until supply is added.
          </p>
        </div>
      )}

      {tokenConfig.token_price <= 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-3" />
          <p className="text-yellow-700">
            Warning: Token price is set to zero. Please set a valid price before enabling sales.
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceSettings;