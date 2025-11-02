const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');
const { query } = require('../config/database');

const stripeService = {
  // Create payment intent for token purchase
  createPaymentIntent: async (userId, usdAmount, tokenAmount, walletAddress) => {
    try {
      // Get user details for customer creation
      const user = await query('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user.length) {
        throw new Error('User not found');
      }

      const userInfo = user[0];

      // Create payment intent (without customer for now)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(usdAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          tokenAmount: tokenAmount.toString(),
          walletAddress: walletAddress,
          platform: 'cdx_platform'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info(`Payment intent created: ${paymentIntent.id} for user ${userId}`);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      };

    } catch (error) {
      logger.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get payment intent details
  getPaymentIntent: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        }
      };

    } catch (error) {
      logger.error('Failed to get payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Confirm payment intent (if needed)
  confirmPaymentIntent: async (paymentIntentId, paymentMethodId = null) => {
    try {
      const confirmData = {};
      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmData
      );

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        }
      };

    } catch (error) {
      logger.error('Failed to confirm payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verify webhook signature
  verifyWebhook: (payload, signature, endpointSecret) => {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );

      return {
        success: true,
        event
      };

    } catch (error) {
      logger.error('Webhook verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = stripeService;