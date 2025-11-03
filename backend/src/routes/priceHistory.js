const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticate = require('../middleware/auth');

/**
 * Price History Routes
 * Handles historical price data for trading charts
 */

/**
 * GET /api/price-history/:symbol/:timeframe/:days
 * Fetch historical price data
 */
router.get('/:symbol/:timeframe/:days', authenticate, async (req, res) => {
  try {
    const { symbol, timeframe, days } = req.params;

    // Validate parameters
    if (!symbol || !timeframe || !days) {
      return res.status(400).json({
        error: 'Missing required parameters: symbol, timeframe, days'
      });
    }

    const daysInt = parseInt(days);
    if (isNaN(daysInt) || daysInt <= 0 || daysInt > 365) {
      return res.status(400).json({
        error: 'Days parameter must be a number between 1 and 365'
      });
    }

    // Fetch data from database (MySQL syntax)
    const query = `
      SELECT
        timestamp,
        open_price,
        high_price,
        low_price,
        close_price,
        volume
      FROM price_history
      WHERE token_symbol = ?
        AND timeframe = ?
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY timestamp ASC
    `;

    const result = await db.query(query, [symbol.toUpperCase(), timeframe, daysInt]);

    // Format data for TradingView Lightweight Charts
    const chartData = result.map(row => ({
      time: Math.floor(new Date(row.timestamp).getTime() / 1000), // Convert to seconds
      open: parseFloat(row.open_price),
      high: parseFloat(row.high_price),
      low: parseFloat(row.low_price),
      close: parseFloat(row.close_price),
      volume: parseFloat(row.volume) || 0
    }));

    res.json(chartData);

  } catch (error) {
    console.error('Price history fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch price history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/price-history/:symbol/latest
 * Get latest price data for a symbol
 */
router.get('/:symbol/latest', authenticate, async (req, res) => {
  try {
    const { symbol } = req.params;

    const query = `
      SELECT
        timestamp,
        close_price as price,
        volume
      FROM price_history
      WHERE token_symbol = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const result = await db.query(query, [symbol.toUpperCase()]);

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No price data found for symbol'
      });
    }

    const latestPrice = {
      symbol: symbol.toUpperCase(),
      price: parseFloat(result[0].price),
      timestamp: result[0].timestamp,
      volume: parseFloat(result[0].volume) || 0
    };

    res.json(latestPrice);

  } catch (error) {
    console.error('Latest price fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch latest price'
    });
  }
});

/**
 * POST /api/price-history/sync
 * Admin endpoint to trigger data synchronization
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    // Import the sync function
    const { syncPriceData } = require('../services/priceDataCollector');

    // Trigger sync
    const result = await syncPriceData();

    res.json({
      success: true,
      message: 'Price data sync completed',
      result
    });

  } catch (error) {
    console.error('Price sync error:', error);
    res.status(500).json({
      error: 'Failed to sync price data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/price-history/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const result = await db.query('SELECT COUNT(*) as count FROM price_history LIMIT 1');

    res.json({
      status: 'healthy',
      database: 'connected',
      recordCount: parseInt(result[0].count)
    });

  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * GET /api/price-history/symbols
 * Get list of available symbols
 */
router.get('/symbols', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT
        token_symbol,
        token_mint,
        COUNT(*) as record_count,
        MAX(timestamp) as latest_update
      FROM price_history
      GROUP BY token_symbol, token_mint
      ORDER BY token_symbol
    `;

    const result = await db.query(query);

    const symbols = result.map(row => ({
      symbol: row.token_symbol,
      mint: row.token_mint,
      recordCount: parseInt(row.record_count),
      latestUpdate: row.latest_update
    }));

    res.json(symbols);

  } catch (error) {
    console.error('Symbols fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch available symbols'
    });
  }
});

module.exports = router;