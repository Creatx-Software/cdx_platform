import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      '::placeholder': {
        color: '#6b7280',
      },
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.75',
      padding: '16px 20px',
    },
    focus: {
      color: '#1f2937',
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
    complete: {
      color: '#059669',
      iconColor: '#059669',
    },
  },
  hidePostalCode: true,
};

export const PaymentForm = ({
  amount,
  tokenAmount,
  walletAddress,
  onSuccess,
  onError,
  isLoading: parentLoading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded properly. Please refresh the page.');
      return;
    }

    if (!walletAddress) {
      setError('Please enter a valid Solana wallet address.');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment intent on backend
      const token = localStorage.getItem('token');
      console.log('🔐 Auth token:', token ? 'Present' : 'Missing');
      console.log('🔗 API URL:', `${process.env.REACT_APP_API_URL}/payment/create-intent`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          usdAmount: amount,
          tokenAmount,
          walletAddress,
        }),
      });


      console.log("🚀 Payment intent response status:", response) ;

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Payment intent failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const responseData = await response.json();
      const { paymentIntent, transaction } = responseData;
      const clientSecret = paymentIntent.clientSecret;
      const transactionId = transaction.id;

      console.log('✅ Payment intent created:', {
        transactionId,
        clientSecret: clientSecret ? 'Present' : 'Missing',
        paymentIntentId: paymentIntent.id
      });

      // Confirm payment
      const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (confirmedPaymentIntent.status === 'succeeded') {
        onSuccess({ paymentIntent: confirmedPaymentIntent, transactionId });
      } else {
        throw new Error('Payment was not successful');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      onError && onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || parentLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="card-gold p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <svg className="mr-2 h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Payment Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-primary-200">
            <span className="text-text-muted">Amount (USD):</span>
            <span className="font-bold text-gradient text-xl">${amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-primary-200">
            <span className="text-text-muted">CDX Tokens:</span>
            <span className="font-bold text-gradient text-xl">{tokenAmount?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-text-muted">Delivery Address:</span>
            <span className="font-mono text-sm font-medium text-text-primary break-all">
              {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div className="form-group">
        <label className="form-label">
          Card Information <span className="text-accent-error">*</span>
        </label>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-1 transition-all duration-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 shadow-sm">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="mt-2 flex justify-end">
          <div className="flex space-x-1">
            <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
            <div className="w-8 h-5 bg-gradient-to-r from-red-600 to-red-700 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
            <div className="w-8 h-5 bg-gradient-to-r from-green-600 to-green-700 rounded text-white text-xs flex items-center justify-center font-bold">AE</div>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2 flex items-center">
          <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Secured with 256-bit SSL encryption
        </p>
      </div>

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

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isLoading || !walletAddress || !amount}
        className="btn-primary w-full py-4 text-lg font-medium transform hover-scale shadow-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pay ${amount?.toFixed(2) || '0.00'}
          </span>
        )}
      </Button>

      {/* Payment Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        🔒 Your payment information is encrypted and secure.
        Tokens will be delivered to your Solana wallet upon successful payment.
      </p>
    </form>
  );
};

export default PaymentForm;