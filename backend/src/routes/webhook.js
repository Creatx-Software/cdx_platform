const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Stripe webhook endpoint
// Note: Raw parsing is handled at app level before this route
router.post('/stripe', webhookController.handleStripeWebhook);

// Health check for webhooks
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is healthy'
  });
});

module.exports = router;