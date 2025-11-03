const stripe = require('stripe');
require('dotenv').config();

// Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('L STRIPE_SECRET_KEY is not configured in environment variables');
  process.exit(1);
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('   STRIPE_WEBHOOK_SECRET is not configured - webhooks will not work');
}

// Initialize Stripe
const stripeInstance = stripe(STRIPE_SECRET_KEY);

// Test Stripe connection
const testStripeConnection = async () => {
  try {
    // Test by retrieving account information
    const account = await stripeInstance.accounts.retrieve();
    console.log(` Stripe connected successfully`);
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Currency: ${account.default_currency}`);
    return true;
  } catch (error) {
    console.error('L Stripe connection failed:', error.message);
    return false;
  }
};

// Stripe webhook signature verification
const verifyWebhookSignature = (payload, signature) => {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('Webhook secret not configured');
    }

    const event = stripeInstance.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    return {
      success: true,
      event
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Configuration object
const stripeConfig = {
  secretKey: STRIPE_SECRET_KEY,
  webhookSecret: STRIPE_WEBHOOK_SECRET,
  publishableKey: STRIPE_PUBLISHABLE_KEY,

  // Payment settings
  defaultCurrency: 'usd',
  minAmount: 1000, // $10.00 in cents
  maxAmount: 1000000, // $10,000.00 in cents

  // Webhook events we handle
  supportedEvents: [
    'payment_intent.created',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
    'payment_intent.requires_action',
    'charge.succeeded',
    'charge.failed',
    'charge.updated'
  ],

  // Payment method types
  allowedPaymentMethods: ['card', 'us_bank_account'],

  // Automatic payment methods
  automaticPaymentMethods: {
    enabled: true
  }
};

// Export Stripe instance and configuration
module.exports = {
  stripe: stripeInstance,
  stripeConfig,
  testStripeConnection,
  verifyWebhookSignature,

  // Constants
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY
};