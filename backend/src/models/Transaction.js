const { query } = require('../config/database');
const { generateUUID } = require('../utils/helpers');
const logger = require('../utils/logger');

const Transaction = {
  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const {
        userId,
        tokenId,
        stripePaymentIntentId,
        usdAmount,
        tokenAmount,
        pricePerToken,
        walletAddress,
        paymentMethod = null,
        ipAddress = null,
        userAgent = null
      } = transactionData;

      const transactionUuid = generateUUID();

      const sql = `
        INSERT INTO transactions (
          user_id,
          token_id,
          transaction_uuid,
          usd_amount,
          token_amount,
          price_per_token,
          stripe_payment_intent_id,
          payment_method,
          payment_status,
          fulfillment_status,
          recipient_wallet_address,
          ip_address,
          user_agent,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, NOW())
      `;

      const result = await query(sql, [
        userId,
        tokenId,
        transactionUuid,
        usdAmount,
        tokenAmount,
        pricePerToken,
        stripePaymentIntentId,
        paymentMethod,
        walletAddress,
        ipAddress,
        userAgent
      ]);

      logger.info(`Transaction created: UUID ${transactionUuid}, User ${userId}, Token ${tokenId}`);

      return {
        id: result.insertId,
        transactionUuid,
        ...transactionData
      };
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Find transaction by ID
  findTransactionById: async (transactionId) => {
    try {
      const sql = `
        SELECT
          t.*,
          tok.token_name,
          tok.token_symbol,
          tok.blockchain,
          u.email as user_email,
          u.first_name,
          u.last_name,
          admin.first_name as fulfilled_by_name,
          admin.email as fulfilled_by_email
        FROM transactions t
        JOIN tokens tok ON t.token_id = tok.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN users admin ON t.fulfilled_by = admin.id
        WHERE t.id = ?
      `;

      const results = await query(sql, [transactionId]);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error finding transaction by ID ${transactionId}:`, error);
      throw error;
    }
  },

  // Find transaction by UUID
  findTransactionByUUID: async (uuid) => {
    try {
      const sql = `
        SELECT
          t.*,
          tok.token_name,
          tok.token_symbol,
          u.email as user_email,
          u.first_name,
          u.last_name
        FROM transactions t
        JOIN tokens tok ON t.token_id = tok.id
        JOIN users u ON t.user_id = u.id
        WHERE t.transaction_uuid = ?
      `;

      const results = await query(sql, [uuid]);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error finding transaction by UUID ${uuid}:`, error);
      throw error;
    }
  },

  // Find transaction by Stripe payment intent ID
  findTransactionByPaymentIntent: async (paymentIntentId) => {
    try {
      const sql = `
        SELECT
          t.*,
          tok.token_name,
          tok.token_symbol,
          u.email as user_email,
          u.first_name,
          u.last_name
        FROM transactions t
        JOIN tokens tok ON t.token_id = tok.id
        JOIN users u ON t.user_id = u.id
        WHERE t.stripe_payment_intent_id = ?
      `;

      const results = await query(sql, [paymentIntentId]);
      return results[0] || null;
    } catch (error) {
      logger.error(`Error finding transaction by payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  },

  // Get user transactions with pagination
  getUserTransactions: async (userId, limit = 50, offset = 0) => {
    try {
      const sql = `
        SELECT
          t.id,
          t.transaction_uuid,
          t.usd_amount,
          t.token_amount,
          t.payment_status,
          t.fulfillment_status,
          t.recipient_wallet_address,
          t.fulfillment_transaction_hash,
          t.created_at,
          t.completed_at,
          tok.token_name,
          tok.token_symbol,
          tok.blockchain
        FROM transactions t
        JOIN tokens tok ON t.token_id = tok.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const results = await query(sql, [userId, limit, offset]);
      return results;
    } catch (error) {
      logger.error(`Error getting transactions for user ${userId}:`, error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (transactionId, status, additionalData = {}) => {
    try {
      const fields = ['payment_status = ?', 'updated_at = NOW()'];
      const values = [status];

      if (additionalData.stripeCustomerId) {
        fields.push('stripe_customer_id = ?');
        values.push(additionalData.stripeCustomerId);
      }

      if (additionalData.paymentMethod) {
        fields.push('payment_method = ?');
        values.push(additionalData.paymentMethod);
      }

      if (additionalData.errorMessage) {
        fields.push('error_message = ?');
        values.push(additionalData.errorMessage);
      }

      values.push(transactionId);

      const sql = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
      const result = await query(sql, values);

      logger.info(`Payment status updated: Transaction ${transactionId}, Status: ${status}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating payment status for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  // Get pending fulfillments (for admin)
  getPendingFulfillments: async (limit = 50, offset = 0) => {
    try {
      const sql = `
        SELECT
          t.*,
          u.email,
          u.first_name,
          u.last_name,
          tok.token_name,
          tok.token_symbol,
          tok.blockchain,
          TIMESTAMPDIFF(HOUR, t.created_at, NOW()) as hours_pending
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN tokens tok ON t.token_id = tok.id
        WHERE t.payment_status = 'succeeded'
          AND t.fulfillment_status = 'pending'
        ORDER BY t.created_at ASC
        LIMIT ? OFFSET ?
      `;

      const results = await query(sql, [limit, offset]);
      return results;
    } catch (error) {
      logger.error('Error getting pending fulfillments:', error);
      throw error;
    }
  },

  // Get pending fulfillments count
  getPendingFulfillmentsCount: async () => {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM transactions
        WHERE payment_status = 'succeeded'
          AND fulfillment_status = 'pending'
      `;

      const results = await query(sql);
      return results[0].count;
    } catch (error) {
      logger.error('Error getting pending fulfillments count:', error);
      throw error;
    }
  },

  // Mark transaction as fulfilled (by admin)
  markAsFulfilled: async (transactionId, adminId, notes = null, txHash = null) => {
    try {
      const sql = `
        UPDATE transactions
        SET
          fulfillment_status = 'completed',
          fulfilled_by = ?,
          fulfilled_at = NOW(),
          completed_at = NOW(),
          fulfillment_notes = ?,
          fulfillment_transaction_hash = ?,
          updated_at = NOW()
        WHERE id = ?
      `;

      const result = await query(sql, [adminId, notes, txHash, transactionId]);

      logger.info(`Transaction fulfilled: ID ${transactionId}, Admin ${adminId}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error marking transaction ${transactionId} as fulfilled:`, error);
      throw error;
    }
  },

  // Update fulfillment status
  updateFulfillmentStatus: async (transactionId, status, additionalData = {}) => {
    try {
      const fields = ['fulfillment_status = ?', 'updated_at = NOW()'];
      const values = [status];

      if (additionalData.fulfilledBy) {
        fields.push('fulfilled_by = ?');
        values.push(additionalData.fulfilledBy);
      }

      if (additionalData.notes) {
        fields.push('fulfillment_notes = ?');
        values.push(additionalData.notes);
      }

      if (additionalData.txHash) {
        fields.push('fulfillment_transaction_hash = ?');
        values.push(additionalData.txHash);
      }

      if (status === 'completed') {
        fields.push('fulfilled_at = NOW()');
        fields.push('completed_at = NOW()');
      }

      values.push(transactionId);

      const sql = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
      const result = await query(sql, values);

      logger.info(`Fulfillment status updated: Transaction ${transactionId}, Status: ${status}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error updating fulfillment status for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  // Mark transaction as cancelled
  cancelTransaction: async (transactionId, reason = null) => {
    try {
      const sql = `
        UPDATE transactions
        SET
          fulfillment_status = 'cancelled',
          fulfillment_notes = ?,
          updated_at = NOW()
        WHERE id = ?
      `;

      const result = await query(sql, [reason, transactionId]);

      logger.info(`Transaction cancelled: ID ${transactionId}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error cancelling transaction ${transactionId}:`, error);
      throw error;
    }
  },

  // Process refund
  processRefund: async (transactionId, refundAmount, reason, stripeRefundId) => {
    try {
      const sql = `
        UPDATE transactions
        SET
          refunded_at = NOW(),
          refund_amount = ?,
          refund_reason = ?,
          stripe_refund_id = ?,
          fulfillment_status = 'cancelled',
          updated_at = NOW()
        WHERE id = ?
      `;

      const result = await query(sql, [refundAmount, reason, stripeRefundId, transactionId]);

      logger.info(`Refund processed: Transaction ${transactionId}, Amount: ${refundAmount}`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error processing refund for transaction ${transactionId}:`, error);
      throw error;
    }
  },

  // Check daily spending limit for specific token
  checkDailySpending: async (userId, tokenId, additionalAmount = 0) => {
    try {
      const sql = `
        SELECT COALESCE(SUM(t.usd_amount), 0) as daily_spent
        FROM transactions t
        WHERE t.user_id = ?
          AND t.token_id = ?
          AND DATE(t.created_at) = CURDATE()
          AND t.payment_status IN ('succeeded', 'pending')
      `;

      const results = await query(sql, [userId, tokenId]);
      const dailySpent = parseFloat(results[0].daily_spent) || 0;
      const totalWithNew = dailySpent + additionalAmount;

      // Get daily limit from token configuration
      const tokenSql = 'SELECT daily_purchase_limit FROM tokens WHERE id = ?';
      const tokenResults = await query(tokenSql, [tokenId]);
      const dailyLimit = tokenResults[0]?.daily_purchase_limit || 5000;

      return {
        dailySpent,
        dailyLimit,
        remainingLimit: dailyLimit - dailySpent,
        wouldExceedLimit: totalWithNew > dailyLimit,
        totalWithNew
      };
    } catch (error) {
      logger.error('Error checking daily spending:', error);
      throw error;
    }
  },

  // Get user transaction statistics
  getUserTransactionStats: async (userId) => {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN fulfillment_status = 'completed' THEN usd_amount ELSE 0 END) as total_spent,
          SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
          SUM(CASE WHEN payment_status = 'pending' THEN usd_amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN payment_status = 'succeeded' AND fulfillment_status = 'pending' THEN 1 ELSE 0 END) as awaiting_fulfillment,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_count
        FROM transactions
        WHERE user_id = ?
      `;

      const results = await query(sql, [userId]);
      return results[0] || {
        total_transactions: 0,
        total_spent: 0,
        total_tokens: 0,
        pending_amount: 0,
        awaiting_fulfillment: 0,
        failed_count: 0
      };
    } catch (error) {
      logger.error(`Error getting transaction stats for user ${userId}:`, error);
      throw error;
    }
  },

  // Get all transactions for admin (with filters)
  getAllTransactions: async (filters = {}, limit = 50, offset = 0) => {
    try {
      let sql = `
        SELECT
          t.*,
          u.email,
          u.first_name,
          u.last_name,
          tok.token_name,
          tok.token_symbol,
          admin.first_name as fulfilled_by_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN tokens tok ON t.token_id = tok.id
        LEFT JOIN users admin ON t.fulfilled_by = admin.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.paymentStatus) {
        sql += ' AND t.payment_status = ?';
        params.push(filters.paymentStatus);
      }

      if (filters.fulfillmentStatus) {
        sql += ' AND t.fulfillment_status = ?';
        params.push(filters.fulfillmentStatus);
      }

      if (filters.tokenId) {
        sql += ' AND t.token_id = ?';
        params.push(filters.tokenId);
      }

      if (filters.userId) {
        sql += ' AND t.user_id = ?';
        params.push(filters.userId);
      }

      sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await query(sql, params);
      return results;
    } catch (error) {
      logger.error('Error getting all transactions:', error);
      throw error;
    }
  }
};

module.exports = Transaction;
