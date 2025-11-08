# Database Setup Instructions - V2 Manual Fulfillment

**File:** `cdx_database_v2_manual_fulfillment.sql`
**Date:** 2025-11-08
**Version:** 2.0

---

## 🎯 What This Will Do

This script will:
1. ✅ **DROP** the existing `cdx_platform` database (if exists)
2. ✅ **CREATE** fresh `cdx_platform` database
3. ✅ **CREATE** all 9 tables with updated schema
4. ✅ **INSERT** default admin user
5. ✅ **INSERT** default CDX token
6. ✅ **CREATE** database views for reporting
7. ✅ **CREATE** stored procedures for statistics

---

## 📋 Prerequisites

Before running the script:

1. ✅ MySQL Server is running
2. ✅ You have MySQL root password
3. ✅ MySQL Workbench is installed (or use command line)

---

## 🚀 Option 1: Using MySQL Workbench (RECOMMENDED)

### **Step 1: Open MySQL Workbench**
- Launch MySQL Workbench
- Connect to your local MySQL server
- Enter root password: `2001kkkK@@`

### **Step 2: Open the SQL Script**
- Click: **File** → **Open SQL Script**
- Navigate to: `c:\Users\Kanishka\Desktop\cdx-platform\`
- Select: `cdx_database_v2_manual_fulfillment.sql`

### **Step 3: Execute the Script**
- Click the **⚡ Execute** button (or press `Ctrl+Shift+Enter`)
- Wait for execution to complete (should take 5-10 seconds)

### **Step 4: Verify Creation**
You should see in the **Output** panel:
```
Database created successfully!
Default admin user created: admin@cdxplatform.com (Password: Admin@123456)
Default CDX token added to tokens table
Version: 2.0 - Manual Fulfillment System
total_tables: 9
```

### **Step 5: Refresh Schema**
- In the left sidebar, right-click **"Schemas"**
- Click **"Refresh All"**
- Expand `cdx_platform` to see all tables

---

## 🚀 Option 2: Using Command Line

### **Step 1: Open Command Prompt**
```bash
# Windows: Press Win+R, type "cmd", press Enter
```

### **Step 2: Navigate to MySQL bin directory**
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

### **Step 3: Run the SQL Script**
```bash
mysql -u root -p < "c:\Users\Kanishka\Desktop\cdx-platform\cdx_database_v2_manual_fulfillment.sql"
```

### **Step 4: Enter Password**
- Enter: `2001kkkK@@`
- Press Enter

### **Step 5: Verify**
```bash
mysql -u root -p -e "USE cdx_platform; SHOW TABLES;"
```

---

## ✅ Verification Checklist

After running the script, verify everything is created:

### **1. Check Tables Exist**
```sql
USE cdx_platform;
SHOW TABLES;
```

**Expected Output (9 tables):**
```
+---------------------------+
| Tables_in_cdx_platform    |
+---------------------------+
| admin_actions             |
| email_notifications       |
| rate_limit_tracking       |
| system_statistics         |
| tokens                    |
| transactions              |
| user_sessions             |
| users                     |
| webhook_logs              |
+---------------------------+
```

### **2. Check Admin User Exists**
```sql
SELECT id, email, first_name, role FROM users WHERE role = 'ADMIN';
```

**Expected Output:**
```
+----+---------------------------+------------+-------+
| id | email                     | first_name | role  |
+----+---------------------------+------------+-------+
|  1 | admin@cdxplatform.com     | Admin      | ADMIN |
+----+---------------------------+------------+-------+
```

### **3. Check Default Token Exists**
```sql
SELECT * FROM tokens;
```

**Expected Output:**
```
+----+------------+--------------+---------------------------------------------+----------+-----------------+----------+---------------------+---------------------+------------------+------------------+----------------------+--------+--------+
| id | token_name | token_symbol | token_address                               | blockchain | price_per_token | currency | min_purchase_amount | max_purchase_amount | min_token_amount | max_token_amount | daily_purchase_limit | is_active | display_order |
+----+------------+--------------+---------------------------------------------+----------+-----------------+----------+---------------------+---------------------+------------------+------------------+----------------------+-----------+--------+
|  1 | CDX Token  | CDX          | FADm6hA3z5hYHdajao4LDEjQATLh2WvTmMjWUjTmut9 | Solana   | 0.100000        | USD      | 10.00               | 10000.00            | 100              | 100000           | 5000.00              | 1         | 1     |
+----+------------+--------------+---------------------------------------------+----------+-----------------+----------+---------------------+---------------------+------------------+------------------+----------------------+-----------+--------+
```

### **4. Check Transactions Table Structure**
```sql
DESCRIBE transactions;
```

**Look for these NEW columns:**
- ✅ `token_id` (BIGINT)
- ✅ `fulfillment_status` (ENUM)
- ✅ `fulfilled_by` (BIGINT)
- ✅ `fulfilled_at` (DATETIME)
- ✅ `fulfillment_notes` (TEXT)
- ✅ `fulfillment_transaction_hash` (VARCHAR)

**Should NOT see these OLD columns:**
- ❌ `solana_transaction_signature`
- ❌ `blockchain_status`
- ❌ `blockchain_confirmations`

### **5. Check Views Created**
```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

