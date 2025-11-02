const stripeService = require('../services/stripeService');
const { Transaction } = require('../models');
const logger = require('../utils/logger');

const webhookController = {

  // Handle Stripe webhooks
  handleStripeWebhook: async (req, res) => {

    console.log('Received webhook request:', {
      headers: req.headers,
      bodyType: typeof req.body,
      bodyConstructor: req.body?.constructor?.name,
      bodySize: req.body?.length
    });

    
    try {
      const signature = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      console.log('🔗 Webhook received:', {
        hasSignature: !!signature,
        hasSecret: !!endpointSecret,
        bodyType: typeof req.body,
        bodyConstructor: req.body?.constructor?.name,
        bodySize: req.body?.length,
        signaturePreview: signature ? signature.substring(0, 20) + '...' : 'null',
        secretPreview: endpointSecret ? endpointSecret.substring(0, 10) + '...' : 'null'
      });

      console.log('🔍 Raw body details:', {
        isBuffer: Buffer.isBuffer(req.body),
        firstBytes: req.body ? req.body.toString().substring(0, 50) : 'null'
      });

      if (!signature) {
        logger.error('Missing stripe-signature header');
        return res.status(400).json({
          success: false,
          error: 'Missing signature'
        });
      }

      if (!endpointSecret) {
        logger.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
        return res.status(500).json({
          success: false,
          error: 'Webhook secret not configured'
        });
      }

      // Verify webhook signature
      console.log('🔐 Starting webhook verification...');
      const verification = stripeService.verifyWebhook(
        req.body,
        signature,
        endpointSecret
      );

      console.log('🔐 Verification result:', {
        success: verification.success,
        error: verification.error,
        eventType: verification.event?.type || 'unknown'
      });

      if (!verification.success) {
        logger.error('Webhook verification failed:', verification.error);
        console.error('❌ Detailed verification error:', {
          error: verification.error,
          signatureLength: signature?.length,
          bodyLength: req.body?.length,
          secretLength: endpointSecret?.length
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      const event = verification.event;

      let processingStatus = 'success';
      let errorMessage = null;
      let transactionId = null;

      try {
        // Handle different event types
        switch (event.type) {
          case 'payment_intent.succeeded':
            transactionId = await handlePaymentSucceeded(event.data.object);
            break;

          case 'payment_intent.payment_failed':
            transactionId = await handlePaymentFailed(event.data.object);
            break;

          case 'payment_intent.canceled':
            transactionId = await handlePaymentCanceled(event.data.object);
            break;

          case 'payment_intent.requires_action':
            transactionId = await handlePaymentRequiresAction(event.data.object);
            break;

          default:
            logger.info(`Unhandled webhook event type: ${event.type}`);
        }
      } catch (handlingError) {
        logger.error(`Error handling webhook event ${event.type}:`, handlingError);
        processingStatus = 'failed';
        errorMessage = handlingError.message;
      }

      // Log webhook event with processing status
      await logWebhookEvent(event, processingStatus, errorMessage, transactionId);

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ received: true });

    } catch (error) {
      logger.error('Webhook handling error:', error);
      res.status(500).json({
        success: false,
        error: 'Webhook processing failed'
      });
    }
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    logger.info(`Payment succeeded: ${paymentIntent.id}`);

    // Find transaction by payment intent ID
    const transaction = await Transaction.findTransactionByPaymentIntent(paymentIntent.id);

    if (!transaction) {
      logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`);
      return null;
    }

    // Update transaction status to completed
    const updated = await Transaction.updateTransactionStatus(
      transaction.id,
      'processing',
      {
        stripePaymentStatus: 'succeeded'
      }
    );

    if (updated) {
      logger.info(`Transaction ${transaction.id} marked as processing for token distribution`);

      // Trigger real Solana token distribution
      setTimeout(async () => {
        try {
          const solanaService = require('../services/solanaService');

          logger.info(`Starting token distribution for transaction ${transaction.id}`);
          logger.info(`Starting token transfer: ${transaction.token_amount} CDX to ${transaction.recipient_wallet_address}`);

          // Send tokens to user's wallet
          const tokenResult = await solanaService.sendTokens(
            transaction.recipient_wallet_address,
            transaction.token_amount,
            transaction.id
          );

          if (tokenResult.success) {
            // Update transaction with Solana signature
            await Transaction.completeTransaction(transaction.id, tokenResult.signature);
            logger.info(`Token distribution completed for transaction ${transaction.id}, signature: ${tokenResult.signature}`);
          } else {
            // Mark transaction as failed
            await Transaction.failTransaction(
              transaction.id,
              `Token distribution failed: ${tokenResult.error}`
            );
            logger.error(`Token distribution failed for transaction ${transaction.id}: ${tokenResult.error}`);
          }

        } catch (error) {
          logger.error(`Token distribution error for transaction ${transaction.id}:`, error);
          await Transaction.failTransaction(
            transaction.id,
            'Token distribution failed: ' + error.message
          );
        }
      }, 1000); // 1 second delay to allow payment to settle

    } else {
      logger.error(`Failed to update transaction ${transaction.id}`);
    }

    return transaction.id;

  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
    return null;
  }
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  try {
    logger.info(`Payment failed: ${paymentIntent.id}`);

    // Find transaction by payment intent ID
    const transaction = await Transaction.findTransactionByPaymentIntent(paymentIntent.id);

    if (!transaction) {
      logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`);
      return null;
    }

    // Get failure reason from payment intent
    const failureReason = paymentIntent.last_payment_error
      ? paymentIntent.last_payment_error.message
      : 'Payment failed';

    // Update transaction status to failed
    await Transaction.failTransaction(transaction.id, failureReason);

    logger.info(`Transaction ${transaction.id} marked as failed: ${failureReason}`);

    return transaction.id;

  } catch (error) {
    logger.error('Error handling payment failed:', error);
    return null;
  }
};

