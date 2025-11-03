import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import WalletAddressInput from './WalletAddressInput';
import TestWalletSelector from './TestWalletSelector';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const TokenPurchase = () => {
  const [step, setStep] = useState(1); // 1: Configuration, 2: Payment, 3: Success
  const [usdAmount, setUsdAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletValid, setIsWalletValid] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(0.5); // Default price
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  // Fetch current token price
  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/price`);
        if (response.ok) {
          const data = await response.json();
          setTokenPrice(data.price);
        }
      } catch (err) {
        console.error('Failed to fetch token price:', err);
      }
    };

    fetchTokenPrice();
  }, []);

  // Calculate token amount based on USD amount
  useEffect(() => {
    const amount = parseFloat(usdAmount);
    if (!isNaN(amount) && amount > 0 && tokenPrice > 0) {
      setTokenAmount(Math.floor(amount / tokenPrice));
    } else {
      setTokenAmount(0);
    }
  }, [usdAmount, tokenPrice]);

  const handleWalletChange = (address, isValid) => {
    setWalletAddress(address);
    setIsWalletValid(isValid);
  };

  const handleTestWalletSelect = (address) => {
    setWalletAddress(address);
    setIsWalletValid(true);
  };

  const handleProceedToPayment = () => {
    if (!isWalletValid) {
      setError('Please enter a valid Solana wallet address');
      return;
    }

    if (!usdAmount || parseFloat(usdAmount) < 10) {
      setError('Minimum purchase amount is $10');
      return;
    }

    if (tokenAmount === 0) {
      setError('Invalid token amount');
      return;
    }

    setError('');
    setStep(2);
  };

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    setStep(3);
  };

  const handlePaymentError = (error) => {
    setError(error.message);
    setStep(1);
  };

  const resetFlow = () => {
    setStep(1);
    setUsdAmount('');
    setTokenAmount(0);
    setWalletAddress('');
    setIsWalletValid(false);
    setError('');
    setPaymentResult(null);
  };

  // Step 1: Configuration
  if (step === 1) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card-premium p-8">
          <div className="mb-8 text-center">
            <h2 className="title-section mb-3">
              <span className="text-gradient">Purchase CDX Tokens</span>
            </h2>
            <p className="subtitle">
              Buy CDX tokens with your credit card and receive them instantly on Solana blockchain
            </p>
          </div>

          {/* Current Price Display */}
          <div className="card-gold p-6 mb-8 transform hover-scale">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-text-primary">Live Price:</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gradient">${tokenPrice.toFixed(3)}</span>
                <span className="text-sm text-text-muted ml-1">per CDX</span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label">
                Purchase Amount (USD) <span className="text-accent-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">$</div>
                <Input
                  type="number"
                  min="10"
                  step="0.01"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  placeholder="Enter amount (minimum $10)"
                  className="pl-8 text-right text-lg font-medium"
                />
              </div>
              {tokenAmount > 0 && (
                <div className="mt-3 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">You will receive:</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gradient">{tokenAmount.toLocaleString()}</span>
                      <span className="text-sm text-text-muted ml-1">CDX tokens</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Address Input */}
            <WalletAddressInput
              value={walletAddress}
              onChange={handleWalletChange}
              error=""
            />

            {/* Test Wallet Selector (Development Only) */}
            <TestWalletSelector
              onWalletSelect={handleTestWalletSelect}
              className="mt-4"
            />

            {/* Error Display */}
            {error && (
              <div className="alert-error">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-accent-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm ml-3">{error}</p>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleProceedToPayment}
              disabled={!isWalletValid || !usdAmount || parseFloat(usdAmount) < 10}
              className="btn-primary w-full py-4 text-lg font-medium transform hover-scale"
            >
              <span className="flex items-center justify-center">
                Continue to Payment
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
          </div>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-border-light">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="text-xs text-text-muted">Min: $10</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="text-xs text-text-muted">Instant delivery</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-accent-success rounded-full"></div>
                <span className="text-xs text-text-muted">Stripe secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Payment
  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card-premium p-8">
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="title-section mb-3">
                <span className="text-gradient">Complete Payment</span>
              </h2>
              <p className="subtitle">Secure payment powered by Stripe</p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors group"
            >
              <svg className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to configuration
            </button>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              amount={parseFloat(usdAmount)}
              tokenAmount={tokenAmount}
              walletAddress={walletAddress}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isLoading={loading}
            />
          </Elements>
        </div>
      </div>
    );
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card-premium p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-accent-success to-primary-500 mb-6 shadow-lg animate-bounce">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="title-section mb-3">
              <span className="text-gradient">Payment Successful!</span>
            </h2>
            <p className="subtitle mb-8">Your CDX tokens are being delivered to your Solana wallet</p>

            {/* Transaction Details */}
            <div className="card-gold p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <svg className="mr-2 h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Transaction Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-primary-200">
                  <span className="text-text-muted">Amount Paid:</span>
                  <span className="font-bold text-gradient text-xl">${parseFloat(usdAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary-200">
                  <span className="text-text-muted">CDX Tokens:</span>
                  <span className="font-bold text-gradient text-xl">{tokenAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary-200">
                  <span className="text-text-muted">Delivery Address:</span>
                  <span className="font-mono text-sm font-medium text-text-primary break-all">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </span>
                </div>
                {paymentResult?.transactionId && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-muted">Transaction ID:</span>
                    <span className="font-mono text-sm font-medium text-text-primary">{paymentResult.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={resetFlow}
                className="btn-primary w-full py-4 text-lg font-medium transform hover-scale"
              >
                <span className="flex items-center justify-center">
                  Make Another Purchase
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </Button>
              <Button
                onClick={() => window.location.href = '/transactions'}
                className="btn-secondary w-full py-4 text-lg font-medium transform hover-scale"
              >
                <span className="flex items-center justify-center">
                  View Transaction History
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
              </Button>
            </div>

            {/* Status Info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
              <div className="flex items-center justify-center text-sm text-text-muted">
                <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse mr-2"></div>
                Tokens typically arrive within 1-2 minutes. Check your wallet for confirmation.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TokenPurchase;