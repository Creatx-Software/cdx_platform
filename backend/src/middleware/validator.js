const { body, param, query, validationResult } = require('express-validator');

// Simple wallet address validation (basic format check)
const isValidWalletAddress = (address) => {
  // Basic validation: alphanumeric, 32-44 characters (covers most blockchain addresses)
  return typeof address === 'string' && /^[A-Za-z0-9]{32,44}$/.test(address);
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateForgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('new_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidationErrors
];

// Payment validations
const validatePaymentIntent = [
  body('tokenId').isInt({ min: 1 }).withMessage('Token ID is required'),
  body('usdAmount').isFloat({ min: 10, max: 10000 }).withMessage('Amount must be between $10 and $10,000'),
  body('walletAddress').custom(address => {
    if (!isValidWalletAddress(address)) {
      throw new Error('Invalid wallet address format');
    }
    return true;
  }),
  handleValidationErrors
];

const validateConfirmPayment = [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  handleValidationErrors
];

// Admin validations
const validateTokenConfig = [
  body('price_per_token').isFloat({ min: 0.001 }).withMessage('Token price must be greater than 0.001'),
  body('min_purchase_usd').optional().isFloat({ min: 1 }).withMessage('Minimum purchase must be at least $1'),
  body('max_purchase_usd').optional().isFloat({ min: 10 }).withMessage('Maximum purchase must be at least $10'),
  body('daily_limit_usd').optional().isFloat({ min: 100 }).withMessage('Daily limit must be at least $100'),
  handleValidationErrors
];

// User validations
const validateUpdateProfile = [
  body('first_name').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('last_name').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('wallet_address').optional().custom(address => {
    if (address && !isValidWalletAddress(address)) {
      throw new Error('Invalid wallet address format');
    }
    return true;
  }),
  handleValidationErrors
];

const validateChangePassword = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  handleValidationErrors
];

// Query parameter validations
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateTransactionFilters = [
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'all']).withMessage('Invalid status filter'),
  query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
  query('end_date').optional().isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

// Route parameter validations
const validateTransactionId = [
  param('transactionId').isInt({ min: 1 }).withMessage('Invalid transaction ID'),
  handleValidationErrors
];

const validateUserId = [
  param('userId').isInt({ min: 1 }).withMessage('Invalid user ID'),
  handleValidationErrors
];

const validateWalletAddress = [
  param('wallet_address').custom(address => {
    if (!isValidWalletAddress(address)) {
      throw new Error('Invalid wallet address format');
    }
    return true;
  }),
  handleValidationErrors
];

module.exports = {
  // Auth
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,

  // Payment
  validatePaymentIntent,
  validateConfirmPayment,

  // Admin
  validateTokenConfig,

  // User
  validateUpdateProfile,
  validateChangePassword,

  // Common
  validatePagination,
  validateTransactionFilters,
  validateTransactionId,
  validateUserId,
  validateWalletAddress,

  // Utility
  handleValidationErrors
};