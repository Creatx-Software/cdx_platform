/**
 * Setup script for price history database
 * Run this once to create the price_history table and initial data
 */

const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupPriceHistory() {
  try {
    console.log('🏗️ Setting up price history database...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/create_price_history_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await db.query(migrationSQL);

    console.log('✅ Price history table created successfully');

    // Test the setup by inserting sample data
    const { syncPriceData } = require('../services/priceDataCollector');

    console.log('📊 Testing data collection...');
    const result = await syncPriceData(7); // Collect 7 days of data

    console.log('📋 Collection Results:');
    result.results.forEach(tokenResult => {
      if (tokenResult.success) {
        console.log(`✅ ${tokenResult.symbol}: ${tokenResult.candlesStored} candles stored`);
      } else {
        console.log(`❌ ${tokenResult.symbol}: ${tokenResult.reason}`);
      }
    });

    // Verify data was inserted
    const verifyQuery = `
      SELECT
        token_symbol,
        COUNT(*) as candle_count,
        MIN(timestamp) as oldest_data,
        MAX(timestamp) as newest_data
      FROM price_history
      GROUP BY token_symbol
      ORDER BY token_symbol
    `;

    const verifyResult = await db.query(verifyQuery);

    console.log('\n📈 Database Verification:');
    console.table(verifyResult.rows.map(row => ({
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
    console.error(error.stack);
    process.exit(1);
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