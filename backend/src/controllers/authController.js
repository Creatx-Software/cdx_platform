const { User } = require('../models');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { validateEmail, validatePassword } = require('../utils/validators');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const authController = {
  // Register new user
  register: async (req, res, next) => {
    console.log('Register endpoint called');
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // Validate email
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      // Validate password
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        const errors = Object.values(passwordCheck.errors).filter(e => e !== null);
        return res.status(400).json({
          success: false,
          error: 'Password requirements not met',
          details: errors
        });
      }

      // Check if user already exists
      const existingUser = await User.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Create user
      const result = await User.createUser({
        email,
        password,
        firstName,
        lastName
      });

      logger.info(`New user registered: ${email}`);

      // Send verification email
      await emailService.sendVerificationEmail(
        email,
        firstName,
        result.verificationToken
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: result.userId
      });

    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  },

  // Login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validate fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if email is verified
      if (!user.email_verified) {
        return res.status(403).json({
          success: false,
          error: 'Please verify your email before logging in'
        });
      }

      // Check account status
      if (user.account_status !== 'active') {
        return res.status(403).json({
          success: false,
          error: `Account is ${user.account_status}`
        });
      }

      // Update last login
      await User.updateLastLogin(user.id, req.ip);

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          walletAddress: user.solana_wallet_address
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  },

  // Verify email
  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Verification token is required'
        });
      }

      // Verify email
      const result = await User.verifyUserEmail(token);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      logger.info(`Email verified for user ID: ${result.userId}`);

      // Get user details
      const user = await User.findUserById(result.userId);

      // Send welcome email
      await emailService.sendWelcomeEmail(
        user.email,
        user.first_name
      );

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.'
      });

    } catch (error) {
      logger.error('Email verification error:', error);
      next(error);
    }
  },

  // Forgot password
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      // Find user
      const user = await User.findUserByEmail(email);

      // Always return success (security best practice)
      // Don't reveal if email exists or not
      if (!user) {
        return res.json({
          success: true,
          message: 'If that email is registered, you will receive a password reset link.'
        });
      }

      // Generate reset token
      const resetToken = await User.setPasswordResetToken(email);

      if (!resetToken) {
        return res.json({
          success: true,
          message: 'If that email is registered, you will receive a password reset link.'
        });
      }

      // Send reset email
      await emailService.sendPasswordResetEmail(
        email,
        user.first_name,
        resetToken
      );

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If that email is registered, you will receive a password reset link.'
      });

    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  },

  // Reset password
  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }

      // Validate new password
      const passwordCheck = validatePassword(newPassword);
      if (!passwordCheck.valid) {
        const errors = Object.values(passwordCheck.errors).filter(e => e !== null);
        return res.status(400).json({
          success: false,
          error: 'Password requirements not met',
          details: errors
        });
      }

      // Reset password
      const result = await User.resetPassword(token, newPassword);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      logger.info(`Password reset completed for user ID: ${result.userId}`);

      res.json({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.'
      });

    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  },

  // Change password
  changePassword: async (req, res, next) => {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.userId;

      // Get user details
      const user = await User.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await comparePassword(current_password, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Validate new password
      const passwordCheck = validatePassword(new_password);
      if (!passwordCheck.valid) {
        const errors = Object.values(passwordCheck.errors).filter(e => e !== null);
        return res.status(400).json({
          success: false,
          error: 'Password requirements not met',
          details: errors
        });
      }

      // Check if new password is different from current
      const isSamePassword = await comparePassword(new_password, user.password_hash);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          error: 'New password must be different from current password'
        });
      }

      // Update password
      await User.updatePassword(userId, new_password);

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  },

  // Logout (optional - mainly for session cleanup)
  logout: async (req, res, next) => {
    try {
      // In JWT auth, logout is mainly handled client-side
      // But we can log the event
      logger.info(`User logged out: ${req.userId}`);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }
};

module.exports = authController;