**Expected Output (5 views):**
```
+---------------------------+------------+
| Tables_in_cdx_platform    | Table_type |
+---------------------------+------------+
| active_users              | VIEW       |
| daily_transaction_summary | VIEW       |
| pending_fulfillments      | VIEW       |
| token_sales_summary       | VIEW       |
| user_purchase_summary     | VIEW       |
+---------------------------+------------+
```

### **6. Check Stored Procedures**
```sql
SHOW PROCEDURE STATUS WHERE Db = 'cdx_platform';
```

**Expected Output (4 procedures):**
```
+----------------+--------------------------------+
| Name           | Type                           |
+----------------+--------------------------------+
| GetDailyTransactionSummary    | PROCEDURE    |
| GetPendingFulfillmentsCount   | PROCEDURE    |
| GetTokenPerformance           | PROCEDURE    |
| GetUserStatistics             | PROCEDURE    |
+----------------+--------------------------------+
```

---

## 🔐 Default Credentials

### **Admin Account**
- **Email:** `admin@cdxplatform.com`
- **Password:** `Admin@123456`
- **⚠️ IMPORTANT:** Change this password immediately after first login!

### **To Change Admin Password:**
1. Login to the platform
2. Go to Profile Settings
3. Change password

Or via SQL:
```sql
-- Generate new hash using bcrypt with 10 rounds, then:
UPDATE users SET password_hash = 'YOUR_NEW_BCRYPT_HASH' WHERE email = 'admin@cdxplatform.com';
```

---

## 📊 Database Changes Summary

### **Tables Removed:**
- ❌ `token_configuration` (single token) → Replaced by `tokens` (multi-token)

### **New Tables:**
- ✅ `tokens` - Multi-token support

### **Modified Tables:**
- ⚠️ `transactions` - Added fulfillment fields, removed auto-blockchain fields
- ⚠️ `admin_actions` - Added new action types
- ⚠️ `email_notifications` - Added new email types

### **Unchanged Tables:**
- ✅ `users`
- ✅ `webhook_logs`
- ✅ `user_sessions`
- ✅ `system_statistics`
- ✅ `rate_limit_tracking`

---

## 🐛 Troubleshooting

### **Error: "Access denied for user"**
**Solution:** Check your MySQL root password
```bash
# Try connecting manually:
mysql -u root -p
# Enter password: 2001kkkK@@
```

### **Error: "Unknown database 'cdx_platform'"**
**Solution:** The script creates the database, this error shouldn't occur. If it does:
```sql
CREATE DATABASE cdx_platform;
USE cdx_platform;
-- Then run the script again
```

### **Error: "Table already exists"**
**Solution:** The script drops existing database first. If error persists:
```sql
DROP DATABASE IF EXISTS cdx_platform;
-- Then run the script again
```

### **MySQL Command Not Found (Windows)**
**Solution:** Add MySQL to PATH or use full path:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p
```

---

## ✅ Success Indicators

You'll know the database is created successfully when:

1. ✅ No errors in output
2. ✅ See message: "Database created successfully!"
3. ✅ 9 tables visible in schema
4. ✅ 1 admin user exists
5. ✅ 1 default token exists
6. ✅ 5 views created
7. ✅ 4 stored procedures created

---

## 🎯 Next Steps After Database Creation

1. ✅ **Update Backend .env**
   - Verify `DB_NAME=cdx_platform`
   - Verify database credentials

2. ✅ **Test Backend Connection**
   ```bash
   cd backend
   npm run dev
   ```
   - Should see: "Database connection successful"

3. ✅ **Test Login**
   - Start frontend: `cd frontend && npm start`
   - Login with admin credentials
   - Change default password

4. ✅ **Proceed to Code Updates**
   - Follow: `CDX_Manual_Fulfillment_Update_Plan.md`
   - Day 1: Remove Solana dependencies
   - Day 2: Update models

---

## 📞 Need Help?

If you encounter any issues:

1. Check MySQL error log: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
2. Verify MySQL service is running: Services → MySQL80
3. Check port 3306 is not blocked by firewall
4. Ensure sufficient disk space

---

**Status:** ✅ Database script ready to execute
**Next Action:** Run the script using MySQL Workbench or command line
