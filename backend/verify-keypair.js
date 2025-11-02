const { Keypair, PublicKey } = require('@solana/web3.js');

// The distributor keypair from the file
const distributorKeypair = [213,249,109,105,50,20,143,101,187,223,251,254,98,23,204,100,93,127,18,30,47,86,139,73,109,212,56,28,101,160,105,53,200,56,12,176,102,165,27,143,219,179,215,239,186,121,147,102,38,210,199,14,33,130,65,124,69,224,160,2,132,33,238,80];

// The new treasury keypair you created
const newTreasuryKeypair = [75,237,189,25,43,101,93,96,142,228,132,30,198,227,182,37,231,227,196,97,223,68,236,167,32,6,127,56,97,86,162,176,136,232,146,29,25,203,77,52,90,232,64,184,213,226,184,93,179,254,40,19,67,218,32,200,39,45,183,118,16,173,63,85];

try {
  const distributorWallet = Keypair.fromSecretKey(new Uint8Array(distributorKeypair));
  console.log('Distributor Wallet Public Key:', distributorWallet.publicKey.toString());

  const newTreasuryWallet = Keypair.fromSecretKey(new Uint8Array(newTreasuryKeypair));
  console.log('New Treasury Wallet Public Key:', newTreasuryWallet.publicKey.toString());

  console.log('\nYour CLI default wallet is: EUa7PHbJWKGG8URXhCXgSjhV39b3JGvivgU448Hr9DPM');
  console.log('Token Account Owner is: EUa7PHbJWKGG8URXhCXgSjhV39b3JGvivgU448Hr9DPM');

  if (distributorWallet.publicKey.toString() === 'EUa7PHbJWKGG8URXhCXgSjhV39b3JGvivgU448Hr9DPM') {
    console.log('\n✅ The distributor-keypair.json IS the correct wallet that owns the tokens!');
  } else {
    console.log('\n❌ The distributor-keypair.json is NOT the wallet that owns the tokens');
  }
} catch (error) {
  console.error('Error:', error.message);
}