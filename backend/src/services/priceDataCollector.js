const db = require('../config/database');
const axios = require('axios');

/**
 * Price Data Collector Service
 * Collects historical and real-time price data from external APIs
 * and stores them in the database for chart display
 */

class PriceDataCollector {
  constructor() {
    this.supportedTokens = [
      { symbol: 'SOL', coinGeckoId: 'solana' },
      { symbol: 'BTC', coinGeckoId: 'bitcoin' },
      { symbol: 'ETH', coinGeckoId: 'ethereum' }
    ];

    this.rateLimitDelay = 2000; // 2 seconds between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting for free API usage
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch historical data from CoinGecko
   */
  async fetchHistoricalFromCoinGecko(coinGeckoId, days = 30) {
    try {
      await this.respectRateLimit();

      console.log(`🔄 Fetching ${days} days of data for ${coinGeckoId}`);

      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinGeckoId}/ohlc`, {
        params: {
          vs_currency: 'usd',
          days: days
        },
        timeout: 10000
      });

      return response.data.map(item => ({
        timestamp: new Date(item[0]),
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4]
      }));

    } catch (error) {
      console.error(`❌ CoinGecko fetch failed for ${coinGeckoId}:`, error.message);
      throw error;
    }
  }

  /**
   * Store price data in database
   */
  async storePriceData(symbol, timeframe, priceData) {
    try {
      console.log(`💾 Storing ${priceData.length} candles for ${symbol} (${timeframe})`);

      for (const candle of priceData) {
        await db.query(`
          INSERT INTO price_history
          (token_symbol, timeframe, timestamp, open_price, high_price, low_price, close_price)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            high_price = GREATEST(VALUES(high_price), high_price),
            low_price = LEAST(VALUES(low_price), low_price),
            close_price = VALUES(close_price),
            updated_at = CURRENT_TIMESTAMP
        `, [
          symbol.toUpperCase(),
          timeframe,
          candle.timestamp,
          candle.open,
          candle.high,
          candle.low,
          candle.close
        ]);
      }

      console.log(`✅ Successfully stored ${priceData.length} candles for ${symbol}`);

    } catch (error) {
      console.error(`❌ Database storage failed for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Collect data for a single token
   */
  async collectTokenData(tokenConfig, days = 30) {
    try {
      const { symbol, coinGeckoId } = tokenConfig;

      // Fetch historical data
      const historicalData = await this.fetchHistoricalFromCoinGecko(coinGeckoId, days);

      if (historicalData.length === 0) {
        console.warn(`⚠️ No data received for ${symbol}`);
        return { symbol, success: false, reason: 'No data received' };
      }

      // Store in database
      await this.storePriceData(symbol, '1d', historicalData);

      return {
        symbol,
        success: true,
        candlesStored: historicalData.length,
        oldestData: historicalData[0].timestamp,
        newestData: historicalData[historicalData.length - 1].timestamp
      };

    } catch (error) {
      console.error(`❌ Collection failed for ${tokenConfig.symbol}:`, error.message);
      return {
        symbol: tokenConfig.symbol,
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * Main sync function - collects data for all supported tokens
   */
  async syncPriceData(days = 30) {
    console.log('🚀 Starting price data synchronization...');

    const results = [];

    for (const tokenConfig of this.supportedTokens) {
      try {
        const result = await this.collectTokenData(tokenConfig, days);
        results.push(result);

        // Log progress
        if (result.success) {
          console.log(`✅ ${result.symbol}: ${result.candlesStored} candles stored`);
        } else {
          console.log(`❌ ${result.symbol}: ${result.reason}`);
        }

      } catch (error) {
        console.error(`❌ Unexpected error for ${tokenConfig.symbol}:`, error.message);
        results.push({
          symbol: tokenConfig.symbol,
          success: false,
          reason: `Unexpected error: ${error.message}`
        });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`📊 Sync Summary: ${successful} successful, ${failed} failed`);

    return {
      totalProcessed: results.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Get current price from Jupiter (for real-time updates)
   */
  async getCurrentPrice(tokenMint = 'SOL') {
    try {
      const response = await axios.get(`https://price.jup.ag/v6/price`, {
        params: { ids: tokenMint },
        timeout: 5000
      });

      return {
        symbol: tokenMint,
        price: response.data[tokenMint]?.price || null,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Jupiter price fetch error:', error.message);
      return null;
    }
  }

  /**
   * Check data freshness and determine if sync is needed
   */
  async isDataStale(symbol, maxAgeHours = 24) {
    try {
      const result = await db.query(`
        SELECT MAX(timestamp) as latest_update
        FROM price_history
        WHERE token_symbol = ?
      `, [symbol.toUpperCase()]);

      if (result.length === 0 || !result[0].latest_update) {
        return true; // No data exists
      }

      const latestUpdate = new Date(result[0].latest_update);
      const now = new Date();
      const ageHours = (now - latestUpdate) / (1000 * 60 * 60);

      return ageHours > maxAgeHours;

    } catch (error) {
      console.error('Data freshness check error:', error.message);
      return true; // Assume stale on error
    }
  }

  /**
   * Smart sync - only updates stale data
   */
  async smartSync(maxAgeHours = 24) {
    console.log('🧠 Starting smart sync (only stale data)...');

    const results = [];

    for (const tokenConfig of this.supportedTokens) {
      const isStale = await this.isDataStale(tokenConfig.symbol, maxAgeHours);

      if (isStale) {
        console.log(`📊 ${tokenConfig.symbol} data is stale, updating...`);
        const result = await this.collectTokenData(tokenConfig);
        results.push(result);
      } else {
        console.log(`✅ ${tokenConfig.symbol} data is fresh, skipping`);
        results.push({
          symbol: tokenConfig.symbol,
          success: true,
          skipped: true,
          reason: 'Data is fresh'
        });
      }
    }

    return results;
  }
}

// Create singleton instance
const priceDataCollector = new PriceDataCollector();

// Export functions for use in routes and scheduled jobs
module.exports = {
  syncPriceData: (days) => priceDataCollector.syncPriceData(days),
  smartSync: (maxAgeHours) => priceDataCollector.smartSync(maxAgeHours),
  getCurrentPrice: (tokenMint) => priceDataCollector.getCurrentPrice(tokenMint),
  isDataStale: (symbol, maxAgeHours) => priceDataCollector.isDataStale(symbol, maxAgeHours),
  collector: priceDataCollector
};