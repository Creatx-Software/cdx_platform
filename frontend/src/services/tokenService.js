import api from './api';

/**
 * Token Service
 * Handles all token-related API calls for the CDX platform
 */
const tokenService = {
  /**
   * Get all active tokens available for purchase
   * @returns {Promise} Response with array of active tokens
   */
  getAllTokens: async () => {
    try {
      const response = await api.get('/tokens');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tokens:', error);
      throw error;
    }
  },

  /**
   * Get all tokens (including inactive) - Admin only
   * @returns {Promise} Response with array of all tokens
   */
  getAllTokensAdmin: async () => {
    try {
      const response = await api.get('/tokens/admin/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tokens (admin):', error);
      throw error;
    }
  },

  /**
   * Get details of a specific token
   * @param {number} tokenId - Token ID
   * @returns {Promise} Response with token details
   */
  getTokenDetails: async (tokenId) => {
    try {
      const response = await api.get(`/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new token - Admin only
   * @param {Object} tokenData - Token data
   * @returns {Promise} Response with created token ID
   */
  createToken: async (tokenData) => {
    try {
      const response = await api.post('/tokens', tokenData);
      return response.data;
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  },

  /**
   * Update an existing token - Admin only
   * @param {number} tokenId - Token ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} Response with update confirmation
   */
  updateToken: async (tokenId, updates) => {
    try {
      const response = await api.put(`/tokens/${tokenId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Deactivate a token - Admin only
   * @param {number} tokenId - Token ID
   * @returns {Promise} Response with deactivation confirmation
   */
  deactivateToken: async (tokenId) => {
    try {
      const response = await api.delete(`/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Activate a token - Admin only
   * @param {number} tokenId - Token ID
   * @returns {Promise} Response with activation confirmation
   */
  activateToken: async (tokenId) => {
    try {
      const response = await api.patch(`/tokens/${tokenId}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Error activating token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Get token statistics - Admin only
   * @param {number} tokenId - Token ID
   * @returns {Promise} Response with token statistics
   */
  getTokenStats: async (tokenId) => {
    try {
      const response = await api.get(`/tokens/${tokenId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching token stats for ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Calculate token amount for a given USD amount
   * @param {number} usdAmount - USD amount
   * @param {number} pricePerToken - Price per token
   * @returns {number} Number of tokens
   */
  calculateTokenAmount: (usdAmount, pricePerToken) => {
    if (!usdAmount || !pricePerToken || pricePerToken === 0) {
      return 0;
    }
    return Math.floor(usdAmount / pricePerToken);
  },

  /**
   * Calculate USD amount for a given number of tokens
   * @param {number} tokenAmount - Number of tokens
   * @param {number} pricePerToken - Price per token
   * @returns {number} USD amount
   */
  calculateUSDAmount: (tokenAmount, pricePerToken) => {
    if (!tokenAmount || !pricePerToken) {
      return 0;
    }
    return (tokenAmount * pricePerToken).toFixed(2);
  },

  /**
   * Validate token purchase amount against limits
   * @param {number} usdAmount - USD amount
   * @param {Object} token - Token object with limits
   * @returns {Object} Validation result { valid: boolean, error: string }
   */
  validatePurchaseAmount: (usdAmount, token) => {
    if (!usdAmount || usdAmount <= 0) {
      return { valid: false, error: 'Please enter a valid amount' };
    }

    if (usdAmount < token.min_purchase_amount) {
      return {
        valid: false,
        error: `Minimum purchase amount is $${token.min_purchase_amount}`
      };
    }

    if (usdAmount > token.max_purchase_amount) {
      return {
        valid: false,
        error: `Maximum purchase amount is $${token.max_purchase_amount}`
      };
    }

    const tokenAmount = tokenService.calculateTokenAmount(usdAmount, token.price_per_token);

    if (tokenAmount < token.min_token_amount) {
      return {
        valid: false,
        error: `Minimum token amount is ${token.min_token_amount} ${token.token_symbol}`
      };
    }

    if (tokenAmount > token.max_token_amount) {
      return {
        valid: false,
        error: `Maximum token amount is ${token.max_token_amount} ${token.token_symbol}`
      };
    }

    return { valid: true, tokenAmount };
  }
};

export default tokenService;
