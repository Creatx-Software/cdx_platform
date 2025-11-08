# CDX Platform - Manual Fulfillment Update Plan

## 📋 Overview

**Purpose:** Transform CDX platform from automatic Solana token distribution to manual admin-managed multi-token system.

**Date Created:** 2025-11-08

---

## 🎯 New Requirements Summary

### **REMOVE:**
- ❌ Automatic Solana token sending via backend
- ❌ Solana blockchain integration
- ❌ Treasury wallet management
- ❌ Automatic transaction completion

### **ADD:**
- ✅ Multi-token support (admin can add multiple tokens)
- ✅ Manual token fulfillment by admin
- ✅ Admin marks transactions as "sent/completed"
- ✅ Email notifications when admin completes order
- ✅ User purchase requests (with Stripe payment)
- ✅ Admin fulfillment tracking

---

## 🗄️ STEP 1: Database Redesign Plan

### **Tables to KEEP and USE:**
1. ✅ `users` - Keep as is
2. ✅ `transactions` - Modify for multi-token + manual fulfillment
3. ✅ `email_notifications` - Keep and use
4. ✅ `webhook_logs` - Keep for Stripe webhooks
5. ✅ `admin_actions` - **NOW WILL BE USED** for tracking fulfillment actions
6. ✅ `user_sessions` - **NOW WILL BE USED** for session management
7. ✅ `rate_limit_tracking` - **NOW WILL BE USED** for API rate limiting

### **Tables to REMOVE:**
- ❌ `token_configuration` (replaced by `tokens` table)
- ❌ `price_history` (if not needed for charts)
- ❌ `kyc_documents` (if KYC not implemented)

### **New Tables to ADD:**
1. ✅ `tokens` - Store multiple token details
2. ✅ `token_prices` - Price history for each token (optional)

### **Updated Database Schema:**

```sql
-- =====================================================
-- NEW TABLE: tokens (Multi-token support)
-- =====================================================
CREATE TABLE tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Token Details
    token_name VARCHAR(100) NOT NULL,
    token_symbol VARCHAR(20) NOT NULL,
    token_address VARCHAR(100) DEFAULT NULL,  -- Solana/Ethereum address
    blockchain VARCHAR(50) NOT NULL,          -- 'Solana', 'Ethereum', etc.

    -- Pricing & Limits
    price_per_token DECIMAL(10, 6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    min_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    max_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 10000.00,
    min_token_amount INT UNSIGNED NOT NULL DEFAULT 100,
    max_token_amount INT UNSIGNED NOT NULL DEFAULT 100000,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,  -- For sorting in UI

    -- Description
    description TEXT,
    logo_url VARCHAR(255),

    -- Metadata
    created_by BIGINT UNSIGNED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_is_active (is_active),
    INDEX idx_token_symbol (token_symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MODIFIED TABLE: transactions (Updated for manual fulfillment)
-- =====================================================
DROP TABLE IF EXISTS transactions;

CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- References
    user_id BIGINT UNSIGNED NOT NULL,
    token_id BIGINT UNSIGNED NOT NULL,  -- NEW: Which token was purchased
    transaction_uuid VARCHAR(36) NOT NULL UNIQUE,

    -- Purchase Details
    usd_amount DECIMAL(10, 2) NOT NULL,
    token_amount INT UNSIGNED NOT NULL,
    price_per_token DECIMAL(10, 6) NOT NULL,  -- Snapshot at purchase time

    -- Payment Details (Stripe)
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'succeeded', 'failed', 'cancelled') DEFAULT 'pending',

    -- Fulfillment Status (NEW - for manual admin processing)
    fulfillment_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    fulfilled_by BIGINT UNSIGNED DEFAULT NULL,  -- Admin who fulfilled it
    fulfilled_at DATETIME DEFAULT NULL,
    fulfillment_notes TEXT DEFAULT NULL,  -- Admin notes
    fulfillment_transaction_hash VARCHAR(255) DEFAULT NULL,  -- Optional: blockchain tx hash

    -- User Wallet Info
    recipient_wallet_address VARCHAR(255) NOT NULL,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE RESTRICT,
    FOREIGN KEY (fulfilled_by) REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_token_id (token_id),
    INDEX idx_transaction_uuid (transaction_uuid),
    INDEX idx_payment_status (payment_status),
    INDEX idx_fulfillment_status (fulfillment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- KEEP & USE: admin_actions (Track fulfillment actions)
-- =====================================================
-- Already exists, will be used to log:
-- - Token added/edited/deleted
-- - Transaction fulfilled
-- - User suspended/banned
-- etc.

-- =====================================================
-- KEEP & USE: user_sessions (Session management)
-- =====================================================
-- Already exists, will be used for:
-- - Active login sessions
-- - Session expiration
-- - Logout all sessions

-- =====================================================
-- KEEP & USE: rate_limit_tracking (API rate limiting)
-- =====================================================
-- Already exists, will be used for:
-- - Tracking API request counts per IP/user
-- - Preventing abuse
```

