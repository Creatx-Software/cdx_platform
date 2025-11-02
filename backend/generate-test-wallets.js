const { Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

// Generate multiple test wallets for development
function generateTestWallets(count = 5) {
  console.log('🔐 Generating Test Solana Wallets for Development\n');

  const wallets = [];

  for (let i = 1; i <= count; i++) {
    // Generate a new keypair
    const keypair = Keypair.generate();

    // Get the public key (wallet address)
    const publicKey = keypair.publicKey.toString();

    // Get the private key as array
    const privateKey = Array.from(keypair.secretKey);

    const wallet = {
      number: i,
      publicKey,
      privateKey,
      keypair
    };

    wallets.push(wallet);

    console.log(`Wallet ${i}:`);
    console.log(`  Public Key:  ${publicKey}`);
    console.log(`  Private Key: [${privateKey.slice(0, 8).join(', ')}...] (${privateKey.length} bytes)`);
    console.log('');
  }

  // Save to file for easy access
  const walletsData = wallets.map(w => ({
    number: w.number,
    publicKey: w.publicKey,
    privateKey: w.privateKey
  }));

  fs.writeFileSync('test-wallets.json', JSON.stringify(walletsData, null, 2));
  console.log('💾 Wallets saved to test-wallets.json');

  // Also create a quick reference file
  const quickRef = wallets.map(w => w.publicKey).join('\n');
  fs.writeFileSync('wallet-addresses.txt', quickRef);
  console.log('📋 Quick reference saved to wallet-addresses.txt');

  return wallets;
}

// Generate common test addresses
function generateCommonTestAddresses() {
  console.log('\n🧪 Common Test Addresses:\n');

  // System Program ID (always valid)
  console.log('System Program:     11111111111111111111111111111112');

  // Token Program ID
  console.log('Token Program:      TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

  // Associated Token Program
  console.log('Associated Token:   ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

  console.log('\n💡 Use these for quick testing when you need valid addresses');
}

// Main execution
if (require.main === module) {
  console.clear();
  generateTestWallets(10); // Generate 10 test wallets
  generateCommonTestAddresses();

  console.log('\n🚀 How to use these wallets:');
  console.log('1. Copy any public key from above');
  console.log('2. Paste it into your frontend token purchase form');
  console.log('3. Complete the test transaction');
  console.log('4. Check backend logs to see token distribution attempt');
  console.log('\n⚠️  Note: These are test wallets for development only!');
}