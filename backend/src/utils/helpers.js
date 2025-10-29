const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Generate UUID
const generateUUID = () => {
  return uuidv4();
};

// Generate random token for email verification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Calculate token amount from USD
const calculateTokenAmount = (usdAmount, tokenPrice) => {
  return Math.floor(usdAmount / tokenPrice);
};

// Get expiry date (hours from now)
const getExpiryDate = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

module.exports = {
  generateUUID,
  generateVerificationToken,
  formatCurrency,
  calculateTokenAmount,
  getExpiryDate
};