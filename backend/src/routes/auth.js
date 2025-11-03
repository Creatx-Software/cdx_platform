const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { validateChangePassword } = require('../middleware/validator');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);

module.exports = router;