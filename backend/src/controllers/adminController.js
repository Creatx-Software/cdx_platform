const { User, Transaction, TokenConfig } = require('../models');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const solanaService = require('../services/solanaService');
const stripeService = require('../services/stripeService');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res, next) => {
    console.log("getDashboardStats called");
    try {
      // Get user statistics
      const [userStats] = await query(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as verified_users,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d
        FROM users
      `);

      // Get transaction statistics
      const [transactionStats] = await query(`
        SELECT
          COUNT(*) as total_transactions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as total_revenue,
          SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) as total_tokens_sold,
          AVG(CASE WHEN status = 'completed' THEN amount_usd ELSE NULL END) as avg_transaction_amount
        FROM transactions
      `);

      // Get today's statistics
      const [todayStats] = await query(`
        SELECT
          COUNT(*) as today_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as today_revenue,
          COUNT(DISTINCT user_id) as today_active_users
        FROM transactions
        WHERE DATE(created_at) = CURDATE()
      `);

      // Get recent transactions for dashboard
      const recentTransactions = await query(`
        SELECT
          t.id,
          t.amount_usd,
          t.token_amount,
          t.status,
          t.created_at,
          u.email,
          u.first_name,
          u.last_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);

      // Get treasury balances
      const treasurySOL = await solanaService.getTreasuryBalance();
      const treasuryTokens = await solanaService.getTreasuryTokenBalance();

      // Get current token configuration
      const tokenConfig = await TokenConfig.getActiveConfig();

      res.json({
        success: true,
        stats: {
          users: userStats,
          transactions: transactionStats,
          today: todayStats,
          treasury: {
            sol_balance: treasurySOL.success ? treasurySOL.balance : 0,
            token_balance: treasuryTokens.success ? treasuryTokens.balance : 0
          },
          token_config: tokenConfig
        },
        recent_transactions: recentTransactions
      });

    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      next(error);
    }
  },

  // Get users with filtering and pagination
  getUsers: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status = 'all'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Simple approach - use basic query first, add filtering later
      let usersQuery = `
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.email_verified,
          u.created_at,
          u.last_login_at,
          COALESCE(COUNT(t.id), 0) as transaction_count,
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount_usd ELSE 0 END), 0) as total_spent,
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.token_amount ELSE 0 END), 0) as total_tokens
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
      `;

      let countQuery = `SELECT COUNT(*) as total FROM users u`;
      let queryParams = [];

      // Add filtering if needed
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        usersQuery += ` WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
        countQuery += ` WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
        queryParams = [searchTerm, searchTerm, searchTerm];
      }

      if (status === 'verified') {
        const statusFilter = search && search.trim() ? ' AND u.email_verified = TRUE' : ' WHERE u.email_verified = TRUE';
        usersQuery += statusFilter;
        countQuery += statusFilter;
      } else if (status === 'unverified') {
        const statusFilter = search && search.trim() ? ' AND u.email_verified = FALSE' : ' WHERE u.email_verified = FALSE';
        usersQuery += statusFilter;
        countQuery += statusFilter;
      }

      usersQuery += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

      // Execute queries
      const users = await query(usersQuery, queryParams);
      const [countResult] = await query(countQuery, queryParams);

      const total = countResult.total;
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_users: total,
          users_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        }
      });

    } catch (error) {
      logger.error('Get users error:', error);
      next(error);
    }
  },

  // Get transactions with filtering and pagination
  getTransactions: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'all',
        start_date = '',
        end_date = '',
        search = '',
        user_id = ''
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Simple approach - base query
      let transactionQuery = `
        SELECT
          t.*,
          u.email as user_email,
          u.first_name,
          u.last_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
      `;

      let countQuery = `
        SELECT COUNT(*) as total
        FROM transactions t
        JOIN users u ON t.user_id = u.id
      `;

      let whereConditions = [];
      let queryParams = [];

      // Add filtering
      if (status !== 'all') {
        whereConditions.push('t.status = ?');
        queryParams.push(status);
      }

      if (start_date) {
        whereConditions.push('DATE(t.created_at) >= ?');
        queryParams.push(start_date);
      }

      if (end_date) {
        whereConditions.push('DATE(t.created_at) <= ?');
        queryParams.push(end_date);
      }

      if (user_id) {
        whereConditions.push('t.user_id = ?');
        queryParams.push(parseInt(user_id));
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        whereConditions.push(`(t.id LIKE ? OR u.email LIKE ? OR t.recipient_wallet_address LIKE ?)`);
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Add WHERE clause if we have conditions
      if (whereConditions.length > 0) {
        const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
        transactionQuery += whereClause;
        countQuery += whereClause;
      }

      // Add ordering and pagination
      transactionQuery += ` ORDER BY t.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

      // Execute queries
      const transactions = await query(transactionQuery, queryParams);
      const [countResult] = await query(countQuery, queryParams);

      const total = countResult.total;
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        transactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_transactions: total,
          transactions_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        }
      });

    } catch (error) {
      logger.error('Get transactions error:', error);
      next(error);
    }
  },

  // Get current token configuration
  getTokenConfig: async (req, res, next) => {
    try {
      const [config] = await query(`
        SELECT
          price_per_token as token_price,
          min_purchase_amount as min_purchase_amount,
          max_purchase_amount as max_purchase_amount,
          daily_purchase_limit_per_user as daily_limit_usd,
          is_active as is_sale_active,
          created_at,
          updated_at
        FROM token_configuration
        ORDER BY created_at DESC
        LIMIT 1
      `);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'No active token configuration found'
        });
      }

      // Add additional calculated fields
      const enhancedConfig = {
        ...config,
        total_supply: 1000000, // From your initial mint
        available_supply: 1000000 // This should be calculated from your treasury balance
      };

      res.json({
        success: true,
        config: enhancedConfig
      });

    } catch (error) {
      logger.error('Get token config error:', error);
      next(error);
    }
  },

  // Update token configuration
  updateTokenConfig: async (req, res, next) => {
    try {
      const {
        token_price,
        min_purchase_amount,
        max_purchase_amount,
        daily_limit_usd,
        is_sale_active,
        total_supply,
        available_supply
      } = req.body;

      // Validate required fields
      if (!token_price || token_price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid token price is required'
        });
      }

      // Deactivate current config
      await query('UPDATE token_configuration SET is_active = FALSE');

      // Create new config - map frontend names to database columns
      const result = await query(`
        INSERT INTO token_configuration (
          price_per_token,
          min_purchase_amount,
          max_purchase_amount,
          daily_purchase_limit_per_user,
          is_active,
          updated_by,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        parseFloat(token_price),
        parseFloat(min_purchase_amount) || 10,
        parseFloat(max_purchase_amount) || 10000,
        parseFloat(daily_limit_usd) || 5000,
        is_sale_active !== false,
        req.userId
      ]);

      logger.info(`Token configuration updated by admin ${req.userId}`, {
        token_price,
        min_purchase_amount,
        max_purchase_amount,
        daily_limit_usd,
        is_sale_active
      });

      res.json({
        success: true,
        message: 'Token configuration updated successfully',
        config_id: result.insertId
      });

    } catch (error) {
      logger.error('Update token config error:', error);
      next(error);
    }
  },

  // Get user details with transaction history
  getUserDetails: async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Get user info
      const user = await User.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user transactions
      const transactions = await query(`
        SELECT * FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId]);

      // Get user statistics
      const [stats] = await query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as total_spent,
          SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions
        FROM transactions
        WHERE user_id = ?
      `, [userId]);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          email_verified: user.email_verified,
          created_at: user.created_at,
          last_login_at: user.last_login_at
        },
        stats,
        transactions
      });

    } catch (error) {
      logger.error('Get user details error:', error);
      next(error);
    }
  },

  // Retry failed transaction
  retryTransaction: async (req, res, next) => {
    try {
      const { transactionId } = req.params;

      // Find the transaction
      const [transaction] = await query(
        'SELECT * FROM transactions WHERE id = ? AND status = "failed"',
        [transactionId]
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Failed transaction not found'
        });
      }

      // Reset the transaction status to pending for retry
      await query(
        'UPDATE transactions SET status = "pending", retry_count = retry_count + 1 WHERE id = ?',
        [transactionId]
      );

      logger.info(`Transaction ${transactionId} marked for retry by admin ${req.userId}`);

      res.json({
        success: true,
        message: 'Transaction marked for retry'
      });

    } catch (error) {
      logger.error('Retry transaction error:', error);
      next(error);
    }
  },

  // Export transactions to CSV
  exportTransactions: async (req, res, next) => {
    try {
      const {
        status = 'all',
        start_date = '',
        end_date = '',
        search = '',
        user_id = ''
      } = req.query;

      // Build WHERE conditions (same as getTransactions)
      let whereConditions = [];
      let queryParams = [];

      if (status !== 'all') {
        whereConditions.push('t.status = ?');
        queryParams.push(status);
      }

      if (start_date) {
        whereConditions.push('DATE(t.created_at) >= ?');
        queryParams.push(start_date);
      }

      if (end_date) {
        whereConditions.push('DATE(t.created_at) <= ?');
        queryParams.push(end_date);
      }

      if (user_id) {
        whereConditions.push('t.user_id = ?');
        queryParams.push(parseInt(user_id));
      }

      if (search && search.trim()) {
        whereConditions.push(`(
          t.id LIKE ? OR
          t.transaction_uuid LIKE ? OR
          u.email LIKE ? OR
          t.recipient_wallet_address LIKE ?
        )`);
        const searchTerm = `%${search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const transactionQuery = `
        SELECT
          t.id,
          t.transaction_uuid,
          t.amount_usd,
          t.token_amount,
          t.token_price_at_purchase,
          t.status,
          t.created_at,
          t.completed_at,
          u.email as user_email,
          u.first_name,
          u.last_name,
          t.stripe_payment_intent_id,
          t.solana_transaction_signature
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ${whereClause}
        ORDER BY t.created_at DESC
      `;

      const transactions = await query(transactionQuery, queryParams);

      // Create CSV content
      const csvHeader = 'ID,UUID,User Email,User Name,Amount USD,Tokens,Token Price,Status,Created,Completed,Stripe Payment ID,Solana Transaction\n';
      const csvRows = transactions.map(t => {
        return [
          t.id,
          t.transaction_uuid,
          t.user_email,
          `"${t.first_name} ${t.last_name}"`,
          t.amount_usd,
          t.token_amount,
          t.token_price_at_purchase,
          t.status,
          t.created_at,
          t.completed_at || '',
          t.stripe_payment_intent_id || '',
          t.solana_transaction_signature || ''
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);

    } catch (error) {
      logger.error('Export transactions error:', error);
      next(error);
    }
  },

  // Get wallet token balance
  getWalletTokenBalance: async (req, res, next) => {
    try {
      const { wallet_address } = req.params;

      if (!solanaService.isValidSolanaAddress(wallet_address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Solana wallet address'
        });
      }

      const balance = await solanaService.getTokenBalance(wallet_address);

      res.json({
        success: true,
        wallet_address,
        balance: balance.success ? balance.balance : 0,
        error: balance.success ? null : balance.error
      });

    } catch (error) {
      logger.error('Get wallet token balance error:', error);
      next(error);
    }
  }
};

module.exports = adminController;