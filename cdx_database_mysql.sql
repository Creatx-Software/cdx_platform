-- =====================================================
-- CDX TOKEN PURCHASE PLATFORM - MySQL Database Schema
-- =====================================================
-- Version: 1.0
-- Database: MySQL 8.0+
-- Description: Complete database structure for CDX token purchase platform
-- =====================================================

-- Drop existing database if exists (WARNING: This will delete all data!)
-- Uncomment the lines below if you want to start fresh
-- DROP DATABASE IF EXISTS cdx_platform;

-- Create database
CREATE DATABASE IF NOT EXISTS cdx_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE cdx_platform;

-- =====================================================
-- TABLE: users
-- Purpose: Store all user account information
-- =====================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Information
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- Wallet Information
    solana_wallet_address VARCHAR(44) DEFAULT NULL,
    
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
-- TABLE: token_configuration
-- Purpose: Store dynamic token pricing and purchase limits
-- =====================================================
CREATE TABLE token_configuration (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Pricing
    price_per_token DECIMAL(10, 6) NOT NULL DEFAULT 0.100000,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Purchase Limits
    min_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    max_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 10000.00,
    min_token_amount INT UNSIGNED NOT NULL DEFAULT 100,
    max_token_amount INT UNSIGNED NOT NULL DEFAULT 100000,
    
    -- Daily Limits
    daily_purchase_limit_per_user DECIMAL(10, 2) DEFAULT 5000.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: transactions
-- Purpose: Store all token purchase transactions
-- =====================================================
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- User Reference
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Transaction Details
    transaction_uuid VARCHAR(36) NOT NULL UNIQUE,
    
    -- Financial Information
    amount_usd DECIMAL(10, 2) NOT NULL,
    token_amount INT UNSIGNED NOT NULL,
    token_price_at_purchase DECIMAL(10, 6) NOT NULL,
    
    -- Payment Information (Stripe)
    stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
    stripe_payment_method VARCHAR(50) DEFAULT NULL,
    stripe_customer_id VARCHAR(255) DEFAULT NULL,
    
    -- Blockchain Information (Solana)
    solana_transaction_signature VARCHAR(88) DEFAULT NULL,
    recipient_wallet_address VARCHAR(44) NOT NULL,
    blockchain_status ENUM('pending', 'processing', 'confirmed', 'failed') DEFAULT 'pending',
    blockchain_confirmations INT UNSIGNED DEFAULT 0,
    
    -- Transaction Status
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    
    -- Error Handling
    error_message TEXT DEFAULT NULL,
    retry_count INT UNSIGNED DEFAULT 0,
    
    -- Refund Information
    refunded_at DATETIME DEFAULT NULL,
    refund_reason TEXT DEFAULT NULL,
    refund_amount DECIMAL(10, 2) DEFAULT NULL,
    stripe_refund_id VARCHAR(255) DEFAULT NULL,
    
    -- Metadata
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_blockchain_status (blockchain_status),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_solana_signature (solana_transaction_signature),
    INDEX idx_created_at (created_at),
    INDEX idx_completed_at (completed_at),
    INDEX idx_transaction_uuid (transaction_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: webhook_logs
-- Purpose: Log all incoming webhooks from Stripe
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
        'token_price_update',
        'transaction_refund',
        'system_config_change',
        'other'
    ) NOT NULL,
    
    -- Target Information
    target_type VARCHAR(50) DEFAULT NULL,
    target_id BIGINT UNSIGNED DEFAULT NULL,
    
    -- Action Details
    description TEXT NOT NULL,
    changes JSON DEFAULT NULL,
    
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
    
    INDEX idx_identifier (identifier, identifier_type),
    INDEX idx_window_end (window_end),
    INDEX idx_is_blocked (is_blocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default token configuration
INSERT INTO token_configuration (
    price_per_token,
    currency,
    min_purchase_amount,
    max_purchase_amount,
    min_token_amount,
    max_token_amount,
    daily_purchase_limit_per_user,
    is_active
) VALUES (
    0.100000,           -- $0.10 per token
    'USD',
    10.00,              -- Minimum $10 purchase
    10000.00,           -- Maximum $10,000 purchase
    100,                -- Minimum 100 tokens
    100000,             -- Maximum 100,000 tokens
    5000.00,            -- Daily limit $5,000 per user
    TRUE
);

-- Create default admin user
-- Password: Admin@123456 (CHANGE THIS IMMEDIATELY IN PRODUCTION!)
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

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: User purchase summary
CREATE OR REPLACE VIEW user_purchase_summary AS
SELECT 
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(t.id) AS total_purchases,
    SUM(t.amount_usd) AS total_spent,
    SUM(t.token_amount) AS total_tokens_purchased,
    MAX(t.created_at) AS last_purchase_date,
    u.created_at AS member_since
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
GROUP BY u.id;

-- View: Daily transaction summary
CREATE OR REPLACE VIEW daily_transaction_summary AS
SELECT 
    DATE(created_at) AS transaction_date,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS successful_transactions,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_transactions,
    SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded_transactions,
    SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) AS total_tokens_sold,
    AVG(CASE WHEN status = 'completed' THEN amount_usd ELSE NULL END) AS avg_transaction_value
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
    SUM(t.amount_usd) AS total_spent
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
WHERE u.last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure: Get user statistics
DELIMITER //
CREATE PROCEDURE GetUserStatistics(IN userId BIGINT)
BEGIN
    SELECT 
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS successful_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) AS total_spent,
        SUM(CASE WHEN status = 'completed' THEN token_amount ELSE 0 END) AS total_tokens,
        AVG(CASE WHEN status = 'completed' THEN amount_usd ELSE NULL END) AS avg_transaction,
        MAX(CASE WHEN status = 'completed' THEN created_at ELSE NULL END) AS last_purchase
    FROM transactions
    WHERE user_id = userId;
