const stripeService = require('../services/stripeService');
const { Transaction, Token } = require('../models');
const { query } = require('../config/database');
const { validateAmount } = require('../utils/validators');
const { calculateTokenAmount } = require('../utils/helpers');
const logger = require('../utils/logger');

const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req, res, next) => {
    try {
      const { tokenId, usdAmount, walletAddress } = req.body;
      console.log("💰 Create Payment Intent:", { tokenId, usdAmount, walletAddress });
      const userId = req.userId;

      // Validate required fields
      if (!tokenId || !usdAmount || !walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Token ID, USD amount, and wallet address are required'
        });
      }

      // Get token details
      const token = await Token.getTokenById(tokenId);

      if (!token) {
        return res.status(404).json({
          success: false,
          error: 'Token not found'
        });
      }

      // Check if token is active
      if (!token.is_active) {
        return res.status(400).json({
          success: false,
          error: `${token.token_name} sale is currently inactive. Please try again later.`,
          code: 'SALE_INACTIVE'
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

      // Check minimum and maximum limits (from token config)
      if (amount < token.min_purchase_amount) {
        return res.status(400).json({
          success: false,
          error: `Minimum purchase amount for ${token.token_symbol} is $${token.min_purchase_amount}`
        });
      }

      if (amount > token.max_purchase_amount) {
        return res.status(400).json({
          success: false,
          error: `Maximum purchase amount for ${token.token_symbol} is $${token.max_purchase_amount}`
        });
      }

      // Calculate token amount based on token price
      const tokenPrice = parseFloat(token.price_per_token);
      const tokenAmount = calculateTokenAmount(amount, tokenPrice);

      // Validate token amount limits
      if (tokenAmount < token.min_token_amount) {
        return res.status(400).json({
          success: false,
          error: `Minimum token purchase is ${token.min_token_amount} ${token.token_symbol}`
        });
      }

      if (tokenAmount > token.max_token_amount) {
        return res.status(400).json({
          success: false,
          error: `Maximum token purchase is ${token.max_token_amount} ${token.token_symbol}`
        });
      }

      // Check daily spending limit (per token)
      const dailyCheck = await Transaction.checkDailySpending(userId, tokenId, amount);
      if (dailyCheck.wouldExceedLimit) {
        return res.status(400).json({
          success: false,
          error: `Daily spending limit for ${token.token_symbol} exceeded. Remaining: $${dailyCheck.remainingLimit.toFixed(2)}`
        });
      }

      // Create Stripe payment intent
      const stripeResult = await stripeService.createPaymentIntent(
        userId,
        amount,
        tokenAmount,
        walletAddress,
        {
          tokenId: token.id,
          tokenSymbol: token.token_symbol,
          tokenName: token.token_name
        }
      );

      if (!stripeResult.success) {
        return res.status(500).json({
          success: false,
          error: stripeResult.error
        });
      }

      // Create transaction record with new schema
      const transaction = await Transaction.createTransaction({
        userId,
        tokenId: token.id,
        stripePaymentIntentId: stripeResult.paymentIntent.id,
        usdAmount: amount,
        tokenAmount,
        pricePerToken: tokenPrice,
        walletAddress,
        paymentMethod: null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      logger.info(`Payment intent created for user ${userId}: ${stripeResult.paymentIntent.id}, Token: ${token.token_symbol}`);

      res.json({
        success: true,
        message: 'Payment intent created successfully',
        paymentIntent: stripeResult.paymentIntent,
        transaction: {
          id: transaction.transactionUuid,
          usdAmount: amount,
          tokenAmount,
          tokenPrice,
          tokenSymbol: token.token_symbol,
          tokenName: token.token_name
        }
      });

    } catch (error) {
      logger.error('Create payment intent error:', error);
      next(error);
    }
  },

  // Confirm payment (called after successful Stripe payment)
  confirmPayment: async (req, res, next) => {
    console.log("🔔 Confirm payment called");
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
        console.log("❌ Failed to verify payment with Stripe");
        return res.status(500).json({
          success: false,
          error: 'Failed to verify payment with Stripe'
        });
      }

      const paymentIntent = stripeResult.paymentIntent;

      // Check if payment succeeded
      if (paymentIntent.status === 'succeeded') {
        // Payment is successful, but tokens will be sent manually by admin
        logger.info(`Payment confirmed for transaction ${transaction.id}. Awaiting admin fulfillment.`);

        res.json({
          success: true,
          message: 'Payment confirmed. Your order is being processed and tokens will be sent to your wallet shortly.',
          transaction: {
            id: transaction.id,
            paymentStatus: 'succeeded',
            fulfillmentStatus: 'pending',
            usdAmount: transaction.usd_amount,
            tokenAmount: transaction.token_amount,
            tokenSymbol: transaction.token_symbol
          }
        });

      } else {
        // Payment failed
        await Transaction.updatePaymentStatus(
          transaction.id,
          'failed',
          {
            errorMessage: `Stripe payment failed: ${paymentIntent.status}`
          }
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

      // Get user transactions (already includes token info from new model)
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
          transactionUuid: tx.transaction_uuid,
          usdAmount: parseFloat(tx.usd_amount),
          tokenAmount: parseFloat(tx.token_amount),
          tokenSymbol: tx.token_symbol,
          tokenName: tx.token_name,
          blockchain: tx.blockchain,
          paymentStatus: tx.payment_status,
          fulfillmentStatus: tx.fulfillment_status,
          walletAddress: tx.recipient_wallet_address,
          transactionHash: tx.fulfillment_transaction_hash,
          createdAt: tx.created_at,
          completedAt: tx.completed_at
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

  // Get all active tokens with prices (for purchase page)
  getAvailableTokens: async (req, res, next) => {
    try {
      const tokens = await Token.getAllActiveTokens();

      res.json({
        success: true,
        tokens: tokens.map(token => ({
          id: token.id,
          name: token.token_name,
          symbol: token.token_symbol,
          blockchain: token.blockchain,
          price: parseFloat(token.price_per_token),
          currency: token.currency,
          minPurchase: parseFloat(token.min_purchase_amount),
          maxPurchase: parseFloat(token.max_purchase_amount),
          minTokenAmount: token.min_token_amount,
          maxTokenAmount: token.max_token_amount,
          dailyLimit: parseFloat(token.daily_purchase_limit),
          description: token.description,
          logoUrl: token.logo_url
        }))
      });

    } catch (error) {
      logger.error('Get available tokens error:', error);
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
          transactionUuid: transaction.transaction_uuid,
          usdAmount: parseFloat(transaction.usd_amount),
          tokenAmount: parseFloat(transaction.token_amount),
          tokenSymbol: transaction.token_symbol,
          tokenName: transaction.token_name,
          blockchain: transaction.blockchain,
          paymentStatus: transaction.payment_status,
          fulfillmentStatus: transaction.fulfillment_status,
          walletAddress: transaction.recipient_wallet_address,
          transactionHash: transaction.fulfillment_transaction_hash,
          fulfilledAt: transaction.fulfilled_at,
          createdAt: transaction.created_at,
          completedAt: transaction.completed_at,
          errorMessage: transaction.error_message
        }
      });

    } catch (error) {
      logger.error('Get transaction details error:', error);
      next(error);
    }
  }
};

module.exports = paymentController;
