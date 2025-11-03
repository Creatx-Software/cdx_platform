import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await api.get('/api/transactions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/api/user/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Get user notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/api/user/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/user/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};

export default userService;