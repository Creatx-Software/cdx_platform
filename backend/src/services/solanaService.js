const {
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey
} = require('@solana/web3.js');

const {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} = require('@solana/spl-token');

const {
  connection,
  treasuryWallet,
  CDX_TOKEN_MINT,
  CDX_TREASURY_TOKEN_ACCOUNT
} = require('../config/solana');

const logger = require('../utils/logger');

const solanaService = {
  // Send CDX tokens to user wallet
  sendTokens: async (recipientWalletAddress, tokenAmount, transactionId) => {
    try {
      logger.info(`Starting token transfer: ${tokenAmount} CDX to ${recipientWalletAddress}`);

      if (!treasuryWallet) {
        throw new Error('Treasury wallet not configured');
      }

      // Convert recipient address to PublicKey
      const recipientPublicKey = new PublicKey(recipientWalletAddress);

      // Get associated token account for recipient
      const recipientTokenAccount = await getAssociatedTokenAddress(
        CDX_TOKEN_MINT,
        recipientPublicKey
      );

      // Check if recipient token account exists
      let accountExists = true;
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError ||
            error instanceof TokenInvalidAccountOwnerError) {
          accountExists = false;
        } else {
          throw error;
        }
      }

      // Create transaction
      const transaction = new Transaction();

      // Add instruction to create token account if it doesn't exist
      if (!accountExists) {
        logger.info(`Creating associated token account for ${recipientWalletAddress}`);

        const createAccountInstruction = createAssociatedTokenAccountInstruction(
          treasuryWallet.publicKey, // payer
          recipientTokenAccount,     // associated token account
          recipientPublicKey,        // owner
          CDX_TOKEN_MINT            // mint
        );

        transaction.add(createAccountInstruction);
      }

      // Convert token amount to proper decimal places (CDX has 9 decimals)
      const tokenAmountWithDecimals = tokenAmount * Math.pow(10, 9);

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        CDX_TREASURY_TOKEN_ACCOUNT, // source account
        recipientTokenAccount,      // destination account
        treasuryWallet.publicKey,   // authority
        tokenAmountWithDecimals     // amount
      );

      transaction.add(transferInstruction);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = treasuryWallet.publicKey;

      // Sign transaction
      transaction.sign(treasuryWallet);

      // Send transaction
      const signature = await connection.sendRawTransaction(transaction.serialize());

      logger.info(`Token transfer transaction sent: ${signature}`);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      logger.info(`Token transfer confirmed: ${signature}`);

      return {
        success: true,
        signature,
        tokenAmount,
        recipientWallet: recipientWalletAddress,
        transactionId
      };

    } catch (error) {
      logger.error(`Token transfer failed for transaction ${transactionId}:`, error);

      return {
        success: false,
        error: error.message,
        tokenAmount,
        recipientWallet: recipientWalletAddress,
        transactionId
      };
    }
  },

  // Get token balance for an address
  getTokenBalance: async (walletAddress) => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccount = await getAssociatedTokenAddress(CDX_TOKEN_MINT, publicKey);

      try {
        const account = await getAccount(connection, tokenAccount);
        const balance = Number(account.amount) / Math.pow(10, 9); // Convert from smallest unit

        return {
          success: true,
          balance,
          walletAddress
        };
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError) {
          return {
            success: true,
            balance: 0,
            walletAddress
          };
        }
        throw error;
      }

    } catch (error) {
      logger.error(`Failed to get token balance for ${walletAddress}:`, error);
      return {
        success: false,
        error: error.message,
        walletAddress
      };
    }
  },

  // Get SOL balance for treasury wallet
  getTreasuryBalance: async () => {
    try {
      if (!treasuryWallet) {
        throw new Error('Treasury wallet not configured');
      }

      const balance = await connection.getBalance(treasuryWallet.publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      return {
        success: true,
        balance: solBalance,
        walletAddress: treasuryWallet.publicKey.toString()
      };

    } catch (error) {
      logger.error('Failed to get treasury balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get treasury token balance
  getTreasuryTokenBalance: async () => {
    try {
      if (!treasuryWallet) {
        throw new Error('Treasury wallet not configured');
      }

      const account = await getAccount(connection, CDX_TREASURY_TOKEN_ACCOUNT);
      const balance = Number(account.amount) / Math.pow(10, 9);

      return {
        success: true,
        balance,
        tokenAccount: CDX_TREASURY_TOKEN_ACCOUNT.toString()
      };

    } catch (error) {
      logger.error('Failed to get treasury token balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Validate Solana wallet address
  isValidSolanaAddress: (address) => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get transaction status
  getTransactionStatus: async (signature) => {
    try {
      const status = await connection.getSignatureStatus(signature);

      return {
        success: true,
        signature,
        confirmed: status.value?.confirmationStatus === 'confirmed' ||
                  status.value?.confirmationStatus === 'finalized',
        confirmationStatus: status.value?.confirmationStatus,
        error: status.value?.err
      };

    } catch (error) {
      logger.error(`Failed to get transaction status for ${signature}:`, error);
      return {
        success: false,
        error: error.message,
        signature
      };
    }
  }
};

module.exports = solanaService;