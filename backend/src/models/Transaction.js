const { query } = require('../config/database');
const { generateUUID } = require('../utils/helpers');

const Transaction = {
  // Create new transaction
  createTransaction: async (transactionData) => {
    const {
      userId,
      stripePaymentIntentId,
      usdAmount,
      tokenAmount,
      solanaWalletAddress,
      tokenPriceAtPurchase,
      status = 'pending'
    } = transactionData;

    const transactionId = generateUUID();

    const sql = `
      INSERT INTO transactions (
        transaction_uuid,
        user_id,
        stripe_payment_intent_id,
        amount_usd,
        token_amount,
        token_price_at_purchase,
        recipient_wallet_address,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await query(sql, [
      transactionId,
      userId,
      stripePaymentIntentId,
      usdAmount,
      tokenAmount,
      tokenPriceAtPurchase,
      solanaWalletAddress,
      status
    ]);

    return {
      transactionId,
      ...transactionData,
      status
    };
  },

  // Find transaction by ID
  findTransactionById: async (transactionId) => {
    const sql = 'SELECT * FROM transactions WHERE id = ?';
    const results = await query(sql, [transactionId]);
    return results[0] || null;
  },

  // Find transaction by Stripe payment intent ID
  findTransactionByPaymentIntent: async (paymentIntentId) => {
    const sql = 'SELECT * FROM transactions WHERE stripe_payment_intent_id = ?';
    const results = await query(sql, [paymentIntentId]);
    return results[0] || null;
  },

  // Get user transactions with pagination
  getUserTransactions: async (userId, limit = 50, offset = 0) => {
    const sql = `
      SELECT
        id,
        stripe_payment_intent_id,
        amount_usd,
        token_amount,
        recipient_wallet_address,
        status,
        solana_transaction_signature,
        created_at,
        updated_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const results = await query(sql, [userId, limit, offset]);
    return results;
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, status, additionalData = {}) => {
    const fields = ['status = ?', 'updated_at = NOW()'];
    const values = [status];

    // Update blockchain status based on transaction status
    if (status === 'processing') {
      fields.push('blockchain_status = ?');
      values.push('processing');
    }

    // Add optional fields
    if (additionalData.solanaTransactionSignature) {
      fields.push('solana_transaction_signature = ?');
      values.push(additionalData.solanaTransactionSignature);
    }

    if (additionalData.tokensSentAt) {
      fields.push('tokens_sent_at = ?');
      values.push(additionalData.tokensSentAt);
    }

    if (additionalData.failureReason) {
      fields.push('failure_reason = ?');
      values.push(additionalData.failureReason);
    }

    values.push(transactionId);

    const sql = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);

    return result.affectedRows > 0;
  },

  // Complete transaction (mark as completed with Solana details)
  completeTransaction: async (transactionId, solanaSignature) => {
    const sql = `
      UPDATE transactions
      SET
        status = 'completed',
        blockchain_status = 'confirmed',
        blockchain_confirmations = 1,
        solana_transaction_signature = ?,
        tokens_sent_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `;

    const result = await query(sql, [solanaSignature, transactionId]);
    return result.affectedRows > 0;
  },

  // Mark transaction as failed
  failTransaction: async (transactionId, failureReason) => {
    const sql = `
      UPDATE transactions
      SET
        status = 'failed',
        blockchain_status = 'failed',
        failure_reason = ?,
        error_message = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    const result = await query(sql, [failureReason, failureReason, transactionId]);
    return result.affectedRows > 0;
  },

  // Check daily spending limit
  checkDailySpending: async (userId, additionalAmount = 0) => {
    const sql = `
      SELECT COALESCE(SUM(amount_usd), 0) as daily_spent
      FROM transactions
      WHERE user_id = ?
        AND DATE(created_at) = CURDATE()
        AND status IN ('completed', 'pending')
    `;

    const results = await query(sql, [userId]);
    const dailySpent = parseFloat(results[0].daily_spent) || 0;
    const totalWithNew = dailySpent + additionalAmount;

    // Get daily limit from system settings (default $5000)
    const dailyLimit = 5000;

    return {
      dailySpent,
      dailyLimit,
      remainingLimit: dailyLimit - dailySpent,
      wouldExceedLimit: totalWithNew > dailyLimit,
      totalWithNew
    };
  },

  // Get user transaction statistics
  getUserTransactionStats: async (userId) => {
    const sql = `
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as total_spent,
        SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) as total_tokens,
        SUM(CASE WHEN status = 'pending' THEN amount_usd ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM transactions
      WHERE user_id = ?
    `;

    const results = await query(sql, [userId]);
    return results[0] || {
      total_transactions: 0,
      total_spent: 0,
      total_tokens: 0,
      pending_amount: 0,
      failed_count: 0
    };
  },

  // Get transaction details with user info
  getTransactionWithUser: async (transactionId) => {
    const sql = `
      SELECT
        t.*,
        u.email,
        u.first_name,
        u.last_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;

    const results = await query(sql, [transactionId]);
    return results[0] || null;
  }
};

module.exports = Transaction;