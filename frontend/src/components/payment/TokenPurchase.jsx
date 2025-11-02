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
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase CDX Tokens</h2>
          <p className="text-gray-600">Buy CDX tokens with your credit card and receive them instantly on Solana.</p>
        </div>

        {/* Current Price Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Current Price:</span>
            <span className="text-lg font-bold text-blue-900">${tokenPrice.toFixed(3)} per CDX</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Amount (USD) *
            </label>
            <Input
              type="number"
              min="10"
              step="0.01"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              placeholder="Enter amount (minimum $10)"
              className="text-right"
            />
            {tokenAmount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                You will receive: <span className="font-medium">{tokenAmount.toLocaleString()} CDX tokens</span>
              </p>
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
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleProceedToPayment}
            disabled={!isWalletValid || !usdAmount || parseFloat(usdAmount) < 10}
            className="w-full"
            variant="primary"
          >
            Continue to Payment
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>" Minimum purchase: $10</p>
          <p>" Tokens delivered instantly after payment</p>
          <p>" Secure payments powered by Stripe</p>
        </div>
      </div>
    );
  }

  // Step 2: Payment
  if (step === 2) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
          <button
            onClick={() => setStep(1)}
            className="text-blue-600 hover:text-blue-500 text-sm flex items-center"
          >
            � Back to configuration
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
    );
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your CDX tokens are being delivered to your Solana wallet.</p>

          {/* Transaction Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">${parseFloat(usdAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CDX Tokens:</span>
                <span className="font-medium">{tokenAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Address:</span>
                <span className="font-medium text-xs break-all">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </span>
              </div>
              {paymentResult?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-xs">{paymentResult.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={resetFlow} className="w-full" variant="primary">
              Make Another Purchase
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
              variant="secondary"
            >
              View Transaction History
            </Button>
          </div>

          {/* Status Info */}
          <p className="text-xs text-gray-500 mt-4">
            Tokens typically arrive within 1-2 minutes. Check your wallet for confirmation.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default TokenPurchase;