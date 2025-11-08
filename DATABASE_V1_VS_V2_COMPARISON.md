# Database Schema Comparison: V1 vs V2

**Document Purpose:** Quick reference for database changes
**Date:** 2025-11-08

---

## 📊 Side-by-Side Table Comparison

| Feature | V1 (Auto Solana) | V2 (Manual Fulfillment) |
|---------|------------------|-------------------------|
| **Total Tables** | 9 | 9 |
| **Token Support** | Single token | Multiple tokens |
| **Fulfillment** | Automatic via blockchain | Manual by admin |
| **Blockchain Integration** | Yes (Solana) | No (admin sends manually) |

---

## 📋 Table-by-Table Changes

### ✅ **UNCHANGED TABLES (5)**

| Table | Status | Notes |
|-------|--------|-------|
| `users` | ✅ No changes | Perfect as-is |
| `webhook_logs` | ✅ No changes | Stripe webhooks unchanged |
| `user_sessions` | ✅ No changes | Will now be actively used |
| `system_statistics` | ✅ No changes | Dashboard stats unchanged |
| `rate_limit_tracking` | ✅ No changes | Will now be actively used |

---

### 🆕 **NEW TABLES (1)**

#### **`tokens` - Multi-Token Support**

**Purpose:** Replace single `token_configuration` with multi-token support

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `token_name` | VARCHAR(100) | Full name (e.g., "CDX Token") |
| `token_symbol` | VARCHAR(20) | Symbol (e.g., "CDX") |
| `token_address` | VARCHAR(255) | Blockchain address |
| `blockchain` | VARCHAR(50) | "Solana", "Ethereum", etc. |
| `price_per_token` | DECIMAL(10,6) | Current price |
| `min_purchase_amount` | DECIMAL(10,2) | Min USD amount |
| `max_purchase_amount` | DECIMAL(10,2) | Max USD amount |
| `min_token_amount` | INT | Min tokens |
| `max_token_amount` | INT | Max tokens |
| `daily_purchase_limit` | DECIMAL(10,2) | Per-user daily limit |
| `is_active` | BOOLEAN | Active/inactive |
| `display_order` | INT | Sort order in UI |
| `description` | TEXT | Token description |
| `logo_url` | VARCHAR(255) | Token logo |
| `created_by` | BIGINT | Admin who created |

**Example Data:**
```sql
INSERT INTO tokens VALUES
(1, 'CDX Token', 'CDX', 'FADm...', 'Solana', 0.10, 'USD', 10.00, 10000.00, 100, 100000, 5000.00, TRUE, 1, 'CDX ecosystem token', NULL, 1, NOW(), NOW());
```

---

### ❌ **REMOVED TABLES (1)**

| Table | Reason | Replacement |
|-------|--------|-------------|
| `token_configuration` | Only supported single token | Replaced by `tokens` table |

---

### ⚠️ **MODIFIED TABLES (3)**

---

#### **1. `transactions` - Major Changes**

**Purpose:** Support multi-token + manual fulfillment

| Change Type | Column | V1 | V2 |
|-------------|--------|----|----|
| **🆕 NEW** | `token_id` | ❌ Not exist | ✅ BIGINT (FK to tokens) |
| **🆕 NEW** | `fulfillment_status` | ❌ Not exist | ✅ ENUM('pending','processing','completed','cancelled') |
| **🆕 NEW** | `fulfilled_by` | ❌ Not exist | ✅ BIGINT (admin user ID) |
| **🆕 NEW** | `fulfilled_at` | ❌ Not exist | ✅ DATETIME |
| **🆕 NEW** | `fulfillment_notes` | ❌ Not exist | ✅ TEXT (admin notes) |
| **🆕 NEW** | `fulfillment_transaction_hash` | ❌ Not exist | ✅ VARCHAR(255) |
| **♻️ RENAMED** | `amount_usd` | ✅ DECIMAL(10,2) | ✅ `usd_amount` |
| **♻️ RENAMED** | `stripe_payment_method` | ✅ VARCHAR(50) | ✅ `payment_method` |
| **❌ REMOVED** | `solana_transaction_signature` | ✅ VARCHAR(88) | ❌ Removed |
| **❌ REMOVED** | `blockchain_status` | ✅ ENUM | ❌ Removed |
| **❌ REMOVED** | `blockchain_confirmations` | ✅ INT | ❌ Removed |

**V1 Transaction Flow:**
```
User Pays → Stripe Success → Auto Send Tokens → Mark Complete
```

**V2 Transaction Flow:**
```
User Pays → Stripe Success → Admin Reviews → Admin Sends → Mark Complete
```

**New Foreign Keys:**
- `token_id` → `tokens(id)` ON DELETE RESTRICT
- `fulfilled_by` → `users(id)` ON DELETE SET NULL

---

#### **2. `admin_actions` - New Action Types**

**Added Action Types:**
- ✅ `token_created`
- ✅ `token_updated`
- ✅ `token_deactivated`
- ✅ `transaction_fulfilled`
- ✅ `user_reactivation`

**V1 Action Types:**
- user_kyc_approval
- user_kyc_rejection
- user_role_change
- user_suspension
- user_ban
- transaction_refund
- system_config_change
- other

**V2 Action Types (All V1 + New):**
- All V1 types PLUS new fulfillment/token actions

---

#### **3. `email_notifications` - New Email Type**

**Added Email Type:**
- ✅ `tokens_fulfilled` - When admin marks order complete

