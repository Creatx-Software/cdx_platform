const mysql = require('mysql2/promise');
require('dotenv').config();

const analyzeProcessingStatus = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cdx_platform'
  });

  try {
    console.log('🔍 ANALYZING PROCESSING_STATUS FIELD\n');
    console.log('=' .repeat(80));

    // 1. Check webhook_logs table structure
    console.log('\n📊 WEBHOOK_LOGS TABLE STRUCTURE:');
    console.log('-'.repeat(40));
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM webhook_logs
    `);

    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} (Default: ${col.Default || 'NULL'})`);
    });

    // 2. Check processing_status values
    console.log('\n📝 PROCESSING_STATUS VALUES:');
    console.log('-'.repeat(40));
    const [statusValues] = await connection.execute(`
      SELECT
        processing_status,
        COUNT(*) as count,
        MIN(received_at) as first_occurrence,
        MAX(received_at) as last_occurrence
      FROM webhook_logs
      GROUP BY processing_status
      ORDER BY count DESC
    `);

    statusValues.forEach(status => {
      console.log(`${status.processing_status || 'NULL'}: ${status.count} webhooks`);
      console.log(`  First: ${status.first_occurrence}`);
      console.log(`  Latest: ${status.last_occurrence}\n`);
    });

    // 3. Check recent webhooks with processing_status
    console.log('\n🔔 RECENT WEBHOOKS WITH PROCESSING_STATUS:');
    console.log('-'.repeat(40));
    const [recentWebhooks] = await connection.execute(`
      SELECT
        id,
        event_type,
        processing_status,
        JSON_EXTRACT(payload, '$.data.object.id') as object_id,
        JSON_EXTRACT(payload, '$.data.object.status') as stripe_status,
        received_at
      FROM webhook_logs
      WHERE processing_status IS NOT NULL
      ORDER BY received_at DESC
      LIMIT 10
    `);

    if (recentWebhooks.length === 0) {
      console.log('❌ No webhooks found with processing_status set');
    } else {
      recentWebhooks.forEach(wh => {
        console.log(`\nWebhook ID: ${wh.id}`);
        console.log(`  Event Type: ${wh.event_type}`);
        console.log(`  Processing Status: ${wh.processing_status}`);
        console.log(`  Object ID: ${wh.object_id}`);
        console.log(`  Stripe Status: ${wh.stripe_status}`);
        console.log(`  Received: ${wh.received_at}`);
      });
    }

    // 4. Check if this field is being set by your code
    console.log('\n🔍 PROCESSING_STATUS ANALYSIS:');
    console.log('-'.repeat(40));

    const [pendingCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM webhook_logs WHERE processing_status = 'pending'
    `);

    const [processedCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM webhook_logs WHERE processing_status = 'processed'
    `);

    const [failedCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM webhook_logs WHERE processing_status = 'failed'
    `);

    console.log(`Pending: ${pendingCount[0].count} webhooks`);
    console.log(`Processed: ${processedCount[0].count} webhooks`);
    console.log(`Failed: ${failedCount[0].count} webhooks`);

    // 5. Check relationship between processing_status and event handling
    console.log('\n📊 PROCESSING_STATUS BY EVENT TYPE:');
    console.log('-'.repeat(40));
    const [byEventType] = await connection.execute(`
      SELECT
        event_type,
        processing_status,
        COUNT(*) as count
      FROM webhook_logs
      GROUP BY event_type, processing_status
      ORDER BY event_type, processing_status
    `);

    let lastEventType = '';
    byEventType.forEach(row => {
      if (row.event_type !== lastEventType) {
        console.log(`\n${row.event_type}:`);
        lastEventType = row.event_type;
      }
      console.log(`  ${row.processing_status || 'NULL'}: ${row.count}`);
    });

    // 6. Explain the field
    console.log('\n📚 PROCESSING_STATUS EXPLANATION:');
    console.log('-'.repeat(40));
    console.log('The "processing_status" field in webhook_logs appears to track:');
    console.log('');
    console.log('🔄 PENDING: Webhook received but not yet processed by your application');
    console.log('✅ PROCESSED: Webhook successfully handled by your application');
    console.log('❌ FAILED: Webhook processing failed in your application');
    console.log('');
    console.log('This is DIFFERENT from Stripe\'s payment status:');
    console.log('  • Stripe Status: Payment state (requires_payment_method, succeeded, etc.)');
    console.log('  • Processing Status: YOUR system\'s webhook handling state');
    console.log('');
    console.log('If webhooks show "pending" processing_status, it means:');
    console.log('  • Your webhook handler received the event');
    console.log('  • But hasn\'t marked it as processed yet');
    console.log('  • Could indicate an issue in your webhook processing logic');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

analyzeProcessingStatus();