const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply authentication and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);

// Transaction management routes
router.get('/transactions', adminController.getTransactions);
router.post('/transactions/:transactionId/retry', adminController.retryTransaction);
router.get('/transactions/export', adminController.exportTransactions);

// Fulfillment management routes
router.get('/fulfillments/pending', adminController.getPendingFulfillments);
router.post('/fulfillments/:id/fulfill', adminController.fulfillTransaction);
router.put('/fulfillments/:id/status', adminController.updateFulfillmentStatus);
router.get('/fulfillments/stats', adminController.getFulfillmentStats);

module.exports = router;