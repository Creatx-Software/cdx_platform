const stripeService = require('../services/stripeService');
const { Transaction } = require('../models');
const { query } = require('../config/database');
const { validateAmount } = require('../utils/validators');
const { calculateTokenAmount } = require('../utils/helpers');
const logger = require('../utils/logger');

const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req, res, next) => {
    try {
      const { usdAmount, walletAddress } = req.body;
      console.log("💰 Requested USD Amount:", usdAmount) ;
      console.log("🏦 Wallet Address:", walletAddress) ;
      const userId = req.userId;

      // Validate required fields
      if (!usdAmount || !walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'USD amount and wallet address are required'
        });
      }

      // Validate amount
      if (!validateAmount(usdAmount)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      const amount = parseFloat(usdAmount);

      // Check minimum and maximum limits
      const MIN_PURCHASE = 10; // $10 minimum
      const MAX_PURCHASE = 10000; // $10,000 maximum

      if (amount < MIN_PURCHASE) {
        return res.status(400).json({
          success: false,
          error: `Minimum purchase amount is $${MIN_PURCHASE}`
        });
      }

      if (amount > MAX_PURCHASE) {
        return res.status(400).json({
          success: false,
          error: `Maximum purchase amount is $${MAX_PURCHASE}`
        });
      }

      // Check daily spending limit
      const dailyCheck = await Transaction.checkDailySpending(userId, amount);
      if (dailyCheck.wouldExceedLimit) {
        return res.status(400).json({
          success: false,
          error: `Daily spending limit exceeded. Remaining: $${dailyCheck.remainingLimit.toFixed(2)}`
        });
      }

      // Get current token configuration and check if sale is active
      const tokenConfig = await query(
        'SELECT price_per_token, is_active FROM token_configuration ORDER BY created_at DESC LIMIT 1'
      );

      if (!tokenConfig.length) {
        return res.status(500).json({
          success: false,
          error: 'Token configuration not found'
        });
      }

      // Check if token sale is active
      if (!tokenConfig[0].is_active) {
        return res.status(400).json({
          success: false,
          error: 'Token sale is currently inactive. Please try again later or contact support for more information.',
          code: 'SALE_INACTIVE'
        });
      }

      const tokenPrice = parseFloat(tokenConfig[0].price_per_token);
      const tokenAmount = calculateTokenAmount(amount, tokenPrice);

      // Create Stripe payment intent
      const stripeResult = await stripeService.createPaymentIntent(
        userId,
        amount,
        tokenAmount,
        walletAddress
      );

      if (!stripeResult.success) {
        return res.status(500).json({
          success: false,
          error: stripeResult.error
        });
      }

      // Create transaction record
      const transaction = await Transaction.createTransaction({
        userId,
        stripePaymentIntentId: stripeResult.paymentIntent.id,
        usdAmount: amount,
        tokenAmount,
        solanaWalletAddress: walletAddress,
        tokenPriceAtPurchase: tokenPrice,
        status: 'pending'
      });

      logger.info(`Payment intent created for user ${userId}: ${stripeResult.paymentIntent.id}`);

      res.json({
        success: true,
        message: 'Payment intent created successfully',
        paymentIntent: stripeResult.paymentIntent,
        transaction: {
          id: transaction.transactionId,
          usdAmount: amount,
          tokenAmount,
          tokenPrice
        }
      });

    } catch (error) {
      logger.error('Create payment intent error:', error);
      next(error);
    }
  },

  // Confirm payment (called after successful Stripe payment)
  confirmPayment: async (req, res, next) => {
    console.log("🔔 Confirm payment called") ;
    try {
      const { paymentIntentId } = req.body;
      const userId = req.userId;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required'
        });
      }

      // Find transaction
      const transaction = await Transaction.findTransactionByPaymentIntent(paymentIntentId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      // Verify transaction belongs to user
      if (transaction.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Get payment intent from Stripe
      const stripeResult = await stripeService.getPaymentIntent(paymentIntentId);

      if (!stripeResult.success) {
        console.log("❌ Failed to verify payment with Stripe") ;
        return res.status(500).json({
          success: false,
          error: 'Failed to verify payment with Stripe'
        });
      }

      const paymentIntent = stripeResult.paymentIntent;

      // Check if payment succeeded
      if (paymentIntent.status === 'succeeded') {
        // Update transaction status to processing
        await Transaction.updateTransactionStatus(transaction.id, 'processing');

        // TODO: Queue for Solana token distribution
        // This would typically trigger background job to send tokens

        logger.info(`Payment confirmed for transaction ${transaction.id}`);

        res.json({
          success: true,
          message: 'Payment confirmed. Tokens will be sent to your wallet shortly.',
          transaction: {
            id: transaction.id,
            status: 'processing',
            usdAmount: transaction.usd_amount,
            tokenAmount: transaction.token_amount
          }
        });

      } else {
        // Payment failed
        await Transaction.failTransaction(
          transaction.id,
          `Stripe payment failed: ${paymentIntent.status}`
        );

        res.status(400).json({
          success: false,
          error: `Payment failed: ${paymentIntent.status}`
        });
      }

    } catch (error) {
      logger.error('Confirm payment error:', error);
      next(error);
    }
  },

  // Get payment history
  getPaymentHistory: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20 } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get user transactions
      const transactions = await Transaction.getUserTransactions(
        userId,
        parseInt(limit),
        offset
      );

      // Get total count for pagination
      const countResult = await query(
        'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
        [userId]
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        transactions: transactions.map(tx => ({
          id: tx.id,
          usdAmount: parseFloat(tx.usd_amount),
          tokenAmount: parseFloat(tx.token_amount),
          status: tx.status,
          walletAddress: tx.solana_wallet_address,
          transactionSignature: tx.solana_transaction_signature,
          createdAt: tx.created_at,
          updatedAt: tx.updated_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });

    } catch (error) {
      logger.error('Get payment history error:', error);
      next(error);
    }
  },

  // Get token price
  getTokenPrice: async (req, res, next) => {
    try {
      const tokenConfig = await query(
        'SELECT price_per_token, min_purchase_usd, max_purchase_usd, daily_limit_usd FROM token_configuration WHERE is_active = TRUE'
      );

      if (!tokenConfig.length) {
        return res.status(500).json({
          success: false,
          error: 'Token configuration not found'
        });
      }

      const config = tokenConfig[0];

      res.json({
        success: true,
        tokenPrice: parseFloat(config.price_per_token),
        minPurchase: parseFloat(config.min_purchase_usd),
        maxPurchase: parseFloat(config.max_purchase_usd),
        dailyLimit: parseFloat(config.daily_limit_usd)
      });

    } catch (error) {
      logger.error('Get token price error:', error);
      next(error);
    }
  },

  // Get transaction details
  getTransactionDetails: async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      const transaction = await Transaction.findTransactionById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      // Verify transaction belongs to user
      if (transaction.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        transaction: {
          id: transaction.id,
          usdAmount: parseFloat(transaction.usd_amount),
          tokenAmount: parseFloat(transaction.token_amount),
          status: transaction.status,
          walletAddress: transaction.solana_wallet_address,
          transactionSignature: transaction.solana_transaction_signature,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
          failureReason: transaction.failure_reason
        }
      });

    } catch (error) {
      logger.error('Get transaction details error:', error);
      next(error);
    }
  }
};

module.exports = paymentController;