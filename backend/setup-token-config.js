require('dotenv').config();
const { query } = require('./src/config/database');

async function setupTokenConfiguration() {
  console.log('🔧 Setting up token configuration...');

  try {
    // Check if token_configuration table exists and has data
    const existingConfig = await query('SELECT * FROM token_configuration WHERE is_active = TRUE');

    if (existingConfig.length > 0) {
      console.log('✅ Token configuration already exists:', existingConfig[0]);
      return;
    }

    // Insert default token configuration
    await query(`
      INSERT INTO token_configuration (
        price_per_token,
        is_active,
        created_at,
        updated_at
      ) VALUES (?, ?, NOW(), NOW())
    `, [0.50, true]); // $0.50 per token

    console.log('✅ Token configuration created: $0.50 per CDX token');

    // Verify it was created
    const newConfig = await query('SELECT * FROM token_configuration WHERE is_active = TRUE');
    console.log('📊 Current configuration:', newConfig[0]);

  } catch (error) {
    console.error('❌ Error setting up token configuration:', error);

    // If table doesn't exist, create it
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('🏗️ Creating token_configuration table...');

      await query(`
        CREATE TABLE token_configuration (
          id INT AUTO_INCREMENT PRIMARY KEY,
          price_per_token DECIMAL(10, 6) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Insert default configuration
      await query(`
        INSERT INTO token_configuration (price_per_token, is_active)
        VALUES (0.50, TRUE)
      `);

      console.log('✅ Token configuration table created and configured');
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupTokenConfiguration()
    .then(() => {
      console.log('🎉 Token configuration setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupTokenConfiguration };