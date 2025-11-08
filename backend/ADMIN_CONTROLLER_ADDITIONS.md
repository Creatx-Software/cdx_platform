# Admin Controller - New Functions to Add

**File:** `backend/src/controllers/adminController.js`

## Changes Required:

### 1. Update imports (line 1-5)

**OLD:**
```javascript
const { User, Transaction, TokenConfig } = require('../models');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const solanaService = require('../services/solanaService');  // REMOVE
const stripeService = require('../services/stripeService');
```

**NEW:**
```javascript
const { User, Transaction, Token } = require('../models');  // Changed TokenConfig to Token
const { query } = require('../config/database');
const logger = require('../utils/logger');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');  // ADD for fulfillment emails
```

---

### 2. Update getDashboardStats function

Remove Solana treasury balance calls (lines 63-64):

**REMOVE:**
```javascript
const treasurySOL = await solanaService.getTreasuryBalance();
const treasuryTokens = await solanaService.getTreasuryTokenBalance();
```

**REMOVE from response:**
```javascript
treasury: {
  sol_balance: treasurySOL.success ? treasurySOL.balance : 0,
  token_balance: treasuryTokens.success ? treasuryTokens.balance : 0
},
```

**ADD:** Pending fulfillments count
```javascript
// Get pending fulfillments count
const pendingFulfillmentsCount = await Transaction.getPendingFulfillmentsCount();
```

**ADD to response:**
```javascript
pending_fulfillments: pendingFulfillmentsCount
```

---

### 3. Add NEW FUNCTIONS at the end of adminController object

Add these new functions for fulfillment management:

```javascript
  // Get pending fulfillments
  getPendingFulfillments: async (req, res, next) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.getPendingFulfillments(
        parseInt(limit),
        offset
      );

      // Get total count
      const totalCount = await Transaction.getPendingFulfillmentsCount();

      res.json({
        success: true,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          total_pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Get pending fulfillments error:', error);
      next(error);
    }
  },

  // Mark transaction as fulfilled
  fulfillTransaction: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { notes, transaction_hash } = req.body;
      const adminId = req.userId;

      // Get transaction details
      const transaction = await Transaction.findTransactionById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Check if payment was successful
      if (transaction.payment_status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Cannot fulfill transaction - payment not successful'
        });
      }

      // Check if already fulfilled
      if (transaction.fulfillment_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Transaction already fulfilled'
        });
      }

      // Mark as fulfilled
      const fulfilled = await Transaction.markAsFulfilled(
        id,
        adminId,
        notes,
        transaction_hash
      );

      if (!fulfilled) {
        return res.status(500).json({
          success: false,
          message: 'Failed to mark transaction as fulfilled'
        });
      }

      // Send email notification to user
      try {
        await emailService.sendTokensFulfilledEmail(
          transaction.user_email,
          `${transaction.first_name} ${transaction.last_name}`,
          transaction.token_symbol,
          transaction.token_amount,
          transaction.recipient_wallet_address,
          transaction_hash
        );
      } catch (emailError) {
        logger.error('Failed to send fulfillment email:', emailError);
        // Don't fail the request if email fails
      }

      // Log admin action
      logger.info(`Transaction ${id} fulfilled by admin ${adminId}`);

      res.json({
        success: true,
        message: 'Transaction marked as fulfilled successfully'
      });
    } catch (error) {
      logger.error('Fulfill transaction error:', error);
      next(error);
    }
  },

  // Update fulfillment status (processing, cancelled, etc.)
  updateFulfillmentStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const adminId = req.userId;

      // Validate status
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Get transaction
      const transaction = await Transaction.findTransactionById(id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Update status
      const updated = await Transaction.updateFulfillmentStatus(id, status, {
        fulfilledBy: adminId,
        notes
      });

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update fulfillment status'
        });
      }

      logger.info(`Transaction ${id} fulfillment status updated to ${status} by admin ${adminId}`);

      res.json({
        success: true,
        message: 'Fulfillment status updated successfully'
      });
    } catch (error) {
      logger.error('Update fulfillment status error:', error);
      next(error);
    }
  },

  // Get fulfillment statistics
  getFulfillmentStats: async (req, res, next) => {
    try {
      const stats = await query(`
        SELECT
          COUNT(CASE WHEN fulfillment_status = 'pending' AND payment_status = 'succeeded' THEN 1 END) as pending_count,
          COUNT(CASE WHEN fulfillment_status = 'processing' THEN 1 END) as processing_count,
          COUNT(CASE WHEN fulfillment_status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN fulfillment_status = 'cancelled' THEN 1 END) as cancelled_count,
          MIN(CASE WHEN fulfillment_status = 'pending' AND payment_status = 'succeeded' THEN created_at END) as oldest_pending,
          AVG(CASE WHEN fulfillment_status = 'completed' THEN TIMESTAMPDIFF(HOUR, created_at, fulfilled_at) END) as avg_fulfillment_time_hours
        FROM transactions
      `);

      res.json({
        success: true,
        stats: stats[0]
      });
    } catch (error) {
      logger.error('Get fulfillment stats error:', error);
      next(error);
    }
  }
```

---

## Summary of Changes:

1. ✅ Remove `solanaService` import
2. ✅ Change `TokenConfig` to `Token` in imports
3. ✅ Add `emailService` import
4. ✅ Remove Solana treasury calls from `getDashboardStats`
5. ✅ Add pending fulfillments count to dashboard stats
6. ✅ Add 4 new functions:
   - `getPendingFulfillments()` - Get orders awaiting fulfillment
   - `fulfillTransaction()` - Mark order as fulfilled + send email
   - `updateFulfillmentStatus()` - Update status (processing/cancelled)
   - `getFulfillmentStats()` - Fulfillment statistics

---

## Notes:

- All old transaction functions should still work
- Just need to update database queries from `status` to `payment_status` and `fulfillment_status`
- Refund functions should update `fulfillment_status` to 'cancelled'
