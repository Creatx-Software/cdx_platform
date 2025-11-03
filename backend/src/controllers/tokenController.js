const { query } = require('../config/database');
const logger = require('../utils/logger');

const tokenController = {
  // Get current token price
  getTokenPrice: async (req, res, next) => {
    try {
      // Get current active token configuration
      const tokenConfig = await query(
        'SELECT price_per_token FROM token_configuration WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
      );

      if (!tokenConfig.length) {
        return res.status(404).json({
          success: false,
          error: 'Token configuration not found'
        });
      }

      const tokenPrice = parseFloat(tokenConfig[0].price_per_token);

      res.json({
        success: true,
        price: tokenPrice
      });

    } catch (error) {
      logger.error('Get token price error:', error);
      next(error);
    }
  },

  // Get token configuration details
  getTokenConfig: async (req, res, next) => {
    try {
      // Get current active token configuration
      const tokenConfig = await query(
        `SELECT
          price_per_token,
          min_purchase_amount,
          max_purchase_amount,
          min_token_amount,
          max_token_amount,
          daily_purchase_limit_per_user,
          currency,
          is_active,
          created_at
        FROM token_configuration
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1`
      );

      if (!tokenConfig.length) {
        return res.status(404).json({
          success: false,
          error: 'Token configuration not found'
        });
      }

      const config = tokenConfig[0];

      res.json({
        success: true,
        config: {
          price_per_token: parseFloat(config.price_per_token),
          min_purchase_amount: parseFloat(config.min_purchase_amount),
          max_purchase_amount: parseFloat(config.max_purchase_amount),
          min_token_amount: parseInt(config.min_token_amount),
          max_token_amount: parseInt(config.max_token_amount),
          daily_purchase_limit_per_user: parseFloat(config.daily_purchase_limit_per_user),
          currency: config.currency,
          is_active: config.is_active,
          created_at: config.created_at
        }
      });

    } catch (error) {
      logger.error('Get token config error:', error);
      next(error);
    }
  }
};

module.exports = tokenController;