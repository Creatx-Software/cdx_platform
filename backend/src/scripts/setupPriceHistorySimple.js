/**
 * Simple setup script for price history database (MySQL)
 * Executes SQL statements one by one
 */

const db = require('../config/database');

async function setupPriceHistory() {
  try {
    console.log('🏗️ Setting up price history database...');

    // 1. Create the table
    await db.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        token_symbol VARCHAR(10) NOT NULL,
        token_mint VARCHAR(50),
        timeframe CHAR(3) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        open_price DECIMAL(18,8) NOT NULL,
        high_price DECIMAL(18,8) NOT NULL,
        low_price DECIMAL(18,8) NOT NULL,
        close_price DECIMAL(18,8) NOT NULL,
        volume DECIMAL(18,8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_candle (token_symbol, timeframe, timestamp)
      )
    `);
    console.log('✅ Price history table created');

    // 2. Create indexes
    try {
      await db.query(`CREATE INDEX idx_price_history_symbol_timeframe ON price_history (token_symbol, timeframe)`);
      console.log('✅ Symbol-timeframe index created');
    } catch (err) {
      console.log('ℹ️ Symbol-timeframe index already exists');
    }

    try {
      await db.query(`CREATE INDEX idx_price_history_timestamp ON price_history (timestamp DESC)`);
      console.log('✅ Timestamp index created');
    } catch (err) {
      console.log('ℹ️ Timestamp index already exists');
    }

    try {
      await db.query(`CREATE INDEX idx_price_history_recent ON price_history (token_symbol, timeframe, timestamp DESC)`);
      console.log('✅ Recent data index created');
    } catch (err) {
      console.log('ℹ️ Recent data index already exists');
    }

    try {
      await db.query(`CREATE INDEX idx_price_history_latest ON price_history (token_symbol, timestamp DESC)`);
      console.log('✅ Latest price index created');
    } catch (err) {
      console.log('ℹ️ Latest price index already exists');
    }

    // 3. Insert sample data
    try {
      await db.query(`
        INSERT INTO price_history (token_symbol, timeframe, timestamp, open_price, high_price, low_price, close_price, volume)
        VALUES
          ('SOL', '1d', DATE_SUB(NOW(), INTERVAL 30 DAY), 100.00, 105.50, 98.20, 103.75, 1500000),
          ('SOL', '1d', DATE_SUB(NOW(), INTERVAL 29 DAY), 103.75, 108.90, 101.30, 107.45, 1650000),
          ('SOL', '1d', DATE_SUB(NOW(), INTERVAL 28 DAY), 107.45, 112.20, 105.80, 110.90, 1750000)
        ON DUPLICATE KEY UPDATE
          high_price = GREATEST(VALUES(high_price), high_price),
          low_price = LEAST(VALUES(low_price), low_price),
          close_price = VALUES(close_price),
          updated_at = CURRENT_TIMESTAMP
      `);
      console.log('✅ Sample data inserted');
    } catch (err) {
      console.log('ℹ️ Sample data already exists');
    }

    // 4. Test data collection
    console.log('📊 Testing data collection...');
    const { syncPriceData } = require('../services/priceDataCollector');

    const result = await syncPriceData(7); // Collect 7 days of data

    console.log('📋 Collection Results:');
    result.results.forEach(tokenResult => {
      if (tokenResult.success) {
        console.log(`✅ ${tokenResult.symbol}: ${tokenResult.candlesStored} candles stored`);
      } else {
        console.log(`❌ ${tokenResult.symbol}: ${tokenResult.reason}`);
      }
    });

    // 5. Verify data
    const verifyResult = await db.query(`
      SELECT
        token_symbol,
        COUNT(*) as candle_count,
        MIN(timestamp) as oldest_data,
        MAX(timestamp) as newest_data
      FROM price_history
      GROUP BY token_symbol
      ORDER BY token_symbol
    `);

    console.log('\n📈 Database Verification:');
    console.table(verifyResult.map(row => ({
      Symbol: row.token_symbol,
      Candles: parseInt(row.candle_count),
      'Oldest Data': row.oldest_data?.toLocaleDateString(),
      'Newest Data': row.newest_data?.toLocaleDateString()
    })));

    console.log('\n🎉 Price history setup completed successfully!');
    console.log('\n📚 Usage:');
    console.log('- API Endpoint: GET /api/price-history/:symbol/:timeframe/:days');
    console.log('- Health Check: GET /api/price-history/health');
    console.log('- Available Symbols: GET /api/price-history/symbols');
    console.log('- Data Sync: POST /api/price-history/sync (admin only)');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupPriceHistory()
    .then(() => {
      console.log('\n✅ Setup complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupPriceHistory };