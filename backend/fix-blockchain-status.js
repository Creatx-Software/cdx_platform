const mysql = require('mysql2/promise');
require('dotenv').config();

const fixBlockchainStatus = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cdx_platform'
  });

  try {
    console.log('🔧 Fixing Blockchain Status Fields\n');
    console.log('=' .repeat(80));

    // 1. Fix completed transactions with Solana signatures
    console.log('\n📝 Fixing completed transactions with Solana signatures...');
    const [completedUpdate] = await connection.execute(`
      UPDATE transactions
      SET
        blockchain_status = 'confirmed',
        blockchain_confirmations = 1
      WHERE
        status = 'completed'
        AND solana_transaction_signature IS NOT NULL
        AND blockchain_status = 'pending'
    `);
    console.log(`✅ Updated ${completedUpdate.affectedRows} completed transactions`);

    // 2. Fix processing transactions (should be blockchain_status = processing)
    console.log('\n📝 Fixing processing transactions...');
    const [processingUpdate] = await connection.execute(`
      UPDATE transactions
      SET blockchain_status = 'processing'
      WHERE
        status = 'processing'
        AND blockchain_status = 'pending'
    `);
    console.log(`✅ Updated ${processingUpdate.affectedRows} processing transactions`);

    // 3. Fix failed transactions
    console.log('\n📝 Fixing failed transactions...');
    const [failedUpdate] = await connection.execute(`
      UPDATE transactions
      SET blockchain_status = 'failed'
      WHERE
        status = 'failed'
        AND blockchain_status = 'pending'
    `);
    console.log(`✅ Updated ${failedUpdate.affectedRows} failed transactions`);

    // 4. Show current status distribution
    console.log('\n📊 Current Status Distribution:');
    console.log('-'.repeat(40));
    const [statusCounts] = await connection.execute(`
      SELECT
        status,
        blockchain_status,
        COUNT(*) as count
      FROM transactions
      GROUP BY status, blockchain_status
      ORDER BY status, blockchain_status
    `);

    let lastStatus = '';
    statusCounts.forEach(row => {
      if (row.status !== lastStatus) {
        console.log(`\n${row.status.toUpperCase()}:`);
        lastStatus = row.status;
      }
      console.log(`  blockchain_status = ${row.blockchain_status}: ${row.count} transactions`);
    });

    // 5. Check for any remaining issues
    console.log('\n🔍 Checking for remaining issues...');
    const [issues] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE
        (status = 'completed' AND blockchain_status != 'confirmed')
        OR (status = 'failed' AND blockchain_status NOT IN ('failed', 'pending'))
        OR (status = 'processing' AND blockchain_status NOT IN ('processing', 'pending'))
    `);

    if (issues[0].count > 0) {
      console.log(`⚠️  Found ${issues[0].count} transactions with mismatched statuses`);

      const [details] = await connection.execute(`
        SELECT id, status, blockchain_status, solana_transaction_signature
        FROM transactions
        WHERE
          (status = 'completed' AND blockchain_status != 'confirmed')
          OR (status = 'failed' AND blockchain_status NOT IN ('failed', 'pending'))
          OR (status = 'processing' AND blockchain_status NOT IN ('processing', 'pending'))
        LIMIT 10
      `);

      console.log('\nFirst 10 problematic transactions:');
      details.forEach(tx => {
        console.log(`  ID ${tx.id}: status=${tx.status}, blockchain=${tx.blockchain_status}, signature=${tx.solana_transaction_signature ? 'YES' : 'NO'}`);
      });
    } else {
      console.log('✅ All transactions have consistent status fields!');
    }

    console.log('\n✅ Database fix completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

fixBlockchainStatus();