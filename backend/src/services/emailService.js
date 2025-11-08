const transporter = require('../config/email');
const logger = require('../utils/logger');
const { query } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const emailService = {
  // Send email
  sendEmail: async (to, subject, html) => {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${subject}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Log email to database
  logEmail: async (userId, email, type, subject, status) => {
    try {
      await query(
        `INSERT INTO email_notifications (user_id, email_address, email_type, subject, status)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, email, type, subject, status]
      );
    } catch (error) {
      logger.error('Failed to log email:', error);
    }
  },

  // Send verification email
  sendVerificationEmail: async (userEmail, userName, token) => {
    try {
      // FIXED: Verification should go to BACKEND, not frontend
      // Backend will handle verification and redirect to frontend with success message
      // Routes are mounted at /auth (see app.js line 107), so no /api prefix needed
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const verificationUrl = `${backendUrl}/auth/verify-email?token=${token}`;

      // Load template
      const templatePath = path.join(__dirname, '../templates/verification.html');
      let html = await fs.readFile(templatePath, 'utf-8');

      // Replace placeholders
      html = html.replace('{{userName}}', userName);
      html = html.replace(/{{verificationUrl}}/g, verificationUrl); // Replace all occurrences
      
      const subject = 'Verify Your Email - CDX Platform';
      
      const result = await emailService.sendEmail(userEmail, subject, html);
      
      // Log to database
      await emailService.logEmail(null, userEmail, 'verification', subject, 
        result.success ? 'sent' : 'failed');
      
      return result;
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send welcome email
  sendWelcomeEmail: async (userEmail, userName) => {
    try {
      const templatePath = path.join(__dirname, '../templates/welcome.html');
      let html = await fs.readFile(templatePath, 'utf-8');
      
      html = html.replace('{{userName}}', userName);
      
      const subject = 'Welcome to CDX Platform!';
      
      const result = await emailService.sendEmail(userEmail, subject, html);
      
      await emailService.logEmail(null, userEmail, 'welcome', subject,
        result.success ? 'sent' : 'failed');
      
      return result;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (userEmail, userName, token) => {
    try {
      // Keep password reset pointing to frontend page since it needs a form
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      const templatePath = path.join(__dirname, '../templates/passwordReset.html');
      let html = await fs.readFile(templatePath, 'utf-8');

      html = html.replace('{{userName}}', userName);
      html = html.replace('{{resetUrl}}', resetUrl);

      const subject = 'Password Reset Request - CDX Platform';

      const result = await emailService.sendEmail(userEmail, subject, html);

      await emailService.logEmail(null, userEmail, 'password_reset', subject,
        result.success ? 'sent' : 'failed');

      return result;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send purchase confirmation email
  sendPurchaseConfirmationEmail: async (userEmail, userName, transactionData) => {
    try {
      const templatePath = path.join(__dirname, '../templates/purchaseConfirmation.html');
      let html = await fs.readFile(templatePath, 'utf-8');

      // Format the purchase date
      const purchaseDate = new Date(transactionData.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      // Dashboard URL
      const dashboardUrl = `${process.env.FRONTEND_URL}/user/dashboard`;

      // Blockchain transaction details (might be null if tokens not sent yet)
      const blockchainTxHash = transactionData.solana_transaction_signature || 'Processing...';
      const explorerUrl = transactionData.solana_transaction_signature
        ? `https://explorer.solana.com/tx/${transactionData.solana_transaction_signature}?cluster=devnet`
        : '#';

      // Replace all placeholders
      html = html.replace('{{userName}}', userName || 'Valued Customer');
      html = html.replace('{{transactionId}}', transactionData.id);
      html = html.replace('{{tokenAmount}}', parseFloat(transactionData.token_amount).toLocaleString('en-US', { maximumFractionDigits: 2 }));
      html = html.replace('{{usdAmount}}', parseFloat(transactionData.amount_usd).toFixed(2));
      html = html.replace('{{tokenPrice}}', parseFloat(transactionData.token_price_at_purchase).toFixed(4));
      html = html.replace('{{walletAddress}}', transactionData.recipient_wallet_address);
      html = html.replace('{{purchaseDate}}', purchaseDate);
      html = html.replace('{{blockchainTxHash}}', blockchainTxHash);
      html = html.replace('{{explorerUrl}}', explorerUrl);
      html = html.replace('{{dashboardUrl}}', dashboardUrl);

      const subject = 'Payment Confirmed - Tokens Being Sent to Your Wallet';

      const result = await emailService.sendEmail(userEmail, subject, html);

      // Log to database with user_id
      await emailService.logEmail(
        transactionData.user_id,
        userEmail,
        'purchase_confirmation',
        subject,
        result.success ? 'sent' : 'failed'
      );

      return result;
    } catch (error) {
      logger.error('Failed to send purchase confirmation email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send tokens fulfilled email (when admin manually sends tokens)
  sendTokensFulfilledEmail: async (userEmail, userName, tokenSymbol, tokenAmount, walletAddress, txHash) => {
    try {
      const templatePath = path.join(__dirname, '../templates/tokensFulfilled.html');
      let html = await fs.readFile(templatePath, 'utf-8');

      // Dashboard URL
      const dashboardUrl = `${process.env.FRONTEND_URL}/user/dashboard`;

      // Format token amount
      const formattedTokenAmount = parseFloat(tokenAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });

      // Transaction hash and explorer URL (if available)
      const transactionHash = txHash || 'Provided by admin';
      const explorerUrl = txHash ? `https://explorer.solana.com/tx/${txHash}` : '#';

      // Replace all placeholders
      html = html.replace(/{{userName}}/g, userName || 'Valued Customer');
      html = html.replace(/{{tokenSymbol}}/g, tokenSymbol);
      html = html.replace(/{{tokenAmount}}/g, formattedTokenAmount);
      html = html.replace(/{{walletAddress}}/g, walletAddress);
      html = html.replace(/{{transactionHash}}/g, transactionHash);
      html = html.replace(/{{explorerUrl}}/g, explorerUrl);
      html = html.replace(/{{dashboardUrl}}/g, dashboardUrl);

      const subject = `Your ${tokenSymbol} Tokens Have Been Sent!`;

      const result = await emailService.sendEmail(userEmail, subject, html);

      // Log to database
      await emailService.logEmail(
        null,
        userEmail,
        'tokens_fulfilled',
        subject,
        result.success ? 'sent' : 'failed'
      );

      return result;
    } catch (error) {
      logger.error('Failed to send tokens fulfilled email:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;