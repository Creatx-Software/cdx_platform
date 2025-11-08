import api from './api';

/**
 * Fulfillment Service
 * Handles all fulfillment-related API calls for admin token distribution management
 */
const fulfillmentService = {
  /**
   * Get all pending fulfillments - Admin only
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Promise} Response with array of pending fulfillments
   */
  getPendingFulfillments: async (page = 1, limit = 50) => {
    try {
      const response = await api.get(`/admin/fulfillments/pending?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending fulfillments:', error);
      throw error;
    }
  },

  /**
   * Get all fulfillments with filters - Admin only
   * @param {Object} filters - Filtering options
   * @param {string} filters.status - Fulfillment status filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise} Response with filtered fulfillments
   */
  getAllFulfillments: async (filters = {}) => {
    try {
      const {
        status = 'all',
        page = 1,
        limit = 50,
        tokenId = null,
        userId = null
      } = filters;

      let url = `/admin/fulfillments?page=${page}&limit=${limit}`;

      if (status && status !== 'all') {
        url += `&status=${status}`;
      }

      if (tokenId) {
        url += `&tokenId=${tokenId}`;
      }

      if (userId) {
        url += `&userId=${userId}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching fulfillments:', error);
      throw error;
    }
  },

  /**
   * Mark a transaction as fulfilled - Admin only
   * @param {number} transactionId - Transaction ID to fulfill
   * @param {Object} fulfillmentData - Fulfillment data
   * @param {string} fulfillmentData.transaction_hash - Blockchain transaction hash
   * @param {string} fulfillmentData.notes - Admin notes (optional)
   * @returns {Promise} Response with fulfillment confirmation
   */
  fulfillTransaction: async (transactionId, fulfillmentData) => {
    try {
      const response = await api.post(`/admin/fulfillments/${transactionId}/fulfill`, fulfillmentData);
      return response.data;
    } catch (error) {
      console.error(`Error fulfilling transaction ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Update fulfillment status - Admin only
   * @param {number} transactionId - Transaction ID
   * @param {string} status - New status (pending, processing, completed, cancelled)
   * @param {string} notes - Optional notes
   * @returns {Promise} Response with update confirmation
   */
  updateFulfillmentStatus: async (transactionId, status, notes = null) => {
    try {
      const response = await api.put(`/admin/fulfillments/${transactionId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating fulfillment status for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Get fulfillment statistics - Admin only
   * @returns {Promise} Response with fulfillment statistics
   */
  getFulfillmentStats: async () => {
    try {
      const response = await api.get('/admin/fulfillments/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching fulfillment stats:', error);
      throw error;
    }
  },

  /**
   * Get fulfillment details for a specific transaction - Admin only
   * @param {number} transactionId - Transaction ID
   * @returns {Promise} Response with fulfillment details
   */
  getFulfillmentDetails: async (transactionId) => {
    try {
      const response = await api.get(`/admin/fulfillments/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fulfillment details for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Get fulfillment history for a specific user - Admin only
   * @param {number} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Response with user's fulfillment history
   */
  getUserFulfillments: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/admin/fulfillments/user/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fulfillments for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get fulfillments for a specific token - Admin only
   * @param {number} tokenId - Token ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Response with token's fulfillment data
   */
  getTokenFulfillments: async (tokenId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/admin/fulfillments/token/${tokenId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fulfillments for token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a pending fulfillment - Admin only
   * @param {number} transactionId - Transaction ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Response with cancellation confirmation
   */
  cancelFulfillment: async (transactionId, reason) => {
    try {
      const response = await api.post(`/admin/fulfillments/${transactionId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling fulfillment for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Resend fulfillment notification email - Admin only
   * @param {number} transactionId - Transaction ID
   * @returns {Promise} Response with email resend confirmation
   */
  resendFulfillmentEmail: async (transactionId) => {
    try {
      const response = await api.post(`/admin/fulfillments/${transactionId}/resend-email`);
      return response.data;
    } catch (error) {
      console.error(`Error resending fulfillment email for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk update fulfillment statuses - Admin only
   * @param {Array} transactionIds - Array of transaction IDs
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Promise} Response with bulk update results
   */
  bulkUpdateStatus: async (transactionIds, status, notes = null) => {
    try {
      const response = await api.put('/admin/fulfillments/bulk/status', {
        transaction_ids: transactionIds,
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating fulfillment statuses:', error);
      throw error;
    }
  },

  /**
   * Export fulfillments to CSV - Admin only
   * @param {Object} filters - Export filters (status, dateRange, etc.)
   * @returns {Promise} Response with CSV data
   */
  exportFulfillments: async (filters = {}) => {
    try {
      const response = await api.post('/admin/fulfillments/export', filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting fulfillments:', error);
      throw error;
    }
  }
};

export default fulfillmentService;