---

## 🔧 STEP 2: Backend Changes - Implementation Order

### **Phase A: Database Migration** (Day 1)

1. **Backup current database:**
   ```bash
   mysqldump -u root -p cdx_platform > backup_before_changes.sql
   ```

2. **Create migration script:** `backend/src/migrations/update_to_manual_fulfillment.sql`
   - Create `tokens` table
   - Drop and recreate `transactions` table (with new structure)
   - Migrate existing transaction data if needed

3. **Run migration:**
   ```bash
   mysql -u root -p cdx_platform < backend/src/migrations/update_to_manual_fulfillment.sql
   ```

4. **Seed initial token:**
   ```sql
   INSERT INTO tokens (token_name, token_symbol, token_address, blockchain, price_per_token,
       min_purchase_amount, max_purchase_amount, min_token_amount, max_token_amount, is_active)
   VALUES ('CDX Token', 'CDX', 'FADm6hA3z5hYHdajao4LDEjQATLh2WvTmMjWUjTmut9', 'Solana',
       0.100000, 10.00, 10000.00, 100, 100000, TRUE);
   ```

---

### **Phase B: Remove Solana Dependencies** (Day 1)

1. **Uninstall Solana packages:**
   ```bash
   cd backend
   npm uninstall @solana/web3.js @solana/spl-token
   ```

2. **Delete Solana-related files:**
   - ❌ `backend/src/config/solana.js`
   - ❌ `backend/src/services/solanaService.js`
   - ❌ Remove Solana test from `server.js`

3. **Update `backend/.env` - Remove:**
   ```
   SOLANA_RPC_URL
   SOLANA_NETWORK
   SOLANA_TREASURY_PRIVATE_KEY
   CDX_TOKEN_MINT_ADDRESS
   CDX_TREASURY_TOKEN_ACCOUNT
   ```

---

### **Phase C: Create New Models** (Day 2)

**1. Create `backend/src/models/Token.js`:**
```javascript
const db = require('../config/database');

class Token {
  // Get all active tokens
  static async getAllActiveTokens() {
    const [tokens] = await db.query(
      'SELECT * FROM tokens WHERE is_active = TRUE ORDER BY display_order, token_name'
    );
    return tokens;
  }

  // Get token by ID
  static async getTokenById(id) {
    const [tokens] = await db.query('SELECT * FROM tokens WHERE id = ?', [id]);
    return tokens[0];
  }

  // Create new token (Admin only)
  static async createToken(tokenData) {
    const [result] = await db.query('INSERT INTO tokens SET ?', [tokenData]);
    return result.insertId;
  }

  // Update token (Admin only)
  static async updateToken(id, updates) {
    await db.query('UPDATE tokens SET ?, updated_at = NOW() WHERE id = ?', [updates, id]);
  }

  // Deactivate token
  static async deactivateToken(id) {
    await db.query('UPDATE tokens SET is_active = FALSE WHERE id = ?', [id]);
  }
}

module.exports = Token;
```

