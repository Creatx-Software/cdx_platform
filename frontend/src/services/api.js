import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token to requests and validate expiration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is expired before making the request
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp < currentTime) {
          // Token is expired, clear storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        // Invalid token format, clear storage and redirect
        console.error('Invalid token format:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Invalid token'));
      }
    }

    // Debug: Log the full URL being requested
    console.log('🚀 API Request:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: config.baseURL + config.url,
      method: config.method.toUpperCase()
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Handle 403
      if (error.response.status === 403) {
        console.error('Access denied');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;