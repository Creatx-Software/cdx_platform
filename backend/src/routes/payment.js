const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');

// Debug test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment routes are working!' });
});

// All other payment routes require authentication
router.use(authenticate);

// Create payment intent
router.post('/create-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', paymentController.confirmPayment);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get token price and configuration
router.get('/token-price', paymentController.getTokenPrice);

// Get transaction details
router.get('/transaction/:transactionId', paymentController.getTransactionDetails);

module.exports = router;