**2. Update `backend/src/models/Transaction.js`:**
```javascript
// Modify existing functions to include token_id
static async createTransaction(transactionData) {
  const data = {
    user_id: transactionData.user_id,
    token_id: transactionData.token_id,  // NEW
    transaction_uuid: transactionData.transaction_uuid,
    usd_amount: transactionData.usd_amount,
    token_amount: transactionData.token_amount,
    price_per_token: transactionData.price_per_token,
    recipient_wallet_address: transactionData.wallet_address,
    payment_status: 'pending',
    fulfillment_status: 'pending'  // NEW
  };

  const [result] = await db.query('INSERT INTO transactions SET ?', [data]);
  return result.insertId;
}

// NEW: Get pending fulfillments (for admin)
static async getPendingFulfillments(limit = 50, offset = 0) {
  const [transactions] = await db.query(`
    SELECT t.*, u.email, u.first_name, u.last_name,
           tok.token_name, tok.token_symbol, tok.blockchain
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    JOIN tokens tok ON t.token_id = tok.id
    WHERE t.payment_status = 'succeeded'
      AND t.fulfillment_status = 'pending'
    ORDER BY t.created_at ASC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  return transactions;
}

// NEW: Mark transaction as fulfilled
static async markAsFulfilled(transactionId, adminId, notes, txHash = null) {
  await db.query(`
    UPDATE transactions
    SET fulfillment_status = 'completed',
        fulfilled_by = ?,
        fulfilled_at = NOW(),
        completed_at = NOW(),
        fulfillment_notes = ?,
        fulfillment_transaction_hash = ?
    WHERE id = ?
  `, [adminId, notes, txHash, transactionId]);
}
```

**3. Update `backend/src/models/index.js`:**
```javascript
const User = require('./User');
const Token = require('./Token');  // NEW
const Transaction = require('./Transaction');

module.exports = {
  User,
  Token,
  Transaction
};
```

---

### **Phase D: Update Controllers** (Day 2-3)

**1. Create `backend/src/controllers/tokenController.js`:**
```javascript
const { Token } = require('../models');
const logger = require('../utils/logger');

// Get all active tokens (Public)
exports.getAllTokens = async (req, res, next) => {
  try {
    const tokens = await Token.getAllActiveTokens();
    res.json({ success: true, tokens });
  } catch (error) {
    next(error);
  }
};

// Get token details
exports.getTokenDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = await Token.getTokenById(id);

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

