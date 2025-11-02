import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
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
      console.log('🔗 API URL:', `${process.env.REACT_APP_API_URL}/api/payment/create-intent`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/create-intent`, {
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
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount (USD):</span>
            <span className="font-medium">${amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CDX Tokens:</span>
            <span className="font-medium">{tokenAmount?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Address:</span>
            <span className="font-medium text-xs break-all">
              {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isLoading || !walletAddress || !amount}
        className="w-full"
        variant="primary"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader size="sm" className="mr-2" />
            Processing Payment...
          </div>
        ) : (
          `Pay $${amount?.toFixed(2) || '0.00'}`
        )}
      </Button>

      {/* Payment Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        = Your payment information is encrypted and secure.
        Tokens will be delivered to your Solana wallet upon successful payment.
      </p>
    </form>
  );
};

export default PaymentForm;