import api from './api';

const authService = {
  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    console.log('Register response:', response);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;

    try {
      // Decode JWT token (simple base64 decode of payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Treat invalid tokens as expired
    }
  },

  // Check if authenticated and token is valid
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Check if token is expired
    if (authService.isTokenExpired(token)) {
      // Auto-logout if token is expired
      authService.logout();
      return false;
    }

    return true;
  },

  // Validate current session
  validateSession: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      return false;
    }

    if (authService.isTokenExpired(token)) {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    return true;
  }
};

export default authService;