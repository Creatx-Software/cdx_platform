import api from '../../services/api';

const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Transaction Management
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/admin/transactions', { params });
    return response.data;
  },

  retryTransaction: async (transactionId) => {
    const response = await api.post(`/api/admin/transactions/${transactionId}/retry`);
    return response.data;
  },

  exportTransactions: async (params = {}) => {
    const response = await api.get('/api/admin/transactions/export', {
      params,
      responseType: 'blob'
    });
    return response;
  },

  // Token Configuration
  getTokenConfig: async () => {
    const response = await api.get('/api/admin/token-config');
    return response.data;
  },

  updateTokenConfig: async (config) => {
    const response = await api.put('/api/admin/token-config', config);
    return response.data;
  },

  // Wallet Balance Check
  getWalletBalance: async (walletAddress) => {
    const response = await api.get(`/api/admin/wallet-balance/${walletAddress}`);
    return response.data;
  }
};

export default adminService;