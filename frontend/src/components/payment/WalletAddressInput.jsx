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
    <div className={`form-group ${className}`}>
      <label className="form-label">
        Solana Wallet Address {required && <span className="text-accent-error">*</span>}
      </label>

      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`pr-12 font-mono text-sm ${
            isValid
              ? 'border-accent-success focus:border-accent-success focus:ring-accent-success/20'
              : displayError
                ? 'border-accent-error focus:border-accent-error focus:ring-accent-error/20'
                : ''
          }`}
          maxLength={44}
        />

        {/* Validation indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isValidating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
          ) : isValid ? (
            <div className="bg-accent-success rounded-full p-1">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          ) : displayError ? (
            <div className="bg-accent-error rounded-full p-1">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <div className="alert-error mt-2">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-accent-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm ml-2">{displayError}</p>
          </div>
        </div>
      )}

      {/* Helper text */}
      {!displayError && (
        <div className="mt-2 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-text-muted ml-2">
              Enter the Solana wallet address where you want to receive your CDX tokens.
              Make sure you have access to this wallet.
            </p>
          </div>
        </div>
      )}

      {/* Address preview for valid addresses */}
      {isValid && value && (
        <div className="mt-3 card-gold p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-text-primary mb-1">Delivery Address:</p>
              <p className="text-sm font-mono break-all text-text-muted bg-white rounded px-3 py-2 border border-primary-200">
                {value}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletAddressInput;