const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError
} = require('@solana/spl-token');
require('dotenv').config();

const testTokenTransfer = async () => {
  try {
    console.log('🧪 Testing Token Transfer Setup\n');
    console.log('=====================================\n');

    // Connect to Solana
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Load treasury wallet
    const treasuryWallet = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SOLANA_TREASURY_PRIVATE_KEY))
    );

    const CDX_TOKEN_MINT = new PublicKey(process.env.CDX_TOKEN_MINT_ADDRESS);
    const CDX_TREASURY_TOKEN_ACCOUNT = new PublicKey(process.env.CDX_TREASURY_TOKEN_ACCOUNT);

    console.log('📍 Configuration:');
    console.log('Treasury Wallet:', treasuryWallet.publicKey.toString());
    console.log('Token Mint:', CDX_TOKEN_MINT.toString());
    console.log('Treasury Token Account:', CDX_TREASURY_TOKEN_ACCOUNT.toString());
    console.log();

    // Check token account ownership
    console.log('🔐 Verifying Ownership...');
    const tokenAccountInfo = await getAccount(connection, CDX_TREASURY_TOKEN_ACCOUNT);

    const isOwner = treasuryWallet.publicKey.equals(tokenAccountInfo.owner);
    console.log('Token Account Owner:', tokenAccountInfo.owner.toString());
    console.log('Treasury Wallet Matches:', isOwner ? '✅ YES' : '❌ NO');

    if (!isOwner) {
      console.error('\n❌ ERROR: Treasury wallet does not own the token account!');
      console.error('Cannot proceed with transfers.');
      return;
    }

    // Check balances
    console.log('\n💰 Balances:');
    const tokenBalance = Number(tokenAccountInfo.amount) / Math.pow(10, 9);
    console.log('CDX Token Balance:', tokenBalance, 'CDX');

    const solBalance = await connection.getBalance(treasuryWallet.publicKey);
    console.log('SOL Balance:', solBalance / 1e9, 'SOL');

    if (solBalance < 0.01 * 1e9) {
      console.error('⚠️  WARNING: Low SOL balance! Need at least 0.01 SOL');
    }

    // Test transfer to a dummy address
    console.log('\n🚀 Testing Token Transfer...');
    const testRecipient = new PublicKey('7dGQiTGEbRMbprLsGDvRMmzu9NpZxSVuz9Mf8UERDx1k'); // Your test wallet
    console.log('Test Recipient:', testRecipient.toString());

    // Get recipient token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      CDX_TOKEN_MINT,
      testRecipient
    );

    // Check if account exists
    let accountExists = true;
    try {
      await getAccount(connection, recipientTokenAccount);
      console.log('Recipient token account exists ✅');
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        accountExists = false;
        console.log('Recipient token account needs to be created');
      } else {
        throw error;
      }
    }

    // Create transaction
    const transaction = new Transaction();

    if (!accountExists) {
      console.log('Adding instruction to create token account...');
      const createAccountIx = createAssociatedTokenAccountInstruction(
        treasuryWallet.publicKey,
        recipientTokenAccount,
        testRecipient,
        CDX_TOKEN_MINT
      );
      transaction.add(createAccountIx);
    }

    // Add transfer instruction (send 1 CDX)
    const transferAmount = 1 * Math.pow(10, 9); // 1 CDX
    console.log('Adding transfer instruction for 1 CDX...');

    const transferIx = createTransferInstruction(
      CDX_TREASURY_TOKEN_ACCOUNT,
      recipientTokenAccount,
      treasuryWallet.publicKey,
      transferAmount
    );
    transaction.add(transferIx);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = treasuryWallet.publicKey;

    // Sign transaction
    transaction.sign(treasuryWallet);

    // Send transaction
    console.log('\n📤 Sending transaction...');
    const signature = await connection.sendRawTransaction(transaction.serialize());
    console.log('Transaction sent:', signature);

    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
    } else {
      console.log('✅ Transaction confirmed successfully!');
      console.log('\n🎉 SUCCESS! Your token transfer system is working correctly!');
      console.log('\nView transaction on Solana Explorer:');
      console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.logs) {
      console.error('\nTransaction logs:', error.logs);
    }
  }
};

// Run the test
testTokenTransfer();