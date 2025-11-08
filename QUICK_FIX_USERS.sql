-- =====================================================
-- QUICK FIX: Verify All Unverified Users
-- =====================================================
USE cdx_platform;

-- Show current status
SELECT '=== BEFORE FIX ===' AS status;
SELECT email, email_verified, account_status, role FROM users;

-- Fix kdilhan50@gmail.com
UPDATE users
SET email_verified = TRUE,
    email_verification_token = NULL,
    email_verification_expires = NULL,
    account_status = 'active'
WHERE email = 'kdilhan50@gmail.com';

-- Fix admin@cdxplatform.com
UPDATE users
SET email_verified = TRUE,
    email_verification_token = NULL,
    email_verification_expires = NULL,
    account_status = 'active',
    kyc_status = 'approved'
WHERE email = 'admin@cdxplatform.com';

-- Show results
SELECT '=== AFTER FIX ===' AS status;
SELECT email, email_verified, account_status, role FROM users;

SELECT '✅ Done! Both users can now login.' AS result;
