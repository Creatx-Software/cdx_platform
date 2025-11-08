-- =====================================================
-- CDX TOKEN PURCHASE PLATFORM - MySQL Database Schema V2
-- =====================================================
-- Version: 2.0 - Manual Fulfillment with Multi-Token Support
-- Database: MySQL 8.0+
-- Description: Updated database structure for manual admin-managed token fulfillment
-- Changes: Removed automatic Solana integration, added multi-token support
-- Date: 2025-11-08
-- =====================================================

-- Drop existing database if exists (WARNING: This will delete all data!)
DROP DATABASE IF EXISTS cdx_platform;

-- Create database
CREATE DATABASE cdx_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE cdx_platform;

-- =====================================================
-- TABLE: users
-- Purpose: Store all user account information
-- Status: UNCHANGED from V1
-- =====================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Basic Information
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    -- Wallet Information
    solana_wallet_address VARCHAR(255) DEFAULT NULL,  -- Changed from VARCHAR(44) to support other blockchains

    -- Verification & Security
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) DEFAULT NULL,
    email_verification_expires DATETIME DEFAULT NULL,

    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires DATETIME DEFAULT NULL,

    -- KYC (Know Your Customer) Status
    kyc_status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
    kyc_submitted_at DATETIME DEFAULT NULL,
    kyc_approved_at DATETIME DEFAULT NULL,
    kyc_rejection_reason TEXT DEFAULT NULL,

    -- User Role & Status
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    account_status ENUM('active', 'suspended', 'banned') DEFAULT 'active',

    -- Metadata
    last_login_at DATETIME DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_wallet_address (solana_wallet_address),
    INDEX idx_kyc_status (kyc_status),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: tokens (NEW - Multi-token support)
