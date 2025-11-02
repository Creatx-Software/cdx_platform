const mysql = require('mysql2/promise');
require('dotenv').config();

const checkWebhookLogs = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cdx_platform'
  });

  try {
    console.log('🔔 WEBHOOK LOGS ANALYSIS\n');
    console.log('=' .repeat(80));

    // 1. Check all webhook event types
    console.log('\n📊 WEBHOOK EVENT TYPES:');
    console.log('-'.repeat(40));
    const [eventTypes] = await connection.execute(`
      SELECT
        event_type,
        COUNT(*) as count,
        MIN(received_at) as first_received,
        MAX(received_at) as last_received
      FROM webhook_logs
      GROUP BY event_type
      ORDER BY count DESC
    `);

    eventTypes.forEach(event => {
      console.log(`${event.event_type}: ${event.count} events`);
      console.log(`  First: ${event.first_received}`);
      console.log(`  Latest: ${event.last_received}\n`);
    });

    // 2. Check processing status webhooks specifically
    console.log('\n🔍 WEBHOOKS WITH "PROCESSING" STATUS:');
    console.log('-'.repeat(40));
    const [processingWebhooks] = await connection.execute(`
      SELECT
        id,
        event_type,
        JSON_EXTRACT(payload, '$.data.object.id') as object_id,
        JSON_EXTRACT(payload, '$.data.object.status') as object_status,
        JSON_EXTRACT(payload, '$.data.object.processing') as processing_info,
        received_at
      FROM webhook_logs
      WHERE
        JSON_EXTRACT(payload, '$.data.object.status') = 'processing'
        OR JSON_EXTRACT(payload, '$.data.object.processing') IS NOT NULL
        OR payload LIKE '%processing%'
      ORDER BY received_at DESC
      LIMIT 10
    `);

    if (processingWebhooks.length === 0) {
      console.log('❌ No webhooks found with "processing" status');
    } else {
      processingWebhooks.forEach(wh => {
        console.log(`\nWebhook ID: ${wh.id}`);
        console.log(`  Event Type: ${wh.event_type}`);
        console.log(`  Object ID: ${wh.object_id}`);
        console.log(`  Status: ${wh.object_status}`);
        console.log(`  Processing Info: ${wh.processing_info}`);
        console.log(`  Received: ${wh.received_at}`);
      });
    }

    // 3. Check recent payment intent statuses
    console.log('\n💳 RECENT PAYMENT INTENT STATUSES:');
    console.log('-'.repeat(40));
    const [paymentIntents] = await connection.execute(`
      SELECT
        id,
        event_type,
        JSON_EXTRACT(payload, '$.data.object.id') as payment_intent_id,
        JSON_EXTRACT(payload, '$.data.object.status') as stripe_status,
        JSON_EXTRACT(payload, '$.data.object.amount') as amount,
        received_at
      FROM webhook_logs
      WHERE event_type LIKE 'payment_intent%'
      ORDER BY received_at DESC
      LIMIT 10
    `);

    paymentIntents.forEach(pi => {
      console.log(`\n${pi.event_type}:`);
      console.log(`  Payment Intent: ${pi.payment_intent_id}`);
      console.log(`  Status: ${pi.stripe_status}`);
      console.log(`  Amount: $${(pi.amount / 100).toFixed(2)}`);
      console.log(`  Received: ${pi.received_at}`);
    });

    // 4. Check for any webhook processing failures
    console.log('\n⚠️  WEBHOOK PROCESSING ANALYSIS:');
    console.log('-'.repeat(40));

    // Check if webhooks are being processed correctly
    const [webhookStats] = await connection.execute(`
      SELECT
        event_type,
        COUNT(*) as total_webhooks,
        COUNT(DISTINCT JSON_EXTRACT(payload, '$.data.object.id')) as unique_objects
      FROM webhook_logs
      WHERE received_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY event_type
      ORDER BY total_webhooks DESC
    `);

    console.log('Last 24 hours webhook statistics:');
    webhookStats.forEach(stat => {
      console.log(`  ${stat.event_type}: ${stat.total_webhooks} events, ${stat.unique_objects} unique objects`);
    });

    // 5. Explain Stripe webhook statuses
    console.log('\n📚 STRIPE WEBHOOK STATUS EXPLANATIONS:');
    console.log('-'.repeat(40));
    console.log('STRIPE PAYMENT INTENT STATUSES:');
    console.log('  - requires_payment_method: Waiting for payment method');
    console.log('  - requires_confirmation: Payment method attached, needs confirmation');
    console.log('  - requires_action: Additional action needed (3D Secure, etc.)');
    console.log('  - processing: Payment is being processed by bank/card network');
    console.log('  - succeeded: Payment completed successfully');
    console.log('  - canceled: Payment was canceled');
    console.log('');
    console.log('STRIPE CHARGE STATUSES:');
    console.log('  - pending: Charge is pending');
    console.log('  - succeeded: Charge completed successfully');
    console.log('  - failed: Charge failed');
    console.log('');
    console.log('NOTE: "processing" in webhooks usually means:');
    console.log('  - Stripe is processing the payment with the bank');
    console.log('  - This is NORMAL and usually resolves to "succeeded" or "failed"');
    console.log('  - Your system should wait for final "succeeded" or "failed" status');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

checkWebhookLogs();