END //
DELIMITER ;

-- Procedure: Get daily revenue report
DELIMITER //
CREATE PROCEDURE GetDailyRevenueReport(IN days INT)
BEGIN
    SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS transactions,
        SUM(amount_usd) AS revenue,
        SUM(token_amount) AS tokens_sold
    FROM transactions
    WHERE status = 'completed'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL days DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END //
DELIMITER ;

-- Procedure: Check daily purchase limit
DELIMITER //
CREATE PROCEDURE CheckDailyPurchaseLimit(
    IN userId BIGINT,
    IN purchaseAmount DECIMAL(10,2),
    OUT canPurchase BOOLEAN,
    OUT remainingLimit DECIMAL(10,2)
)
BEGIN
    DECLARE todaySpent DECIMAL(10,2);
    DECLARE dailyLimit DECIMAL(10,2);
    
    -- Get daily limit from configuration
    SELECT daily_purchase_limit_per_user INTO dailyLimit
    FROM token_configuration
    WHERE is_active = TRUE
    LIMIT 1;
    
    -- Calculate today's spending
    SELECT COALESCE(SUM(amount_usd), 0) INTO todaySpent
    FROM transactions
    WHERE user_id = userId
        AND DATE(created_at) = CURDATE()
        AND status IN ('completed', 'processing');
    
    -- Calculate remaining limit
    SET remainingLimit = dailyLimit - todaySpent;
    
    -- Check if purchase is allowed
    IF (todaySpent + purchaseAmount) <= dailyLimit THEN
        SET canPurchase = TRUE;
    ELSE
        SET canPurchase = FALSE;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update system statistics after transaction
DELIMITER //
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    -- Update or create today's statistics
    INSERT INTO system_statistics (
        stat_date,
        transactions_today,
        successful_transactions_today,
        revenue_today,
        tokens_sold_today
    ) VALUES (
        CURDATE(),
        1,
        IF(NEW.status = 'completed', 1, 0),
        IF(NEW.status = 'completed', NEW.amount_usd, 0),
        IF(NEW.status = 'completed', NEW.token_amount, 0)
    )
    ON DUPLICATE KEY UPDATE
        transactions_today = transactions_today + 1,
        successful_transactions_today = successful_transactions_today + IF(NEW.status = 'completed', 1, 0),
        revenue_today = revenue_today + IF(NEW.status = 'completed', NEW.amount_usd, 0),
        tokens_sold_today = tokens_sold_today + IF(NEW.status = 'completed', NEW.token_amount, 0);
END //
DELIMITER ;

-- Trigger: Update statistics when transaction status changes
DELIMITER //
CREATE TRIGGER after_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status AND NEW.status = 'completed' THEN
        -- Update today's statistics
        INSERT INTO system_statistics (
            stat_date,
            successful_transactions_today,
            revenue_today,
            tokens_sold_today
        ) VALUES (
            CURDATE(),
            1,
            NEW.amount_usd,
            NEW.token_amount
        )
        ON DUPLICATE KEY UPDATE
            successful_transactions_today = successful_transactions_today + 1,
            revenue_today = revenue_today + NEW.amount_usd,
            tokens_sold_today = tokens_sold_today + NEW.token_amount;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_user_created_verified ON users(created_at, email_verified);
CREATE INDEX idx_transaction_user_status ON transactions(user_id, status, created_at);
CREATE INDEX idx_transaction_date_status ON transactions(created_at, status);

-- =====================================================
-- SECURITY & MAINTENANCE
-- =====================================================

-- Create a read-only user for reporting (Optional)
-- CREATE USER 'cdx_readonly'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT ON cdx_platform.* TO 'cdx_readonly'@'localhost';

-- Create application user with full access (Use this in your app)
-- CREATE USER 'cdx_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT ALL PRIVILEGES ON cdx_platform.* TO 'cdx_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- =====================================================

-- Check database size
-- SELECT 
--     table_schema AS 'Database',
--     ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
-- FROM information_schema.tables
-- WHERE table_schema = 'cdx_platform'
-- GROUP BY table_schema;

-- List all tables with row counts
-- SELECT 
--     table_name,
--     table_rows
-- FROM information_schema.tables
-- WHERE table_schema = 'cdx_platform'
-- ORDER BY table_rows DESC;

-- =====================================================
-- BACKUP REMINDER
-- =====================================================
-- Always backup your database before making changes!
-- mysqldump -u root -p cdx_platform > backup_$(date +%Y%m%d).sql
-- =====================================================

-- =====================================================
-- DATABASE SETUP COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Review the default admin credentials and change password
-- 2. Update token_configuration with your actual pricing
-- 3. Create application database user with appropriate permissions
-- 4. Test all stored procedures and triggers
-- 5. Set up regular backup schedule
-- =====================================================

SELECT '✅ CDX Platform Database Created Successfully!' AS Status;
SELECT 'Default Admin Email: admin@cdxplatform.com' AS Info;
SELECT 'Default Admin Password: Admin@123456 (CHANGE IMMEDIATELY!)' AS Warning;
SELECT CONCAT('Total Tables Created: ', COUNT(*)) AS TableCount 
FROM information_schema.tables 
WHERE table_schema = 'cdx_platform';