**All Email Types in V2:**
- verification
- password_reset
- purchase_confirmation
- **tokens_fulfilled** ⬅️ NEW
- kyc_approved
- kyc_rejected
- refund_processed
- welcome
- other

---

## 🔄 Data Migration Impact

### **If Migrating Data (Not your case):**

| Data | Migration Needed? | Complexity |
|------|-------------------|------------|
| Users | ✅ Direct copy | 🟢 Easy |
| Token Config | ⚠️ Transform to tokens table | 🟡 Medium |
| Transactions | ⚠️ Add token_id, fulfillment fields | 🔴 Complex |
| Other tables | ✅ Direct copy | 🟢 Easy |

### **Your Case (Fresh Start):**
- ✅ No migration needed
- ✅ Clean database creation
- ✅ Default admin + CDX token pre-populated

---

## 🎨 Database Diagram (Simplified)

### **V1 Structure:**
```
┌─────────┐
│  users  │
└────┬────┘
     │
     ├─► transactions ───► token_configuration (single)
     │
     └─► admin_actions
```

### **V2 Structure:**
```
┌─────────┐
│  users  │
└────┬────┘
     │
     ├─► transactions ───► tokens (multiple)
     │       │
     │       └─► fulfilled_by (admin)
     │
     └─► admin_actions (logs fulfillments)
```

---

## 📊 Views Comparison

### **V1 Views:**
1. `user_purchase_summary`
2. `daily_transaction_summary`
3. `active_users`

### **V2 Views (All V1 + New):**
1. `user_purchase_summary` (✏️ updated)
2. `daily_transaction_summary` (✏️ updated)
3. `active_users` (unchanged)
4. **`pending_fulfillments`** ⬅️ NEW
5. **`token_sales_summary`** ⬅️ NEW

### **New View: `pending_fulfillments`**
```sql
-- Shows all orders waiting for admin fulfillment
SELECT
    transaction_id,
    user_name,
    token_symbol,
    amount,
    wallet_address,
    hours_pending
FROM pending_fulfillments
ORDER BY created_at ASC;
```

### **New View: `token_sales_summary`**
```sql
-- Shows sales performance per token
SELECT
    token_name,
    total_sales,
    total_revenue,
    total_tokens_sold
FROM token_sales_summary;
```

---

## 🔧 Stored Procedures Comparison

### **V1 Procedures:**
1. `GetUserStatistics`
2. `GetDailyTransactionSummary`

### **V2 Procedures (All V1 + New):**
1. `GetUserStatistics` (✏️ updated)
2. `GetDailyTransactionSummary` (✏️ updated)
3. **`GetPendingFulfillmentsCount`** ⬅️ NEW
4. **`GetTokenPerformance`** ⬅️ NEW

---

## 📝 Query Examples

### **V1: Get user transactions**
```sql
SELECT * FROM transactions
WHERE user_id = 1
  AND status = 'completed';
```

### **V2: Get user transactions (multi-token)**
```sql
SELECT
    t.*,
    tok.token_name,
    tok.token_symbol,
    u_admin.first_name AS fulfilled_by_name
FROM transactions t
JOIN tokens tok ON t.token_id = tok.id
LEFT JOIN users u_admin ON t.fulfilled_by = u_admin.id
WHERE t.user_id = 1
  AND t.payment_status = 'succeeded'
  AND t.fulfillment_status = 'completed';
```

### **V2: Get pending fulfillments**
```sql
SELECT * FROM pending_fulfillments
WHERE hours_pending > 24
ORDER BY created_at ASC;
```

### **V2: Get token performance**
```sql
CALL GetTokenPerformance(1);
```

---

## 🎯 Key Takeaways

### **What's Better in V2:**
1. ✅ Supports multiple tokens (not just CDX)
2. ✅ Manual fulfillment gives admin control
3. ✅ No Solana dependency (admin sends tokens separately)
4. ✅ Better audit trail (fulfillment tracking)
5. ✅ Flexible - works with any blockchain
6. ✅ Session and rate limiting now actively used

### **What's Different:**
1. ⚠️ Tokens not sent automatically
2. ⚠️ Admin must manually fulfill orders
3. ⚠️ Two-stage status: payment + fulfillment
4. ⚠️ Multiple tokens instead of one

### **What's the Same:**
1. ✅ User authentication
2. ✅ Stripe payments
3. ✅ Admin actions logging
4. ✅ Email notifications
5. ✅ Webhooks

---

## 📊 Status Field Comparison

### **V1: Single Status**
```
status: pending → processing → completed
                     ↓
                   failed
```

### **V2: Dual Status**
```
payment_status: pending → succeeded → (done)
                             ↓
                          failed

fulfillment_status: pending → processing → completed
                                 ↓
                             cancelled
```

**Example V2 Flow:**
1. User pays: `payment_status = 'pending'`, `fulfillment_status = 'pending'`
2. Payment succeeds: `payment_status = 'succeeded'`, `fulfillment_status = 'pending'`
3. Admin fulfills: `payment_status = 'succeeded'`, `fulfillment_status = 'completed'`

---

## 🔒 Foreign Key Relationships

### **V1:**
```
transactions.user_id → users.id
token_configuration.updated_by → users.id
```

### **V2:**
```
transactions.user_id → users.id
transactions.token_id → tokens.id ⬅️ NEW
transactions.fulfilled_by → users.id ⬅️ NEW
tokens.created_by → users.id ⬅️ NEW
```

---

**Last Updated:** 2025-11-08
**Version:** V1 → V2 Migration Reference
