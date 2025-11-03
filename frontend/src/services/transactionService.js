import api from './api';

const transactionService = {
  // Get user's transaction history with pagination and filtering
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/api/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get specific transaction details
  getTransactionDetails: async (transactionId) => {
    try {
      const response = await api.get(`/api/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  },

  // Get transaction statistics
  getTransactionStats: async (period = '30d') => {
    try {
      const response = await api.get('/api/transactions/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  },

  // Export transaction history
  exportTransactions: async (params = {}) => {
    try {
      const response = await api.get('/api/transactions/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  },

  // Retry failed transaction
  retryTransaction: async (transactionId) => {
    try {
      const response = await api.post(`/api/transactions/${transactionId}/retry`);
      return response.data;
    } catch (error) {
      console.error('Error retrying transaction:', error);
      throw error;
    }
  }
};

export default transactionService;