const { User, Transaction } = require('../models');
const { validateSolanaAddress } = require('../utils/validators');
const logger = require('../utils/logger');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.userId;

      const user = await User.findUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user transaction statistics
      const stats = await Transaction.getUserTransactionStats(userId);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          walletAddress: user.solana_wallet_address,
          emailVerified: user.email_verified,
          kycStatus: user.kyc_status,
          accountStatus: user.account_status,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        },
        statistics: {
          totalTransactions: stats.total_transactions,
          totalSpent: parseFloat(stats.total_spent),
          totalTokens: parseFloat(stats.total_tokens),
          pendingAmount: parseFloat(stats.pending_amount),
          failedCount: stats.failed_count
        }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.userId;
      // Support both camelCase and snake_case for compatibility
      const { firstName, lastName, first_name, last_name } = req.body;

      const firstNameValue = firstName || first_name;
      const lastNameValue = lastName || last_name;

      // Validate required fields
      if (!firstNameValue || !lastNameValue) {
        return res.status(400).json({
          success: false,
          error: 'First name and last name are required'
        });
      }

      // Update user
      await User.updateUser(userId, {
        first_name: firstNameValue,
        last_name: lastNameValue
      });

      logger.info(`Profile updated for user ${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  },

  // Update wallet address
  updateWallet: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required'
        });
      }

      // Validate Solana address
      if (!validateSolanaAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Solana wallet address'
        });
      }

      // Update wallet address
      await User.updateWalletAddress(userId, walletAddress);

      logger.info(`Wallet address updated for user ${userId}: ${walletAddress}`);

      res.json({
        success: true,
        message: 'Wallet address updated successfully',
        walletAddress
      });

    } catch (error) {
      logger.error('Update wallet error:', error);
      next(error);
    }
  },

  // Get user transactions (alias to payment history)
  getTransactions: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20 } = req.query;

      const currentPage = parseInt(page);
      const pageLimit = parseInt(limit);
      const offset = (currentPage - 1) * pageLimit;

      // Get user transactions
      const transactions = await Transaction.getUserTransactions(
        userId,
        pageLimit,
        offset
      );

      // Get total count for pagination
      const { query: dbQuery } = require('../config/database');
      const countResult = await dbQuery(
        'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
        [userId]
      );

      const totalTransactions = countResult[0].total;
      const totalPages = Math.ceil(totalTransactions / pageLimit);

      res.json({
        success: true,
        transactions: transactions.map(tx => ({
          id: tx.id,
          usdAmount: parseFloat(tx.usd_amount || tx.amount_usd),
          tokenAmount: parseFloat(tx.token_amount),
          status: tx.status,
          walletAddress: tx.recipient_wallet_address || tx.solana_wallet_address,
          transactionSignature: tx.solana_transaction_signature,
          createdAt: tx.created_at,
          updatedAt: tx.updated_at
        })),
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_transactions: totalTransactions,
          has_next: currentPage < totalPages,
          has_prev: currentPage > 1
        }
      });

    } catch (error) {
      logger.error('Get user transactions error:', error);
      next(error);
    }
  },

  // Get dashboard summary
  getDashboard: async (req, res, next) => {
    try {
      const userId = req.userId;

      // Get user info
      const user = await User.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get transaction statistics
      const stats = await Transaction.getUserTransactionStats(userId);

      // Get recent transactions
      const recentTransactions = await Transaction.getUserTransactions(userId, 5, 0);

      // Check daily spending
      const dailySpending = await Transaction.checkDailySpending(userId);

      res.json({
        success: true,
        dashboard: {
          user: {
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            walletAddress: user.solana_wallet_address,
            kycStatus: user.kyc_status
          },
          statistics: {
            totalSpent: parseFloat(stats.total_spent),
            totalTokens: parseFloat(stats.total_tokens),
            totalTransactions: stats.total_transactions,
            pendingAmount: parseFloat(stats.pending_amount)
          },
          dailySpending: {
            spent: dailySpending.dailySpent,
            limit: dailySpending.dailyLimit,
            remaining: dailySpending.remainingLimit
          },
          recentTransactions: recentTransactions.map(tx => ({
            id: tx.id,
            usdAmount: parseFloat(tx.usd_amount),
            tokenAmount: parseFloat(tx.token_amount),
            status: tx.status,
            createdAt: tx.created_at
          }))
        }
      });

    } catch (error) {
      logger.error('Get dashboard error:', error);
      next(error);
    }
  }
};

module.exports = userController;