const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get user's transaction history
router.get('/', transactionController.getUserTransactions);

// Get transaction statistics
router.get('/stats', transactionController.getTransactionStats);

// Export transaction history
router.get('/export', transactionController.exportTransactions);

// Get specific transaction details
router.get('/:transactionId', transactionController.getTransactionDetails);

// Retry failed transaction
router.post('/:transactionId/retry', transactionController.retryTransaction);

module.exports = router;