-- Purpose: Store multiple token configurations
-- Status: NEW - Replaces token_configuration table
-- =====================================================
CREATE TABLE tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Token Details
    token_name VARCHAR(100) NOT NULL,
    token_symbol VARCHAR(20) NOT NULL,
    token_address VARCHAR(255) DEFAULT NULL,  -- Blockchain address (Solana/Ethereum/etc)
    blockchain VARCHAR(50) NOT NULL,          -- 'Solana', 'Ethereum', 'BSC', etc.

    -- Pricing & Limits
    price_per_token DECIMAL(10, 6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    min_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    max_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 10000.00,
    min_token_amount INT UNSIGNED NOT NULL DEFAULT 100,
    max_token_amount INT UNSIGNED NOT NULL DEFAULT 100000,

    -- Daily Limits (per user)
    daily_purchase_limit DECIMAL(10, 2) DEFAULT 5000.00,

    -- Display & Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,  -- For sorting in UI

    -- Description & Branding
    description TEXT,
    logo_url VARCHAR(255),

    -- Metadata
    created_by BIGINT UNSIGNED DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_is_active (is_active),
    INDEX idx_token_symbol (token_symbol),
    INDEX idx_blockchain (blockchain),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: transactions (MODIFIED - Manual fulfillment)
-- Purpose: Store all token purchase transactions
-- Status: MODIFIED - Added fulfillment fields, removed auto-blockchain fields
-- =====================================================
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- References
    user_id BIGINT UNSIGNED NOT NULL,
    token_id BIGINT UNSIGNED NOT NULL,  -- NEW: Which token was purchased
    transaction_uuid VARCHAR(36) NOT NULL UNIQUE,

    -- Financial Information
    usd_amount DECIMAL(10, 2) NOT NULL,
    token_amount INT UNSIGNED NOT NULL,
    price_per_token DECIMAL(10, 6) NOT NULL,  -- Snapshot at purchase time

    -- Payment Information (Stripe)
    stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
    stripe_customer_id VARCHAR(255) DEFAULT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_status ENUM('pending', 'succeeded', 'failed', 'cancelled') DEFAULT 'pending',

    -- Fulfillment Status (NEW - Manual Admin Processing)
    fulfillment_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    fulfilled_by BIGINT UNSIGNED DEFAULT NULL,  -- Admin who fulfilled the order
    fulfilled_at DATETIME DEFAULT NULL,
    fulfillment_notes TEXT DEFAULT NULL,  -- Admin can add notes
    fulfillment_transaction_hash VARCHAR(255) DEFAULT NULL,  -- Optional: blockchain tx hash if sent

    -- Recipient Wallet
    recipient_wallet_address VARCHAR(255) NOT NULL,

    -- Refund Information
    refunded_at DATETIME DEFAULT NULL,
    refund_reason TEXT DEFAULT NULL,
    refund_amount DECIMAL(10, 2) DEFAULT NULL,
    stripe_refund_id VARCHAR(255) DEFAULT NULL,

    -- Error Handling
    error_message TEXT DEFAULT NULL,
    retry_count INT UNSIGNED DEFAULT 0,

    -- Metadata
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE RESTRICT,
    FOREIGN KEY (fulfilled_by) REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_token_id (token_id),
    INDEX idx_transaction_uuid (transaction_uuid),
    INDEX idx_payment_status (payment_status),
    INDEX idx_fulfillment_status (fulfillment_status),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_created_at (created_at),
    INDEX idx_completed_at (completed_at),
    INDEX idx_fulfilled_at (fulfilled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: webhook_logs
-- Purpose: Log all incoming webhooks from Stripe
-- Status: UNCHANGED from V1
-- =====================================================
CREATE TABLE webhook_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Webhook Information
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,

    -- Payload
    payload JSON NOT NULL,

    -- Processing Status
    processed BOOLEAN DEFAULT FALSE,
    processing_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,

    -- Related Transaction
    transaction_id BIGINT UNSIGNED DEFAULT NULL,

    -- Metadata
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME DEFAULT NULL,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,

    INDEX idx_event_id (event_id),
    INDEX idx_event_type (event_type),
    INDEX idx_processed (processed),
    INDEX idx_received_at (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: admin_actions
-- Purpose: Audit log for all admin activities
-- Status: MODIFIED - Added new action types for fulfillment
-- =====================================================
CREATE TABLE admin_actions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Admin Information
    admin_id BIGINT UNSIGNED NOT NULL,

    -- Action Details
    action_type ENUM(
        'user_kyc_approval',
        'user_kyc_rejection',
        'user_role_change',
        'user_suspension',
        'user_ban',
        'user_reactivation',
        'token_created',
        'token_updated',
        'token_deactivated',
        'transaction_fulfilled',
        'transaction_refund',
        'system_config_change',
        'other'
    ) NOT NULL,

    -- Target Information
    target_type VARCHAR(50) DEFAULT NULL,  -- 'user', 'transaction', 'token'
    target_id BIGINT UNSIGNED DEFAULT NULL,

    -- Action Details
    description TEXT NOT NULL,
    changes JSON DEFAULT NULL,  -- Store before/after values

    -- Metadata
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track active user sessions (JWT tokens)
-- Status: UNCHANGED from V1 (NOW WILL BE USED)
-- =====================================================
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- User Reference
    user_id BIGINT UNSIGNED NOT NULL,

    -- Session Information
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) DEFAULT NULL,

    -- Session Details
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,

    -- Expiration
    expires_at DATETIME NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at DATETIME DEFAULT NULL,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: email_notifications
-- Purpose: Track all emails sent by the system
-- Status: MODIFIED - Added new email types
-- =====================================================
CREATE TABLE email_notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Recipient Information
    user_id BIGINT UNSIGNED DEFAULT NULL,
    email_address VARCHAR(255) NOT NULL,

    -- Email Details
    email_type ENUM(
        'verification',
        'password_reset',
        'purchase_confirmation',
        'tokens_fulfilled',
        'kyc_approved',
        'kyc_rejected',
        'refund_processed',
        'welcome',
        'other'
    ) NOT NULL,

    subject VARCHAR(255) NOT NULL,

    -- Status
    status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',

    -- External Service
    provider VARCHAR(50) DEFAULT NULL,
    provider_message_id VARCHAR(255) DEFAULT NULL,
    error_message TEXT DEFAULT NULL,

    -- Related Transaction
    transaction_id BIGINT UNSIGNED DEFAULT NULL,

    -- Metadata
    sent_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,

    INDEX idx_user_id (user_id),
    INDEX idx_email_type (email_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: system_statistics
-- Purpose: Store aggregated statistics for dashboard
-- Status: UNCHANGED from V1
-- =====================================================
CREATE TABLE system_statistics (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Date
    stat_date DATE NOT NULL UNIQUE,

    -- User Statistics
    total_users INT UNSIGNED DEFAULT 0,
    new_users_today INT UNSIGNED DEFAULT 0,
    active_users_today INT UNSIGNED DEFAULT 0,

    -- Transaction Statistics
    total_transactions INT UNSIGNED DEFAULT 0,
    transactions_today INT UNSIGNED DEFAULT 0,
    successful_transactions_today INT UNSIGNED DEFAULT 0,
    failed_transactions_today INT UNSIGNED DEFAULT 0,

    -- Financial Statistics
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    revenue_today DECIMAL(10, 2) DEFAULT 0.00,

    -- Token Statistics
    total_tokens_sold BIGINT UNSIGNED DEFAULT 0,
    tokens_sold_today INT UNSIGNED DEFAULT 0,

    -- KYC Statistics
    pending_kyc_count INT UNSIGNED DEFAULT 0,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: rate_limit_tracking
-- Purpose: Track API rate limiting per user/IP
-- Status: UNCHANGED from V1 (NOW WILL BE USED)
-- =====================================================
CREATE TABLE rate_limit_tracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Identifier
    identifier VARCHAR(255) NOT NULL,
    identifier_type ENUM('user_id', 'ip_address', 'email') NOT NULL,

    -- Endpoint
    endpoint VARCHAR(255) NOT NULL,

    -- Tracking
    request_count INT UNSIGNED DEFAULT 1,
    window_start DATETIME NOT NULL,
    window_end DATETIME NOT NULL,

    -- Status
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until DATETIME DEFAULT NULL,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_identifier (identifier, identifier_type),
    INDEX idx_endpoint (endpoint),
    INDEX idx_window_end (window_end),
    INDEX idx_is_blocked (is_blocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default admin user
-- Password: Admin@123456 (CHANGE THIS IMMEDIATELY!)
-- Password hash generated using bcrypt with 10 rounds
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    email_verified,
    role,
    account_status,
    kyc_status
) VALUES (
    'admin@cdxplatform.com',
    '$2b$10$rQ5xLdKWMZxJY1QVJzKq1.YJ4qH2yH7Y7gVN8vZPxDJHqGwLj4EQO',
    'Admin',
    'User',
    TRUE,
    'ADMIN',
    'active',
    'approved'
);

-- Insert default CDX token
INSERT INTO tokens (
    token_name,
    token_symbol,
    token_address,
    blockchain,
    price_per_token,
    currency,
    min_purchase_amount,
    max_purchase_amount,
    min_token_amount,
    max_token_amount,
    daily_purchase_limit,
    is_active,
    display_order,
    description,
    created_by
) VALUES (
    'CDX Token',
    'CDX',
    'FADm6hA3z5hYHdajao4LDEjQATLh2WvTmMjWUjTmut9',
    'Solana',
    0.100000,           -- $0.10 per token
    'USD',
    10.00,              -- Minimum $10 purchase
    10000.00,           -- Maximum $10,000 purchase
    100,                -- Minimum 100 tokens
    100000,             -- Maximum 100,000 tokens
    5000.00,            -- Daily limit $5,000 per user
    TRUE,
    1,
    'CDX is the primary token of the CDX Platform ecosystem.',
    1                   -- Created by admin user
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: User purchase summary (UPDATED for multi-token)
CREATE OR REPLACE VIEW user_purchase_summary AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(t.id) AS total_purchases,
    SUM(t.usd_amount) AS total_spent,
    SUM(t.token_amount) AS total_tokens_purchased,
    MAX(t.created_at) AS last_purchase_date,
    u.created_at AS member_since
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
    AND t.payment_status = 'succeeded'
    AND t.fulfillment_status = 'completed'
GROUP BY u.id;

-- View: Daily transaction summary (UPDATED)
CREATE OR REPLACE VIEW daily_transaction_summary AS
SELECT
    DATE(created_at) AS transaction_date,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN payment_status = 'succeeded' THEN 1 ELSE 0 END) AS successful_payments,
    SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) AS failed_payments,
    SUM(CASE WHEN fulfillment_status = 'completed' THEN 1 ELSE 0 END) AS fulfilled_orders,
    SUM(CASE WHEN fulfillment_status = 'pending' THEN 1 ELSE 0 END) AS pending_fulfillment,
    SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) AS total_tokens_fulfilled,
    AVG(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE NULL END) AS avg_transaction_value
FROM transactions
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

-- View: Active users (logged in within last 30 days)
CREATE OR REPLACE VIEW active_users AS
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.last_login_at,
    u.account_status,
    COUNT(t.id) AS total_purchases,
    SUM(t.usd_amount) AS total_spent
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
    AND t.payment_status = 'succeeded'
    AND t.fulfillment_status = 'completed'
WHERE u.last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id;

-- View: Pending fulfillments (NEW)
CREATE OR REPLACE VIEW pending_fulfillments AS
SELECT
    t.id,
    t.transaction_uuid,
    t.user_id,
    u.email,
    u.first_name,
    u.last_name,
    t.token_id,
    tok.token_name,
    tok.token_symbol,
    tok.blockchain,
    t.usd_amount,
    t.token_amount,
    t.recipient_wallet_address,
    t.created_at,
    TIMESTAMPDIFF(HOUR, t.created_at, NOW()) AS hours_pending
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN tokens tok ON t.token_id = tok.id
WHERE t.payment_status = 'succeeded'
  AND t.fulfillment_status = 'pending'
ORDER BY t.created_at ASC;

-- View: Token sales summary (NEW)
CREATE OR REPLACE VIEW token_sales_summary AS
SELECT
    tok.id AS token_id,
    tok.token_name,
    tok.token_symbol,
    tok.blockchain,
    tok.price_per_token,
    COUNT(t.id) AS total_sales,
    SUM(t.usd_amount) AS total_revenue,
    SUM(t.token_amount) AS total_tokens_sold,
    AVG(t.usd_amount) AS avg_sale_amount,
    MAX(t.created_at) AS last_sale_date
FROM tokens tok
LEFT JOIN transactions t ON tok.id = t.token_id
    AND t.payment_status = 'succeeded'
    AND t.fulfillment_status = 'completed'
GROUP BY tok.id;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure: Get user statistics (UPDATED)
DELIMITER //
CREATE PROCEDURE GetUserStatistics(IN userId BIGINT)
BEGIN
    SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.created_at,
        u.last_login_at,
        COUNT(t.id) AS total_transactions,
        SUM(CASE WHEN t.payment_status = 'succeeded' THEN t.usd_amount ELSE 0 END) AS total_spent,
        SUM(CASE WHEN t.fulfillment_status = 'completed' THEN t.token_amount ELSE 0 END) AS total_tokens_received,
        SUM(CASE WHEN t.fulfillment_status = 'pending' THEN 1 ELSE 0 END) AS pending_fulfillments,
        MAX(t.created_at) AS last_purchase_date
    FROM users u
    LEFT JOIN transactions t ON u.id = t.user_id
    WHERE u.id = userId
    GROUP BY u.id;
END //
DELIMITER ;

-- Procedure: Get daily transaction summary (UPDATED)
DELIMITER //
CREATE PROCEDURE GetDailyTransactionSummary(IN summaryDate DATE)
BEGIN
    SELECT
        DATE(created_at) AS transaction_date,
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN payment_status = 'succeeded' THEN 1 ELSE 0 END) AS successful_payments,
        SUM(CASE WHEN fulfillment_status = 'completed' THEN 1 ELSE 0 END) AS fulfilled_orders,
        SUM(CASE WHEN payment_status = 'succeeded' THEN usd_amount ELSE 0 END) AS total_revenue,
        SUM(CASE WHEN fulfillment_status = 'completed' THEN token_amount ELSE 0 END) AS total_tokens_fulfilled
    FROM transactions
    WHERE DATE(created_at) = summaryDate;
END //
DELIMITER ;

-- Procedure: Get pending fulfillments count (NEW)
DELIMITER //
CREATE PROCEDURE GetPendingFulfillmentsCount()
BEGIN
    SELECT
        COUNT(*) AS pending_count,
        SUM(usd_amount) AS pending_value,
        MIN(created_at) AS oldest_pending
    FROM transactions
    WHERE payment_status = 'succeeded'
      AND fulfillment_status = 'pending';
END //
DELIMITER ;

-- Procedure: Get token performance (NEW)
DELIMITER //
CREATE PROCEDURE GetTokenPerformance(IN tokenId BIGINT)
BEGIN
    SELECT
        tok.token_name,
        tok.token_symbol,
        COUNT(t.id) AS total_orders,
        SUM(CASE WHEN t.payment_status = 'succeeded' THEN 1 ELSE 0 END) AS successful_payments,
        SUM(CASE WHEN t.fulfillment_status = 'completed' THEN 1 ELSE 0 END) AS fulfilled_orders,
        SUM(CASE WHEN t.fulfillment_status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(t.usd_amount) AS total_revenue,
        SUM(t.token_amount) AS total_tokens_sold,
        AVG(t.usd_amount) AS avg_order_value,
        MIN(t.created_at) AS first_sale,
        MAX(t.created_at) AS last_sale
    FROM tokens tok
    LEFT JOIN transactions t ON tok.id = t.token_id
    WHERE tok.id = tokenId
    GROUP BY tok.id;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Auto-update completed_at when fulfillment is completed
DELIMITER //
CREATE TRIGGER before_transaction_fulfillment_update
BEFORE UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.fulfillment_status = 'completed' AND OLD.fulfillment_status != 'completed' THEN
        SET NEW.completed_at = NOW();
    END IF;
END //
DELIMITER ;

-- =====================================================
-- DATABASE INFORMATION
-- =====================================================

SELECT 'Database created successfully!' AS status;
SELECT 'Default admin user created: admin@cdxplatform.com (Password: Admin@123456)' AS info;
SELECT 'Default CDX token added to tokens table' AS info;
SELECT 'Version: 2.0 - Manual Fulfillment System' AS version;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'cdx_platform';

-- Show all tables
SHOW TABLES;
