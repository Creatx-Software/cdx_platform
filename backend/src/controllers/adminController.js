const { User, Transaction, Token } = require('../models');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');

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
          COUNT(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'completed' THEN 1 END) as completed_transactions,
          COUNT(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'pending' THEN 1 END) as pending_fulfillments,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_transactions,
          SUM(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'completed' THEN usd_amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'completed' THEN token_amount ELSE 0 END) as total_tokens_sold,
          AVG(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'completed' THEN usd_amount ELSE NULL END) as avg_transaction_amount
        FROM transactions
      `);

      // Get today's statistics
      const [todayStats] = await query(`
        SELECT
          COUNT(*) as today_transactions,
          SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) as today_revenue,
          COUNT(DISTINCT user_id) as today_active_users
        FROM transactions
        WHERE DATE(created_at) = CURDATE()
      `);

      // Get recent transactions for dashboard
      const recentTransactions = await query(`
        SELECT
          t.id,
          t.transaction_uuid,
          t.usd_amount,
          t.token_amount,
          t.payment_status,
          t.fulfillment_status,
          t.created_at,
          tk.token_symbol,
          tk.token_name,
          u.email,
          u.first_name,
          u.last_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN tokens tk ON t.token_id = tk.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        stats: {
          users: userStats,
          transactions: transactionStats,
          today: todayStats
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
          COALESCE(SUM(CASE WHEN t.payment_status = 'succeeded' THEN t.usd_amount ELSE 0 END), 0) as total_spent,
          COALESCE(SUM(CASE WHEN t.fulfillment_status = 'completed' THEN t.token_amount ELSE 0 END), 0) as total_tokens
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
        whereConditions.push('t.payment_status = ?');
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
          SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) as total_spent,
          SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_transactions
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
        'SELECT * FROM transactions WHERE id = ? AND payment_status = "failed"',
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
        'UPDATE transactions SET payment_status = "pending" WHERE id = ?',
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
        whereConditions.push('t.payment_status = ?');
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
          t.usd_amount,
          t.token_amount,
          t.price_per_token,
          t.payment_status,
          t.fulfillment_status,
          t.created_at,
          t.completed_at,
          u.email as user_email,
          u.first_name,
          u.last_name,
          t.stripe_payment_intent_id,
          t.fulfillment_transaction_hash
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ${whereClause}
        ORDER BY t.created_at DESC
      `;

      const transactions = await query(transactionQuery, queryParams);

      // Create CSV content
      const csvHeader = 'ID,UUID,User Email,User Name,Amount USD,Tokens,Token Price,Payment Status,Fulfillment Status,Created,Completed,Stripe Payment ID,Fulfillment TX Hash\n';
      const csvRows = transactions.map(t => {
        return [
          t.id,
          t.transaction_uuid,
          t.user_email,
          `"${t.first_name} ${t.last_name}"`,
          t.usd_amount,
          t.token_amount,
          t.price_per_token,
          t.payment_status,
          t.fulfillment_status,
          t.created_at,
          t.completed_at || '',
          t.stripe_payment_intent_id || '',
          t.fulfillment_transaction_hash || ''
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

  // Get pending fulfillments
  getPendingFulfillments: async (req, res, next) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.getPendingFulfillments(
        parseInt(limit),
        offset
      );

      // Get total count
      const totalCount = await Transaction.getPendingFulfillmentsCount();

      res.json({
        success: true,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          total_pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Get pending fulfillments error:', error);
      next(error);
    }
  },

  // Mark transaction as fulfilled
  fulfillTransaction: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { notes, transaction_hash } = req.body;
      const adminId = req.userId;

      // Get transaction details
      const transaction = await Transaction.findTransactionById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Check if payment was successful
      if (transaction.payment_status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Cannot fulfill transaction - payment not successful'
        });
      }

      // Check if already fulfilled
      if (transaction.fulfillment_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Transaction already fulfilled'
        });
      }

      // Mark as fulfilled
      const fulfilled = await Transaction.markAsFulfilled(
        id,
        adminId,
        notes,
        transaction_hash
      );

      if (!fulfilled) {
        return res.status(500).json({
          success: false,
          message: 'Failed to mark transaction as fulfilled'
        });
      }

      // Send email notification to user
      try {
        await emailService.sendTokensFulfilledEmail(
          transaction.user_email,
          `${transaction.first_name} ${transaction.last_name}`,
          transaction.token_symbol,
          transaction.token_amount,
          transaction.recipient_wallet_address,
          transaction_hash
        );
      } catch (emailError) {
        logger.error('Failed to send fulfillment email:', emailError);
        // Don't fail the request if email fails
      }

      // Log admin action
      logger.info(`Transaction ${id} fulfilled by admin ${adminId}`);

      res.json({
        success: true,
        message: 'Transaction marked as fulfilled successfully'
      });
    } catch (error) {
      logger.error('Fulfill transaction error:', error);
      next(error);
    }
  },

  // Update fulfillment status (processing, cancelled, etc.)
  updateFulfillmentStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const adminId = req.userId;

      // Validate status
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Get transaction
      const transaction = await Transaction.findTransactionById(id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Update status
      const updated = await Transaction.updateFulfillmentStatus(id, status, {
        fulfilledBy: adminId,
        notes
      });

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update fulfillment status'
        });
      }

      logger.info(`Transaction ${id} fulfillment status updated to ${status} by admin ${adminId}`);

      res.json({
        success: true,
        message: 'Fulfillment status updated successfully'
      });
    } catch (error) {
      logger.error('Update fulfillment status error:', error);
      next(error);
    }
  },

  // Get fulfillment statistics
  getFulfillmentStats: async (req, res, next) => {
    try {
      const stats = await query(`
        SELECT
          COUNT(CASE WHEN fulfillment_status = 'pending' AND payment_status = 'succeeded' THEN 1 END) as pending_count,
          COUNT(CASE WHEN fulfillment_status = 'processing' THEN 1 END) as processing_count,
          COUNT(CASE WHEN fulfillment_status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN fulfillment_status = 'cancelled' THEN 1 END) as cancelled_count,
          MIN(CASE WHEN fulfillment_status = 'pending' AND payment_status = 'succeeded' THEN created_at END) as oldest_pending,
          AVG(CASE WHEN fulfillment_status = 'completed' THEN TIMESTAMPDIFF(HOUR, created_at, fulfilled_at) END) as avg_fulfillment_time_hours
        FROM transactions
      `);

      res.json({
        success: true,
        stats: stats[0]
      });
    } catch (error) {
      logger.error('Get fulfillment stats error:', error);
      next(error);
    }
  }
};

module.exports = adminController;