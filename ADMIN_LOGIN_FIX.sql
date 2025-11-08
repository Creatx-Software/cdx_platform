-- =====================================================
-- CDX PLATFORM - ADMIN LOGIN FIX
-- =====================================================
-- This script fixes the admin login issue by:
-- 1. Ensuring admin email is verified
-- 2. Ensuring admin account is active
-- 3. Adding initial CDX token if missing
-- =====================================================

USE cdx_platform;

-- Fix 1: Verify admin email and ensure active status
UPDATE users
SET email_verified = TRUE,
    email_verification_token = NULL,
    email_verification_expires = NULL,
    account_status = 'active',
    kyc_status = 'approved'
WHERE email = 'admin@cdxplatform.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, email_verified, account_status, kyc_status
FROM users
WHERE email = 'admin@cdxplatform.com';

-- Fix 2: Ensure CDX token exists
INSERT IGNORE INTO tokens (
    id,
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
    1,
    'CDX Token',
    'CDX',
    'FADm6hA3z5hYHdajao4LDEjQATLh2WvTmMjWUjTmut9',
    'Solana',
    0.100000,
    'USD',
    10.00,
    10000.00,
    100,
    100000,
    5000.00,
    TRUE,
    1,
    'CDX is the primary token of the CDX Platform ecosystem.',
    1
);

-- Verify token exists
SELECT * FROM tokens WHERE token_symbol = 'CDX';

-- Display results
SELECT 'Admin login fix completed!' AS Status;
SELECT 'Admin user email verified: TRUE' AS Result;
SELECT 'CDX token ensured in database' AS Result;
