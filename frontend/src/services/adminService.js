import api from './api';

class AdminService {
  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  // Transaction Management
  async getTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransactionDetails(transactionId) {
    try {
      const response = await api.get(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }

  async retryTransaction(transactionId) {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/retry`);
      return response.data;
    } catch (error) {
      console.error('Error retrying transaction:', error);
      throw error;
    }
  }

  async exportTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/transactions/export?${queryParams}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }

  // Token Configuration
  async getTokenConfig() {
    try {
      const response = await api.get('/admin/token-config');
      return response.data;
    } catch (error) {
      console.error('Error fetching token config:', error);
      throw error;
    }
  }

  async updateTokenConfig(config) {
    try {
      const response = await api.put('/admin/token-config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating token config:', error);
      throw error;
    }
  }

  // Wallet Management
  async getWalletBalance(walletAddress) {
    try {
      const response = await api.get(`/admin/wallet-balance/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  // System Operations
  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  async refreshSystemCache() {
    try {
      const response = await api.post('/admin/system/refresh-cache');
      return response.data;
    } catch (error) {
      console.error('Error refreshing system cache:', error);
      throw error;
    }
  }

  // Analytics and Reports
  async getAnalytics(timeRange = '7d') {
    try {
      const response = await api.get(`/admin/analytics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async generateReport(type, params = {}) {
    try {
      const queryParams = new URLSearchParams({ type, ...params }).toString();
      const response = await api.get(`/admin/reports?${queryParams}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // User Actions
  async updateUserStatus(userId, status) {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async sendUserNotification(userId, notification) {
    try {
      const response = await api.post(`/admin/users/${userId}/notify`, notification);
      return response.data;
    } catch (error) {
      console.error('Error sending user notification:', error);
      throw error;
    }
  }

  // Transaction Actions
  async updateTransactionStatus(transactionId, status, notes = '') {
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  async refundTransaction(transactionId, reason = '') {
    try {
      const response = await api.post(`/admin/transactions/${transactionId}/refund`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Settings Management
  async getSystemSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  async updateSystemSettings(settings) {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/audit-logs?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  // Security
  async getSecurityEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/security/events?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw error;
    }
  }

  async blockIPAddress(ipAddress, reason = '') {
    try {
      const response = await api.post('/admin/security/block-ip', {
        ip_address: ipAddress,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error blocking IP address:', error);
      throw error;
    }
  }

  async unblockIPAddress(ipAddress) {
    try {
      const response = await api.delete(`/admin/security/block-ip/${ipAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error unblocking IP address:', error);
      throw error;
    }
  }

  // Monitoring
  async getServerMetrics() {
    try {
      const response = await api.get('/admin/monitoring/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching server metrics:', error);
      throw error;
    }
  }

  async getErrorLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/monitoring/errors?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching error logs:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const adminService = new AdminService();
export default adminService;