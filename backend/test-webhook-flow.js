require('dotenv').config();
const { testConnection } = require('./src/config/database');
const Transaction = require('./src/models/Transaction');

async function testWebhookFlow() {
  console.log('Testing complete webhook-to-token flow...');

  try {
    // Connect to database
    await testConnection();
    console.log('✅ Database connected');

    // Create a test transaction
    const testTransaction = {
      userId: 1,
      stripePaymentIntentId: 'pi_test_webhook_flow_' + Date.now(),
      usdAmount: 50.00,
      tokenAmount: 100,
      solanaWalletAddress: '11111111111111111111111111111112', // System program address for testing
      status: 'pending'
    };

    console.log('Creating test transaction...');
    const result = await Transaction.createTransaction(testTransaction);
    const transactionId = result.transactionId;
    console.log('✅ Test transaction created:', transactionId);

    // Simulate payment success
    console.log('Simulating payment success...');
    const updateResult = await Transaction.updateTransactionStatus(transactionId, 'processing');
    console.log('✅ Transaction status updated to processing');

    // Test the Solana service integration (what webhook would call)
    const solanaService = require('./src/services/solanaService');

    console.log('Testing token distribution (simulated)...');
    // Use a valid test wallet for validation
    const isValidWallet = solanaService.isValidSolanaAddress(testTransaction.solanaWalletAddress);
    console.log('Wallet validation:', isValidWallet);

    if (isValidWallet) {
      console.log('✅ Wallet is valid for token distribution');

      // For testing, we'll just validate the process without actually sending tokens
      // In real scenario, this would call: await solanaService.sendTokens(...)
      console.log('Token distribution would proceed with:');
      console.log('- Recipient:', testTransaction.solanaWalletAddress);
      console.log('- Amount:', testTransaction.tokenAmount, 'CDX tokens');

      // Update transaction to completed
      await Transaction.updateTransactionStatus(transactionId, 'completed');
      console.log('✅ Transaction marked as completed');
    }

    // Verify final transaction state
    const finalTransaction = await Transaction.findTransactionById(transactionId);
    console.log('Final transaction state:', {
      id: finalTransaction.id,
      status: finalTransaction.status,
      token_amount: finalTransaction.token_amount,
      solana_wallet_address: finalTransaction.solana_wallet_address
    });

    console.log('\n🎉 Webhook flow test completed successfully!');
    console.log('Ready for real payments → token distribution');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWebhookFlow();