const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

// Solana network configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';

// Create connection to Solana network
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Treasury wallet keypair (from environment variable)
let treasuryWallet = null;

try {
  const privateKeyArray = JSON.parse(process.env.SOLANA_TREASURY_PRIVATE_KEY);
  treasuryWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
  console.log(' Solana treasury wallet loaded:', treasuryWallet.publicKey.toString());
} catch (error) {
  console.error('L Failed to load treasury wallet:', error.message);
}

// CDX Token configuration
const CDX_TOKEN_MINT = new PublicKey(process.env.CDX_TOKEN_MINT_ADDRESS || 'FADm6hA3z5hYHdajao4LDEjQATLh2WvTmMjWUjTmut9');
const CDX_TREASURY_TOKEN_ACCOUNT = new PublicKey(process.env.CDX_TREASURY_TOKEN_ACCOUNT || 'EB3C6vVkcZ3R8XGpwXubnxq1t6FN3jqWmqCoWzNjbjQs');

// Test connection
const testSolanaConnection = async () => {
  try {
    const version = await connection.getVersion();
    console.log(` Connected to Solana ${SOLANA_NETWORK}:`, version);

    if (treasuryWallet) {
      const balance = await connection.getBalance(treasuryWallet.publicKey);
      console.log(`=° Treasury wallet balance: ${balance / 1e9} SOL`);
    }

    return true;
  } catch (error) {
    console.error('L Solana connection failed:', error.message);
    return false;
  }
};

module.exports = {
  connection,
  treasuryWallet,
  CDX_TOKEN_MINT,
  CDX_TREASURY_TOKEN_ACCOUNT,
  SOLANA_NETWORK,
  testSolanaConnection
};