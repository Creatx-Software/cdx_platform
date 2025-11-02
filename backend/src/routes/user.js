const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Update wallet address
router.put('/wallet', userController.updateWallet);

// Get user transaction history
router.get('/transactions', userController.getTransactions);

// Get dashboard summary
router.get('/dashboard', userController.getDashboard);

module.exports = router;