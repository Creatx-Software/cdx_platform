const mysql = require('mysql2/promise');
require('dotenv').config();

const checkTransactionStatus = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cdx_platform'
  });

  try {
    console.log('🔍 TRANSACTION STATUS ANALYSIS\n');
    console.log('=' .repeat(80));

    // 1. Check transaction table columns
    console.log('\n📊 TRANSACTION TABLE STRUCTURE:');
    console.log('-'.repeat(40));
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM transactions
    `);

    const statusColumns = columns.filter(col =>
      col.Field.includes('status') ||
      col.Field.includes('blockchain') ||
      col.Field.includes('stripe')
    );

    console.log('Status-related columns:');
    statusColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (Default: ${col.Default || 'NULL'})`);
    });

    // 2. Check recent transactions
    console.log('\n📝 RECENT TRANSACTIONS (Last 5):');
    console.log('-'.repeat(40));
    const [transactions] = await connection.execute(`
      SELECT
        id,
        stripe_payment_intent_id,
        status,
        blockchain_status,
        blockchain_confirmations,
        solana_transaction_signature,
        error_message,
        created_at,
        updated_at
      FROM transactions
      ORDER BY created_at DESC
      LIMIT 5
    `);

    transactions.forEach(tx => {
      console.log(`\nTransaction ID: ${tx.id}`);
      console.log(`  Stripe Intent: ${tx.stripe_payment_intent_id}`);
      console.log(`  Status: ${tx.status}`);
      console.log(`  Blockchain Status: ${tx.blockchain_status || 'NULL'}`);
      console.log(`  Blockchain Confirmations: ${tx.blockchain_confirmations || 0}`);
      console.log(`  Solana Signature: ${tx.solana_transaction_signature || 'NULL'}`);
      console.log(`  Error: ${tx.error_message || 'None'}`);
      console.log(`  Created: ${tx.created_at}`);
      console.log(`  Updated: ${tx.updated_at}`);
    });

    // 3. Check status distribution
    console.log('\n📈 STATUS DISTRIBUTION:');
    console.log('-'.repeat(40));
    const [statusCounts] = await connection.execute(`
      SELECT
        status,
        blockchain_status,
        COUNT(*) as count
      FROM transactions
      GROUP BY status, blockchain_status
      ORDER BY count DESC
    `);

    console.log('Status combinations:');
    statusCounts.forEach(row => {
      console.log(`  ${row.status} / ${row.blockchain_status || 'NULL'}: ${row.count} transactions`);
    });

    // 4. Check webhook logs
    console.log('\n🔔 WEBHOOK LOGS (Last 5):');
    console.log('-'.repeat(40));
    const [webhooks] = await connection.execute(`
      SELECT
        id,
        event_id,
        event_type,
        received_at,
        JSON_EXTRACT(payload, '$.data.object.id') as payment_intent_id,
        JSON_EXTRACT(payload, '$.data.object.status') as stripe_status
      FROM webhook_logs
      ORDER BY received_at DESC
      LIMIT 5
    `);

    if (webhooks.length === 0) {
      console.log('⚠️  No webhook logs found! This might be the issue.');
    } else {
      webhooks.forEach(wh => {
        console.log(`\nWebhook ID: ${wh.id}`);
        console.log(`  Event Type: ${wh.event_type}`);
        console.log(`  Payment Intent: ${wh.payment_intent_id}`);
        console.log(`  Stripe Status: ${wh.stripe_status}`);
        console.log(`  Received: ${wh.received_at}`);
      });
    }

    // 5. Check for mismatched statuses
    console.log('\n⚠️  PROBLEMATIC TRANSACTIONS:');
    console.log('-'.repeat(40));
    const [problems] = await connection.execute(`
      SELECT
        id,
        stripe_payment_intent_id,
        status,
        blockchain_status,
        error_message
      FROM transactions
      WHERE
        (status = 'processing' AND blockchain_status = 'pending')
        OR (status = 'completed' AND blockchain_status != 'confirmed')
        OR (status = 'processing' AND TIMESTAMPDIFF(MINUTE, updated_at, NOW()) > 10)
    `);

    if (problems.length === 0) {
      console.log('✅ No problematic transactions found.');
    } else {
      console.log(`Found ${problems.length} problematic transaction(s):`);
      problems.forEach(tx => {
        console.log(`  - ID ${tx.id}: status=${tx.status}, blockchain=${tx.blockchain_status}`);
        if (tx.error_message) {
          console.log(`    Error: ${tx.error_message}`);
        }
      });
    }

    // 6. Explain the fields
    console.log('\n📚 FIELD EXPLANATIONS:');
    console.log('-'.repeat(40));
    console.log('STATUS field:');
    console.log('  - pending: Payment intent created, waiting for Stripe payment');
    console.log('  - processing: Stripe payment successful, sending tokens');
    console.log('  - completed: Tokens sent successfully');
    console.log('  - failed: Either payment or token transfer failed');
    console.log('');
    console.log('BLOCKCHAIN_STATUS field:');
    console.log('  - pending: Token transfer not yet initiated');
    console.log('  - processing: Token transfer submitted to Solana');
    console.log('  - confirmed: Token transfer confirmed on Solana');
    console.log('  - failed: Token transfer failed on Solana');
    console.log('');
    console.log('BLOCKCHAIN_CONFIRMATIONS:');
    console.log('  - Number of Solana block confirmations (usually needs 1-32)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

checkTransactionStatus();