// Handle canceled payment
const handlePaymentCanceled = async (paymentIntent) => {
  try {
    logger.info(`Payment canceled: ${paymentIntent.id}`);

    // Find transaction by payment intent ID
    const transaction = await Transaction.findTransactionByPaymentIntent(paymentIntent.id);

    if (!transaction) {
      logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`);
      return null;
    }

    // Update transaction status to failed
    await Transaction.failTransaction(transaction.id, 'Payment was canceled');

    logger.info(`Transaction ${transaction.id} marked as canceled`);

    return transaction.id;

  } catch (error) {
    logger.error('Error handling payment canceled:', error);
    return null;
  }
};

// Handle payment that requires additional action
const handlePaymentRequiresAction = async (paymentIntent) => {
  try {
    logger.info(`Payment requires action: ${paymentIntent.id}`);

    // Find transaction by payment intent ID
    const transaction = await Transaction.findTransactionByPaymentIntent(paymentIntent.id);

    if (!transaction) {
      logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`);
      return null;
    }

    // Update transaction with additional action required
    await Transaction.updateTransactionStatus(
      transaction.id,
      'requires_action',
      {
        stripePaymentStatus: 'requires_action'
      }
    );

    logger.info(`Transaction ${transaction.id} requires additional action`);

    return transaction.id;

  } catch (error) {
    logger.error('Error handling payment requires action:', error);
    return null;
  }
};

// Log webhook event to database
const logWebhookEvent = async (event, processingStatus = 'pending', errorMessage = null, transactionId = null) => {
  try {
    const { query } = require('../config/database');

    await query(
      `INSERT INTO webhook_logs (
        event_id,
        event_type,
        payload,
        processing_status,
        error_message,
        transaction_id,
        processed_at,
        received_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        event.id,
        event.type,
        JSON.stringify(event),  // Store the entire event object
        processingStatus,
        errorMessage,
        transactionId,
        processingStatus === 'success' ? new Date() : null  // Set processed_at if successful
      ]
    );

    logger.info(`Webhook logged: ${event.type} - ${processingStatus}${transactionId ? ` (transaction: ${transactionId})` : ''}`);

  } catch (error) {
    logger.error('Failed to log webhook event:', error);
  }
};

module.exports = webhookController;