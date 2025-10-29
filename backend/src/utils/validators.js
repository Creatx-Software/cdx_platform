const validator = require('validator');

// Validate email
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return {
    valid: minLength && hasUpper && hasLower && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUpper: !hasUpper ? 'Password must contain uppercase letter' : null,
      hasLower: !hasLower ? 'Password must contain lowercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain a number' : null
    }
  };
};

// Validate Solana address (basic check)
const validateSolanaAddress = (address) => {
  if (!address) return false;
  // Solana addresses are base58 encoded and typically 32-44 characters
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaRegex.test(address);
};

// Validate amount (positive number)
const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateSolanaAddress,
  validateAmount
};