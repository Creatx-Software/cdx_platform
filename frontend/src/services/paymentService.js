import api from './api';

const paymentService = {
  // Create payment intent for token purchase
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await api.post('/payment/create-intent', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    try {
      const response = await api.post('/payment/confirm', {
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
      const response = await api.get(`/payment/status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  },

  // Get available tokens for purchase
  getAvailableTokens: async () => {
    try {
      const response = await api.get('/tokens');
      return response.data;
    } catch (error) {
      console.error('Error fetching available tokens:', error);
      throw error;
    }
  },

  // Calculate token amount for USD (removed - calculation done on frontend)
  // Keeping for backward compatibility but using token price from tokens endpoint

  // Validate wallet address (basic validation - can be enhanced on backend)
  validateWalletAddress: (walletAddress) => {
    // Basic validation
    if (!walletAddress || walletAddress.length < 20) {
      return { valid: false, error: 'Invalid wallet address' };
    }
    return { valid: true };
  },

  // Get payment history
  getPaymentHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/payment/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Get transaction details
  getTransactionDetails: async (transactionId) => {
    try {
      const response = await api.get(`/payment/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }
};

export default paymentService;