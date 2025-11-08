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

    // Update payment status to succeeded (NOT fulfillment status - that's manual)
    const updated = await Transaction.updatePaymentStatus(
      transaction.id,
      'succeeded',
      {
        stripeCustomerId: paymentIntent.customer,
        paymentMethod: paymentIntent.payment_method
      }
    );

    if (updated) {
      logger.info(`Transaction ${transaction.id} payment marked as succeeded. Awaiting admin fulfillment.`);

      // Send purchase confirmation email
      try {
        const emailService = require('../services/emailService');
        const transactionDetails = await Transaction.findTransactionById(transaction.id);

        if (transactionDetails) {
          await emailService.sendPurchaseConfirmationEmail(
            transactionDetails.user_email,
            transactionDetails.first_name,
            transactionDetails
          );
          logger.info(`Purchase confirmation email sent to ${transactionDetails.user_email} for transaction ${transaction.id}`);
        } else {
          logger.error(`Failed to get transaction details for email: ${transaction.id}`);
        }
      } catch (emailError) {
        // Log error but don't fail the transaction
        logger.error(`Failed to send purchase confirmation email for transaction ${transaction.id}:`, emailError);
      }

      // NOTE: Tokens are NOT sent automatically
      // Admin must manually fulfill the order from the admin dashboard
      logger.info(`Transaction ${transaction.id} is now pending manual fulfillment by admin`);

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

    // Update payment status to failed
    await Transaction.updatePaymentStatus(
      transaction.id,
      'failed',
      {
        errorMessage: failureReason
      }
    );

    logger.info(`Transaction ${transaction.id} payment marked as failed: ${failureReason}`);

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

    // Update payment status to cancelled
    await Transaction.updatePaymentStatus(
      transaction.id,
      'cancelled',
      {
        errorMessage: 'Payment was canceled by user'
      }
    );

    // Also cancel fulfillment
    await Transaction.cancelTransaction(transaction.id, 'Payment was canceled');

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

    // Keep payment status as pending since action is required
    logger.info(`Transaction ${transaction.id} requires additional payment action`);

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
