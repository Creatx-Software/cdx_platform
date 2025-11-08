const { Transaction } = require('../models');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const transactionController = {
  // Get user's transaction history
  getUserTransactions: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20, status = 'all' } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build query parameters
      let queryParams = [userId];
      let countParams = [userId];

      // Build SQL query with new schema
      let sql = `
        SELECT
          t.id,
          t.transaction_uuid,
          t.stripe_payment_intent_id,
          t.usd_amount,
          t.token_amount,
          t.recipient_wallet_address,
          t.payment_status,
          t.fulfillment_status,
          t.price_per_token,
          t.fulfillment_transaction_hash,
          t.error_message,
          t.created_at,
          t.fulfilled_at,
          t.completed_at,
          tk.token_symbol,
          tk.token_name,
          tk.blockchain
        FROM transactions t
        JOIN tokens tk ON t.token_id = tk.id
        WHERE t.user_id = ?
      `;

      let countSql = `
        SELECT COUNT(*) as total
        FROM transactions
        WHERE user_id = ?
      `;

      // Add status filter if specified (check payment_status)
      if (status !== 'all') {
        sql += ' AND t.payment_status = ?';
        countSql += ' AND payment_status = ?';
        queryParams.push(status);
        countParams.push(status);
      }

      // Add ordering and pagination (use string interpolation for LIMIT/OFFSET)
      sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

      // Get transactions
      const transactions = await query(sql, queryParams);

      // Get total count
      const [countResult] = await query(countSql, countParams);

      const total = countResult.total;
      const totalPages = Math.ceil(total / parseInt(limit));

      // Calculate statistics with new schema
      const [stats] = await query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) as total_spent,
          SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          COUNT(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'pending' THEN 1 END) as pending_fulfillment_count,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_count
        FROM transactions
        WHERE user_id = ?
      `, [userId]);

      res.json({
        success: true,
        transactions: transactions.map(tx => ({
          ...tx,
          usd_amount: parseFloat(tx.usd_amount),
          token_amount: parseFloat(tx.token_amount),
          price_per_token: parseFloat(tx.price_per_token)
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_transactions: total,
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        },
        stats
      });

    } catch (error) {
      logger.error('Get user transactions error:', error);
      next(error);
    }
  },

  // Get specific transaction details
  getTransactionDetails: async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      const transaction = await query(`
        SELECT
          t.*,
          u.email,
          u.first_name,
          u.last_name,
          tk.token_symbol,
          tk.token_name,
          tk.blockchain
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN tokens tk ON t.token_id = tk.id
        WHERE t.id = ? AND t.user_id = ?
      `, [transactionId, userId]);

      if (!transaction.length) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      const tx = transaction[0];

      res.json({
        success: true,
        transaction: {
          ...tx,
          usd_amount: parseFloat(tx.usd_amount),
          token_amount: parseFloat(tx.token_amount),
          price_per_token: parseFloat(tx.price_per_token)
        }
      });

    } catch (error) {
      logger.error('Get transaction details error:', error);
      next(error);
    }
  },


  // Get transaction statistics for user
  getTransactionStats: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { period = '30d' } = req.query;

      let dateClause = '';
      if (period === '7d') {
        dateClause = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (period === '30d') {
        dateClause = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      } else if (period === '90d') {
        dateClause = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
      }

      // Get overall statistics with new schema
      const [overallStats] = await query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) as total_spent,
          SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          AVG(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE NULL END) as avg_transaction,
          COUNT(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'pending' THEN 1 END) as pending_fulfillment_count,
          COUNT(CASE WHEN fulfillment_status = 'processing' THEN 1 END) as processing_count,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_count,
          MIN(created_at) as first_transaction,
          MAX(CASE WHEN fulfillment_status = 'completed' THEN created_at END) as last_successful
        FROM transactions
        WHERE user_id = ? ${dateClause}
      `, [userId]);

      // Get daily transaction counts for chart data
      const dailyStats = await query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) as daily_spent,
          SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) as daily_tokens
        FROM transactions
        WHERE user_id = ? ${dateClause}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
      `, [userId]);

      // Get status breakdown (combine payment and fulfillment status)
      const statusBreakdown = await query(`
        SELECT
          CONCAT(payment_status, '_', fulfillment_status) as status,
          COUNT(*) as count,
          SUM(usd_amount) as total_amount
        FROM transactions
        WHERE user_id = ? ${dateClause}
        GROUP BY payment_status, fulfillment_status
      `, [userId]);

      res.json({
        success: true,
        period,
        overall_stats: {
          ...overallStats,
          total_spent: parseFloat(overallStats.total_spent) || 0,
          total_tokens: parseFloat(overallStats.total_tokens) || 0,
          avg_transaction: parseFloat(overallStats.avg_transaction) || 0
        },
        daily_stats: dailyStats.map(day => ({
          ...day,
          daily_spent: parseFloat(day.daily_spent) || 0,
          daily_tokens: parseFloat(day.daily_tokens) || 0
        })),
        status_breakdown: statusBreakdown.map(status => ({
          ...status,
          total_amount: parseFloat(status.total_amount) || 0
        }))
      });

    } catch (error) {
      logger.error('Get transaction stats error:', error);
      next(error);
    }
  },

  // Export transaction history to CSV
  exportTransactions: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { start_date, end_date, status = 'all' } = req.query;

      let whereClause = 'user_id = ?';
      const params = [userId];

      // Add date filters
      if (start_date) {
        whereClause += ' AND DATE(created_at) >= ?';
        params.push(start_date);
      }

      if (end_date) {
        whereClause += ' AND DATE(created_at) <= ?';
        params.push(end_date);
      }

      // Add status filter
      if (status !== 'all') {
        whereClause += ' AND t.payment_status = ?';
        params.push(status);
      }

      const transactions = await query(`
        SELECT
          t.id,
          t.transaction_uuid,
          t.stripe_payment_intent_id,
          t.usd_amount,
          t.token_amount,
          t.recipient_wallet_address,
          t.payment_status,
          t.fulfillment_status,
          t.fulfillment_transaction_hash,
          t.price_per_token,
          t.created_at,
          t.fulfilled_at,
          tk.token_symbol,
          tk.token_name
        FROM transactions t
        JOIN tokens tk ON t.token_id = tk.id
        WHERE ${whereClause}
        ORDER BY t.created_at DESC
      `, params);

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No transactions found for export'
        });
      }

      // Convert to CSV
      const headers = [
        'Transaction ID',
        'UUID',
        'Token',
        'Stripe Payment ID',
        'Amount (USD)',
        'Token Amount',
        'Wallet Address',
        'Payment Status',
        'Fulfillment Status',
        'Fulfillment TX Hash',
        'Token Price',
        'Created At',
        'Fulfilled At'
      ].join(',');

      const rows = transactions.map(tx => [
        tx.id,
        tx.transaction_uuid,
        tx.token_symbol,
        tx.stripe_payment_intent_id || '',
        tx.usd_amount,
        tx.token_amount,
        tx.recipient_wallet_address || '',
        tx.payment_status,
        tx.fulfillment_status,
        tx.fulfillment_transaction_hash || '',
        tx.price_per_token,
        tx.created_at,
        tx.fulfilled_at || ''
      ].map(field => `"${field}"`).join(','));

      const csv = [headers, ...rows].join('\n');
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);

    } catch (error) {
      logger.error('Export transactions error:', error);
      next(error);
    }
  }
};

module.exports = transactionController;