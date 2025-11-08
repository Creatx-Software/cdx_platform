const { query } = require('../config/database');
const logger = require('../utils/logger');

const Token = {
  // Get all active tokens
  getAllActiveTokens: async () => {
    try {
      const sql = `
        SELECT * FROM tokens
        WHERE is_active = TRUE
        ORDER BY display_order, token_name
      `;
      const results = await query(sql);
      return results;
    } catch (error) {
      logger.error('Error getting active tokens:', error);
      throw error;
    }
  },

  // Get all tokens (including inactive) - Admin only
  getAllTokens: async () => {
    try {
      const sql = `
        SELECT t.*, u.email as creator_email, u.first_name as creator_name
        FROM tokens t
        LEFT JOIN users u ON t.created_by = u.id
        ORDER BY t.display_order, t.token_name
      `;
      const results = await query(sql);
      return results;
    } catch (error) {
      logger.error('Error getting all tokens:', error);
      throw error;
    }
  },

  // Get token by ID
  getTokenById: async (id) => {
    try {
      const sql = 'SELECT * FROM tokens WHERE id = ?';
      const results = await query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error getting token by ID ${id}:`, error);
      throw error;
    }
  },

  // Get token by symbol
  getTokenBySymbol: async (symbol) => {
    try {
      const sql = 'SELECT * FROM tokens WHERE token_symbol = ? AND is_active = TRUE';
      const results = await query(sql, [symbol]);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error getting token by symbol ${symbol}:`, error);
      throw error;
    }
  },

  // Create new token (Admin only)
  createToken: async (tokenData) => {
    try {
      const {
        tokenName,
        tokenSymbol,
        tokenAddress,
        blockchain,
        pricePerToken,
        currency = 'USD',
        minPurchaseAmount = 10.00,
        maxPurchaseAmount = 10000.00,
        minTokenAmount = 100,
        maxTokenAmount = 100000,
        dailyPurchaseLimit = 5000.00,
        isActive = true,
        displayOrder = 0,
        description,
        logoUrl,
        createdBy
      } = tokenData;

      const sql = `
        INSERT INTO tokens (
          token_name, token_symbol, token_address, blockchain,
          price_per_token, currency,
          min_purchase_amount, max_purchase_amount,
          min_token_amount, max_token_amount,
          daily_purchase_limit,
          is_active, display_order,
          description, logo_url, created_by,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await query(sql, [
        tokenName,
        tokenSymbol,
        tokenAddress,
        blockchain,
        pricePerToken,
        currency,
        minPurchaseAmount,
        maxPurchaseAmount,
        minTokenAmount,
        maxTokenAmount,
        dailyPurchaseLimit,
        isActive,
        displayOrder,
        description,
        logoUrl,
        createdBy
      ]);

      logger.info(`Token created: ${tokenSymbol} (ID: ${result.insertId})`);
      return result.insertId;
    } catch (error) {
      logger.error('Error creating token:', error);
      throw error;
    }
  },

  // Update token (Admin only)
  updateToken: async (id, updates) => {
    try {
      const allowedFields = [
        'token_name', 'token_symbol', 'token_address', 'blockchain',
        'price_per_token', 'currency',
        'min_purchase_amount', 'max_purchase_amount',
        'min_token_amount', 'max_token_amount',
        'daily_purchase_limit', 'is_active', 'display_order',
        'description', 'logo_url'
      ];

      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      fields.push('updated_at = NOW()');
      values.push(id);

      const sql = `UPDATE tokens SET ${fields.join(', ')} WHERE id = ?`;
      const result = await query(sql, values);

      logger.info(`Token updated: ID ${id}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating token ID ${id}:`, error);
      throw error;
    }
  },

  // Deactivate token (Admin only)
  deactivateToken: async (id) => {
    try {
      const sql = 'UPDATE tokens SET is_active = FALSE, updated_at = NOW() WHERE id = ?';
      const result = await query(sql, [id]);

      logger.info(`Token deactivated: ID ${id}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error deactivating token ID ${id}:`, error);
      throw error;
    }
  },

  // Activate token (Admin only)
  activateToken: async (id) => {
    try {
      const sql = 'UPDATE tokens SET is_active = TRUE, updated_at = NOW() WHERE id = ?';
      const result = await query(sql, [id]);

      logger.info(`Token activated: ID ${id}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error activating token ID ${id}:`, error);
      throw error;
    }
  },

  // Check if token symbol exists
  tokenSymbolExists: async (symbol, excludeId = null) => {
    try {
      let sql = 'SELECT COUNT(*) as count FROM tokens WHERE token_symbol = ?';
      const params = [symbol];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      const results = await query(sql, params);
      return results[0].count > 0;
    } catch (error) {
      logger.error('Error checking token symbol:', error);
      throw error;
    }
  },

  // Get token sales statistics
  getTokenSalesStats: async (tokenId) => {
    try {
      const sql = `
        SELECT
          COUNT(t.id) as total_orders,
          SUM(CASE WHEN t.payment_status = 'succeeded' THEN 1 ELSE 0 END) as successful_payments,
          SUM(CASE WHEN t.fulfillment_status = 'completed' THEN 1 ELSE 0 END) as fulfilled_orders,
          SUM(CASE WHEN t.fulfillment_status = 'pending' AND t.payment_status = 'succeeded' THEN 1 ELSE 0 END) as pending_fulfillment,
          COALESCE(SUM(t.usd_amount), 0) as total_revenue,
          COALESCE(SUM(t.token_amount), 0) as total_tokens_sold,
          COALESCE(AVG(t.usd_amount), 0) as avg_order_value,
          MIN(t.created_at) as first_sale,
          MAX(t.created_at) as last_sale
        FROM transactions t
        WHERE t.token_id = ?
      `;

      const results = await query(sql, [tokenId]);
      return results[0];
    } catch (error) {
      logger.error(`Error getting token sales stats for ID ${tokenId}:`, error);
      throw error;
    }
  }
};

module.exports = Token;
