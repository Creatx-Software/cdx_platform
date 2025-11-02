import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import Input from '../common/Input';

export const WalletAddressInput = ({
  value,
  onChange,
  error,
  required = true,
  className = '',
  placeholder = "Enter your Solana wallet address"
}) => {
  const [localError, setLocalError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Validate Solana address
  const validateSolanaAddress = (address) => {
    if (!address) {
      return required ? 'Wallet address is required' : '';
    }

    if (address.length < 32 || address.length > 44) {
      return 'Invalid wallet address length';
    }

    try {
      new PublicKey(address);
      return '';
    } catch (err) {
      return 'Invalid Solana wallet address format';
    }
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const newValue = e.target.value.trim();
    setIsValidating(true);

    // Clear previous errors
    setLocalError('');

    // Validate the new value
    const validationError = validateSolanaAddress(newValue);
    setLocalError(validationError);

    // Call parent onChange
    onChange(newValue, !validationError);

    setIsValidating(false);
  };

  // Validate on mount if value exists
  useEffect(() => {
    if (value) {
      const validationError = validateSolanaAddress(value);
      setLocalError(validationError);
    }
  }, []);

  const displayError = error || localError;
  const isValid = value && !displayError;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Solana Wallet Address {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`pr-10 ${
            isValid
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : displayError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : ''
          }`}
          maxLength={44}
        />

        {/* Validation indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isValidating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : isValid ? (
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : displayError ? (
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}

      {/* Helper text */}
      {!displayError && (
        <p className="text-xs text-gray-500">
          Enter the Solana wallet address where you want to receive your CDX tokens.
          Make sure you have access to this wallet.
        </p>
      )}

      {/* Address preview for valid addresses */}
      {isValid && value && (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Delivery Address:</p>
          <p className="text-sm font-mono break-all">{value}</p>
        </div>
      )}
    </div>
  );
};

export default WalletAddressInput;