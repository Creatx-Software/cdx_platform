const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transaction');
const tokenRoutes = require('./routes/token');
const priceHistoryRoutes = require('./routes/priceHistory');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request logging (early) with detailed webhook debugging
app.use((req, res, next) => {
  if (req.path.includes('/webhook/stripe')) {
    console.log('🔍 MIDDLEWARE: Request received for webhook:', {
      method: req.method,
      path: req.path,
      contentType: req.get('content-type'),
      hasBody: !!req.body,
      bodyType: typeof req.body,
      bodyPreview: req.body ? req.body.toString().substring(0, 50) : 'null'
    });
  }

  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rate limiting
app.use(rateLimiter);

// Webhook routes with raw body parsing (MUST be before express.json())
app.use('/api/webhook',
  (req, res, next) => {
    console.log('🚧 RAW MIDDLEWARE: Processing webhook request:', {
      method: req.method,
      path: req.path,
      contentType: req.get('content-type'),
      hasBody: !!req.body,
      bodyType: typeof req.body
    });
    next();
  },
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('🔧 POST-RAW MIDDLEWARE: After raw parsing:', {
      hasBody: !!req.body,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
      bodySize: req.body?.length
    });
    next();
  },
  webhookRoutes
);

// Body parser middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/backend/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database endpoint
app.get('/api/test/database', async (req, res) => {
  try {
    const { testConnection } = require('./config/database');
    const connected = await testConnection();

    res.json({
      success: connected,
      message: connected ? 'Database connected' : 'Database connection failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Solana connection endpoint
app.get('/api/test/solana', async (req, res) => {
  try {
    const solanaService = require('./services/solanaService');

    // Test treasury balance
    const treasuryBalance = await solanaService.getTreasuryBalance();
    const treasuryTokenBalance = await solanaService.getTreasuryTokenBalance();

    res.json({
      success: true,
      message: 'Solana connection test',
      treasuryBalance,
      treasuryTokenBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Solana connection failed'
    });
  }
});

// Other routes (after body parsing)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/price-history', priceHistoryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
