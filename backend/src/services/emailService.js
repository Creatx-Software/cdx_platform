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
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      // Load template
      const templatePath = path.join(__dirname, '../templates/verification.html');
      let html = await fs.readFile(templatePath, 'utf-8');
      
      // Replace placeholders
      html = html.replace('{{userName}}', userName);
      html = html.replace('{{verificationUrl}}', verificationUrl);
      
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
  }
};

module.exports = emailService;