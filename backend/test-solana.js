require('dotenv').config();
const solanaService = require('./src/services/solanaService');

async function testSolana() {
  console.log('Testing Solana connection...');

  try {
    // Test treasury balance
    console.log('Testing treasury SOL balance...');
    const solBalance = await solanaService.getTreasuryBalance();
    console.log('SOL Balance:', solBalance);

    // Test treasury token balance
    console.log('Testing treasury token balance...');
    const tokenBalance = await solanaService.getTreasuryTokenBalance();
    console.log('Token Balance:', tokenBalance);

    // Test wallet validation
    console.log('Testing wallet validation...');
    const validWallet = solanaService.isValidSolanaAddress('11111111111111111111111111111112');
    console.log('Valid wallet test:', validWallet);

    const invalidWallet = solanaService.isValidSolanaAddress('invalid');
    console.log('Invalid wallet test:', invalidWallet);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSolana();