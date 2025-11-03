const { Transaction } = require('../models');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const solanaService = require('../services/solanaService');

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

      // Build SQL query
      let sql = `
        SELECT
          id,
          stripe_payment_intent_id,
          amount_usd,
          token_amount,
          recipient_wallet_address,
          status,
          blockchain_status,
          blockchain_confirmations,
          solana_transaction_signature,
          token_price_at_purchase,
          failure_reason,
          error_message,
          created_at,
          updated_at,
          tokens_sent_at
        FROM transactions
        WHERE user_id = ?
      `;

      let countSql = `
        SELECT COUNT(*) as total
        FROM transactions
        WHERE user_id = ?
      `;

      // Add status filter if specified
      if (status !== 'all') {
        sql += ' AND status = ?';
        countSql += ' AND status = ?';
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

      // Calculate statistics
      const [stats] = await query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as total_spent,
          SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
        FROM transactions
        WHERE user_id = ?
      `, [userId]);

      res.json({
        success: true,
        transactions: transactions.map(tx => ({
          ...tx,
          amount_usd: parseFloat(tx.amount_usd),
          token_amount: parseFloat(tx.token_amount),
          token_price_at_purchase: parseFloat(tx.token_price_at_purchase),
          blockchain_confirmations: parseInt(tx.blockchain_confirmations) || 0
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
          u.last_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ? AND t.user_id = ?
      `, [transactionId, userId]);

      if (!transaction.length) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      const tx = transaction[0];

      // Get Solana transaction status if signature exists
      let solanaStatus = null;
      if (tx.solana_transaction_signature) {
        solanaStatus = await solanaService.getTransactionStatus(tx.solana_transaction_signature);
      }

      // Get token balance for user's wallet if transaction completed
      let walletBalance = null;
      if (tx.status === 'completed' && tx.recipient_wallet_address) {
        const balanceResult = await solanaService.getTokenBalance(tx.recipient_wallet_address);
        walletBalance = balanceResult.success ? balanceResult.balance : null;
      }

      res.json({
        success: true,
        transaction: {
          ...tx,
          amount_usd: parseFloat(tx.amount_usd),
          token_amount: parseFloat(tx.token_amount),
          token_price_at_purchase: parseFloat(tx.token_price_at_purchase),
          blockchain_confirmations: parseInt(tx.blockchain_confirmations) || 0,
          solana_status: solanaStatus,
          current_wallet_balance: walletBalance
        }
      });

    } catch (error) {
      logger.error('Get transaction details error:', error);
      next(error);
    }
  },

  // Retry failed transaction (re-attempt token distribution)
  retryTransaction: async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      // Find transaction
      const transaction = await Transaction.findTransactionById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      // Verify ownership
      if (transaction.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Check if transaction can be retried
      if (transaction.status !== 'failed') {
        return res.status(400).json({
          success: false,
          error: 'Only failed transactions can be retried'
        });
      }

      // Reset transaction status
      await Transaction.updateTransactionStatus(transaction.id, 'processing');

      // Attempt token distribution
      try {
        const tokenResult = await solanaService.sendTokens(
          transaction.recipient_wallet_address,
          transaction.token_amount,
          transaction.id
        );

        if (tokenResult.success) {
          // Update transaction as completed
          await Transaction.completeTransaction(transaction.id, tokenResult.signature);

          logger.info(`Transaction ${transaction.id} retry successful`);

          res.json({
            success: true,
            message: 'Transaction retry successful',
            transaction_signature: tokenResult.signature
          });

        } else {
          // Mark as failed again
          await Transaction.failTransaction(
            transaction.id,
            `Retry failed: ${tokenResult.error}`
          );

          res.status(500).json({
            success: false,
            error: `Retry failed: ${tokenResult.error}`
          });
        }

      } catch (retryError) {
        // Mark as failed
        await Transaction.failTransaction(
          transaction.id,
          `Retry error: ${retryError.message}`
        );

        logger.error(`Transaction retry error for ${transaction.id}:`, retryError);

        res.status(500).json({
          success: false,
          error: `Retry failed: ${retryError.message}`
        });
      }

    } catch (error) {
      logger.error('Retry transaction error:', error);
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

      // Get overall statistics
      const [overallStats] = await query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as total_spent,
          SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          AVG(CASE WHEN status = 'completed' THEN amount_usd ELSE NULL END) as avg_transaction,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
          MIN(created_at) as first_transaction,
          MAX(CASE WHEN status = 'completed' THEN created_at END) as last_successful
        FROM transactions
        WHERE user_id = ? ${dateClause}
      `, [userId]);

      // Get daily transaction counts for chart data
      const dailyStats = await query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as daily_spent,
          SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) as daily_tokens
        FROM transactions
        WHERE user_id = ? ${dateClause}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
      `, [userId]);

      // Get status breakdown
      const statusBreakdown = await query(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(amount_usd) as total_amount
        FROM transactions
        WHERE user_id = ? ${dateClause}
        GROUP BY status
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
        whereClause += ' AND status = ?';
        params.push(status);
      }

      const transactions = await query(`
        SELECT
          id,
          stripe_payment_intent_id,
          amount_usd,
          token_amount,
          recipient_wallet_address,
          status,
          blockchain_status,
          solana_transaction_signature,
          token_price_at_purchase,
          created_at,
          updated_at
        FROM transactions
        WHERE ${whereClause}
        ORDER BY created_at DESC
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
        'Stripe Payment ID',
        'Amount (USD)',
        'Token Amount',
        'Wallet Address',
        'Status',
        'Blockchain Status',
        'Solana Signature',
        'Token Price',
        'Created At',
        'Updated At'
      ].join(',');

      const rows = transactions.map(tx => [
        tx.id,
        tx.stripe_payment_intent_id || '',
        tx.amount_usd,
        tx.token_amount,
        tx.recipient_wallet_address || '',
        tx.status,
        tx.blockchain_status || '',
        tx.solana_transaction_signature || '',
        tx.token_price_at_purchase,
        tx.created_at,
        tx.updated_at
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