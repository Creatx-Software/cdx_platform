import api from './api';

const paymentService = {
  // Create payment intent for token purchase
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await api.post('/api/payments/create-intent', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    try {
      const response = await api.post('/api/payments/confirm', {
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentIntentId) => {
    try {
      const response = await api.get(`/api/payments/status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  },

  // Get token pricing
  getTokenPricing: async () => {
    try {
      const response = await api.get('/api/payments/token-pricing');
      return response.data;
    } catch (error) {
      console.error('Error fetching token pricing:', error);
      throw error;
    }
  },

  // Calculate token amount for USD
  calculateTokenAmount: async (usdAmount) => {
    try {
      const response = await api.post('/api/payments/calculate-tokens', {
        usd_amount: usdAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating token amount:', error);
      throw error;
    }
  },

  // Validate wallet address
  validateWalletAddress: async (walletAddress) => {
    try {
      const response = await api.post('/api/payments/validate-wallet', {
        wallet_address: walletAddress
      });
      return response.data;
    } catch (error) {
      console.error('Error validating wallet address:', error);
      throw error;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/api/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Cancel payment
  cancelPayment: async (paymentIntentId) => {
    try {
      const response = await api.post(`/api/payments/cancel/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  }
};

export default paymentService;