// Admin: Create new token
exports.createToken = async (req, res, next) => {
  try {
    const tokenData = {
      ...req.body,
      created_by: req.userId
    };

    const tokenId = await Token.createToken(tokenData);

    // Log admin action
    // ... logging code

    res.status(201).json({
      success: true,
      message: 'Token created successfully',
      tokenId
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update token
exports.updateToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Token.updateToken(id, req.body);

    res.json({ success: true, message: 'Token updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Admin: Deactivate token
exports.deactivateToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Token.deactivateToken(id);

    res.json({ success: true, message: 'Token deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
```

**2. Update `backend/src/controllers/paymentController.js`:**

```javascript
// Modify createPurchaseIntent to accept token_id
exports.createPurchaseIntent = async (req, res, next) => {
  try {
    const { token_id, usd_amount, wallet_address } = req.body;
    const userId = req.userId;

    // Get token details
    const token = await Token.getTokenById(token_id);
    if (!token || !token.is_active) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Validate amount
    if (usd_amount < token.min_purchase_amount || usd_amount > token.max_purchase_amount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between $${token.min_purchase_amount} and $${token.max_purchase_amount}`
      });
    }

    // Calculate token amount
    const tokenAmount = Math.floor(usd_amount / token.price_per_token);

    // Validate token amount
    if (tokenAmount < token.min_token_amount || tokenAmount > token.max_token_amount) {
      return res.status(400).json({ success: false, message: 'Invalid token amount' });
    }

    // Validate wallet address (basic check)
    if (!wallet_address || wallet_address.length < 20) {
      return res.status(400).json({ success: false, message: 'Invalid wallet address' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      usd_amount,
      {
        userId,
        tokenId: token_id,
        tokenSymbol: token.token_symbol,
        tokenAmount,
        walletAddress: wallet_address
      }
    );

    // Create transaction record
    const transactionId = await Transaction.createTransaction({
      user_id: userId,
      token_id: token_id,  // NEW
      transaction_uuid: uuidv4(),
      usd_amount: usd_amount,
      token_amount: tokenAmount,
      price_per_token: token.price_per_token,
      wallet_address: wallet_address,
      stripe_payment_intent_id: paymentIntent.id
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      transactionId,
      tokenAmount,
      tokenSymbol: token.token_symbol
    });

  } catch (error) {
    next(error);
  }
};

// Remove: confirmPurchase function (no longer auto-sends tokens)
// Webhook will just mark payment as succeeded, not trigger token sending
```

**3. Update `backend/src/controllers/adminController.js`:**

Add fulfillment management:
```javascript
// Get pending fulfillments
exports.getPendingFulfillments = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.getPendingFulfillments(limit, offset);

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

// Mark transaction as fulfilled
exports.fulfillTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, transaction_hash } = req.body;
    const adminId = req.userId;

    // Get transaction details for email
    const transaction = await Transaction.findTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Mark as fulfilled
    await Transaction.markAsFulfilled(id, adminId, notes, transaction_hash);

    // Send email to user
    await emailService.sendTokensFulfilledEmail(
      transaction.user_email,
      transaction.user_name,
      transaction.token_symbol,
      transaction.token_amount,
      transaction.wallet_address,
      transaction_hash
    );

    // Log admin action
    // ... logging code

    res.json({ success: true, message: 'Transaction marked as fulfilled' });
  } catch (error) {
    next(error);
  }
};
```

---

### **Phase E: Update Routes** (Day 3)

**1. Create `backend/src/routes/token.js`:**
```javascript
const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Public routes
router.get('/', tokenController.getAllTokens);
router.get('/:id', tokenController.getTokenDetails);

// Admin routes
router.post('/', authenticate, requireAdmin, tokenController.createToken);
router.put('/:id', authenticate, requireAdmin, tokenController.updateToken);
router.delete('/:id', authenticate, requireAdmin, tokenController.deactivateToken);

module.exports = router;
```

**2. Update `backend/src/routes/admin.js`:**
```javascript
// Add fulfillment routes
router.get('/fulfillments/pending', authenticate, requireAdmin, adminController.getPendingFulfillments);
router.post('/fulfillments/:id/fulfill', authenticate, requireAdmin, adminController.fulfillTransaction);

// Add token management routes (alternative to separate token routes)
router.get('/tokens', authenticate, requireAdmin, tokenController.getAllTokens);
router.post('/tokens', authenticate, requireAdmin, tokenController.createToken);
router.put('/tokens/:id', authenticate, requireAdmin, tokenController.updateToken);
```

**3. Update `backend/src/app.js`:**
```javascript
// Add token routes
const tokenRoutes = require('./routes/token');
app.use('/api/tokens', tokenRoutes);

// Remove Solana-related imports/configs
```

---

## 🎨 STEP 3: Frontend Changes

### **Phase F: Frontend Service Updates** (Day 4)

**1. Create `frontend/src/services/tokenService.js`:**
```javascript
import api from './api';

const tokenService = {
  // Get all active tokens
  getAllTokens: async () => {
    const response = await api.get('/tokens');
    return response.data;
  },

  // Get token details
  getTokenDetails: async (tokenId) => {
    const response = await api.get(`/tokens/${tokenId}`);
    return response.data;
  },

  // Admin: Create token
  createToken: async (tokenData) => {
    const response = await api.post('/tokens', tokenData);
    return response.data;
  },

  // Admin: Update token
  updateToken: async (tokenId, updates) => {
    const response = await api.put(`/tokens/${tokenId}`, updates);
    return response.data;
  },

  // Admin: Deactivate token
  deactivateToken: async (tokenId) => {
    const response = await api.delete(`/tokens/${tokenId}`);
    return response.data;
  }
};

export default tokenService;
```

**2. Create `frontend/src/services/fulfillmentService.js`:**
```javascript
import api from './api';

const fulfillmentService = {
  // Get pending fulfillments
  getPendingFulfillments: async (page = 1, limit = 50) => {
    const response = await api.get(`/admin/fulfillments/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Mark transaction as fulfilled
  fulfillTransaction: async (transactionId, fulfillmentData) => {
    const response = await api.post(`/admin/fulfillments/${transactionId}/fulfill`, fulfillmentData);
    return response.data;
  }
};

export default fulfillmentService;
```

**3. Update `frontend/src/services/paymentService.js`:**
```javascript
// Update createPaymentIntent to include token_id
createPaymentIntent: async (tokenId, usdAmount, walletAddress) => {
  const response = await api.post('/payment/create-intent', {
    token_id: tokenId,
    usd_amount: usdAmount,
    wallet_address: walletAddress
  });
  return response.data;
}
```

---

### **Phase G: Frontend Components** (Day 5-6)

**1. Update `frontend/src/components/payment/TokenPurchase.jsx`:**
```javascript
// Add token selection dropdown
const [tokens, setTokens] = useState([]);
const [selectedToken, setSelectedToken] = useState(null);

useEffect(() => {
  const fetchTokens = async () => {
    const data = await tokenService.getAllTokens();
    setTokens(data.tokens);
    if (data.tokens.length > 0) {
      setSelectedToken(data.tokens[0]);
    }
  };
  fetchTokens();
}, []);

// Show token selector
<select onChange={(e) => {
  const token = tokens.find(t => t.id === parseInt(e.target.value));
  setSelectedToken(token);
}}>
  {tokens.map(token => (
    <option key={token.id} value={token.id}>
      {token.token_name} ({token.token_symbol}) - ${token.price_per_token}
    </option>
  ))}
</select>

// Update purchase flow to use selectedToken.id
```

**2. Create `frontend/src/admin/components/TokenManagement.jsx`:**
```javascript
// Table showing all tokens
// Add/Edit/Deactivate tokens
// Form with fields: name, symbol, address, blockchain, price, limits, etc.
```

**3. Create `frontend/src/admin/components/FulfillmentQueue.jsx`:**
```javascript
import React, { useState, useEffect } from 'react';
import fulfillmentService from '../../../services/fulfillmentService';

const FulfillmentQueue = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const data = await fulfillmentService.getPendingFulfillments();
    setPendingTransactions(data.transactions);
  };

  const handleFulfill = async (txId, notes, txHash) => {
    await fulfillmentService.fulfillTransaction(txId, { notes, transaction_hash: txHash });
    fetchPending(); // Refresh list
    alert('Transaction marked as fulfilled!');
  };

  return (
    <div>
      <h2>Pending Fulfillments</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Token</th>
            <th>Amount</th>
            <th>Wallet Address</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingTransactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.transaction_uuid}</td>
              <td>{tx.first_name} {tx.last_name}</td>
              <td>{tx.token_symbol}</td>
              <td>{tx.token_amount}</td>
              <td>{tx.recipient_wallet_address}</td>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => setSelectedTx(tx)}>Fulfill</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTx && (
        <FulfillmentModal
          transaction={selectedTx}
          onFulfill={handleFulfill}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};
```

**4. Update Admin Dashboard** - Add tabs:
- Token Management (add/edit tokens)
- Fulfillment Queue (pending orders)
- Fulfilled Orders (completed)

---

## 📧 STEP 4: Email Templates (Day 6)

**Create `backend/src/templates/tokensFulfilled.html`:**
```html
<!-- Email template for when admin marks tokens as sent -->
<h1>Your {{tokenSymbol}} Tokens Have Been Sent!</h1>
<p>Hi {{userName}},</p>
<p>Great news! Your order has been fulfilled.</p>
<ul>
  <li>Token: {{tokenSymbol}}</li>
  <li>Amount: {{tokenAmount}}</li>
  <li>Wallet: {{walletAddress}}</li>
  <li>Transaction Hash: {{transactionHash}}</li>
</ul>
<p>Please check your wallet to confirm receipt.</p>
```

**Update `backend/src/services/emailService.js`:**
```javascript
exports.sendTokensFulfilledEmail = async (email, userName, tokenSymbol, tokenAmount, walletAddress, txHash) => {
  // Load template and send email
};
```

---

## 🧪 STEP 5: Testing Plan (Day 7)

### **Testing Checklist:**
1. ✅ Admin can add new tokens
2. ✅ Admin can edit token details
3. ✅ Admin can deactivate tokens
4. ✅ Users see all active tokens on purchase page
5. ✅ Users can select different tokens
6. ✅ Purchase flow works with Stripe
7. ✅ Transaction appears in admin fulfillment queue
8. ✅ Admin can mark transaction as fulfilled
9. ✅ User receives fulfillment email
10. ✅ Transaction shows as "completed" in user history

---

## 📊 STEP 6: Summary of Changes

### **Files to DELETE:**
```
backend/src/config/solana.js
backend/src/services/solanaService.js
backend/src/scripts/setupPriceHistory.js (if not using charts)
```

### **Files to CREATE:**
```
backend/src/models/Token.js
backend/src/controllers/tokenController.js
backend/src/routes/token.js
backend/src/migrations/update_to_manual_fulfillment.sql
backend/src/templates/tokensFulfilled.html

frontend/src/services/tokenService.js
frontend/src/services/fulfillmentService.js
frontend/src/admin/components/TokenManagement.jsx
frontend/src/admin/components/FulfillmentQueue.jsx
frontend/src/admin/components/FulfillmentModal.jsx
```

### **Files to MODIFY:**
```
backend/src/models/Transaction.js
backend/src/models/index.js
backend/src/controllers/paymentController.js
backend/src/controllers/adminController.js
backend/src/services/emailService.js
backend/src/app.js
backend/.env
backend/package.json

frontend/src/components/payment/TokenPurchase.jsx
frontend/src/admin/pages/AdminPage.jsx
frontend/src/user/components/TransactionHistory.jsx
frontend/package.json
```

---

## ⏱️ Timeline Summary

| Day | Tasks | Estimated Time |
|-----|-------|---------------|
| **Day 1** | Database migration + Remove Solana | 3-4 hours |
| **Day 2** | Create models (Token) + Update Transaction model | 4-5 hours |
| **Day 3** | Update controllers + routes | 4-5 hours |
| **Day 4** | Frontend services | 2-3 hours |
| **Day 5-6** | Frontend components (Token management, Fulfillment) | 6-8 hours |
| **Day 6** | Email templates | 1-2 hours |
| **Day 7** | Testing | 3-4 hours |
| **Total** | **23-31 hours** | ~4-5 days |

---

## 🚀 Implementation Workflow

1. ✅ Save this plan (DONE)
2. ⏳ Analyze existing database
3. ⏳ Create migration script
4. ⏳ Update backend models
5. ⏳ Update backend controllers & routes
6. ⏳ Remove Solana dependencies
7. ⏳ Update frontend services
8. ⏳ Update frontend components
9. ⏳ Add email templates
10. ⏳ Test complete flow

---

## 📝 Notes

- **Backup database before any changes**
- **Test each phase before moving to next**
- **Keep Stripe integration as-is (working)**
- **Session management and rate limiting will now be active**
- **Admin actions will be logged for audit trail**

---

**Last Updated:** 2025-11-08
**Version:** 1.0
**Status:** Ready for implementation
