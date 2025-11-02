const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');
require('dotenv').config();

const checkTokenOwnership = async () => {
  try {
    console.log('🔍 Checking Token Account Ownership...\n');

    // Connect to Solana
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Load treasury wallet from env
    const treasuryWallet = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SOLANA_TREASURY_PRIVATE_KEY))
    );

    // Token account and mint from env
    const CDX_TOKEN_MINT = new PublicKey(
      process.env.CDX_TOKEN_MINT_ADDRESS || 'FADm6hA3z5hYHdajao4LDEjQATLh2WvTmMjWUjTmut9'
    );

    const CDX_TREASURY_TOKEN_ACCOUNT = new PublicKey(
      process.env.CDX_TREASURY_TOKEN_ACCOUNT || 'EB3C6vVkcZ3R8XGpwXubnxq1t6FN3jqWmqCoWzNjbjQs'
    );

    console.log('📍 Configuration:');
    console.log('=====================================');
    console.log('Treasury Wallet Public Key:', treasuryWallet.publicKey.toString());
    console.log('CDX Token Mint:', CDX_TOKEN_MINT.toString());
    console.log('Treasury Token Account:', CDX_TREASURY_TOKEN_ACCOUNT.toString());
    console.log();

    // Get token account info
    console.log('🔐 Fetching Token Account Details...');
    const tokenAccountInfo = await getAccount(connection, CDX_TREASURY_TOKEN_ACCOUNT);

    console.log('\n📊 Token Account Info:');
    console.log('=====================================');
    console.log('Token Account Owner:', tokenAccountInfo.owner.toString());
    console.log('Token Mint:', tokenAccountInfo.mint.toString());
    console.log('Token Balance:', Number(tokenAccountInfo.amount) / Math.pow(10, 9), 'CDX');
    console.log();

    // Check if wallet matches owner
    const isOwner = treasuryWallet.publicKey.toString() === tokenAccountInfo.owner.toString();

    if (isOwner) {
      console.log('✅ SUCCESS: Treasury wallet OWNS the token account!');
      console.log('   The configuration is correct.');
    } else {
      console.log('❌ ERROR: Treasury wallet DOES NOT own the token account!');
      console.log('   Current treasury wallet:', treasuryWallet.publicKey.toString());
      console.log('   Token account owner:    ', tokenAccountInfo.owner.toString());
      console.log('\n🚨 SOLUTION OPTIONS:');
      console.log('=====================================');
      console.log('Option 1: Use the correct private key for wallet:', tokenAccountInfo.owner.toString());
      console.log('          Update SOLANA_TREASURY_PRIVATE_KEY in .env');
      console.log();
      console.log('Option 2: Transfer tokens to a new account owned by current treasury wallet');
      console.log('          Run: node setup-new-treasury-account.js');
      console.log();
      console.log('Option 3: Create a new token account for the current treasury wallet');
      console.log('          and transfer tokens from the old account');
    }

    // Check SOL balance
    console.log('\n💰 Treasury SOL Balance:');
    console.log('=====================================');
    const solBalance = await connection.getBalance(treasuryWallet.publicKey);
    console.log('SOL Balance:', solBalance / 1e9, 'SOL');

    if (solBalance < 0.01 * 1e9) {
      console.log('⚠️  WARNING: Low SOL balance! Need at least 0.01 SOL for transactions');
    }

    // Check if mint is correct
    if (tokenAccountInfo.mint.toString() !== CDX_TOKEN_MINT.toString()) {
      console.log('\n⚠️  WARNING: Token account mint does not match CDX_TOKEN_MINT!');
      console.log('   Expected mint:', CDX_TOKEN_MINT.toString());
      console.log('   Actual mint:  ', tokenAccountInfo.mint.toString());
    }

  } catch (error) {
    console.error('❌ Error checking ownership:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Invalid token account address');
    console.error('2. Network connection issues');
    console.error('3. Account does not exist');
  }
};

// Run the check
checkTokenOwnership();