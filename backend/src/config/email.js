const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter based on email service
let transporter;

if (process.env.EMAIL_SERVICE === 'gmail') {
  // Gmail configuration (for testing only)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_API_KEY
    }
  });
} else {
  // Generic SMTP configuration (SendGrid, AWS SES, etc.)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'apikey',
      pass: process.env.EMAIL_API_KEY
    }
  });
}

// Verify transporter
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

module.exports = transporter;