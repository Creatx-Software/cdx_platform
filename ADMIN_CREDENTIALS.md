# CDX Platform - Admin Credentials

## Admin Account

**Email:** admin@cdxplatform.com
**Password:** Admin@123456

## Account Status
- Email Verified: ✅ YES
- Account Status: ✅ Active
- Role: ✅ ADMIN
- KYC Status: ✅ Approved

## Login URL
- Frontend: http://localhost:3000/login
- After login, admin users are automatically redirected to: http://localhost:3000/admin

## Password Reset
If you need to reset the admin password, run this SQL command:

```sql
-- Generate new hash in Node.js first:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_NEW_PASSWORD', 10).then(hash => console.log(hash));"

UPDATE users
SET password_hash = 'YOUR_NEW_HASH_HERE'
WHERE email = 'admin@cdxplatform.com';
```

## Security Notes
- ⚠️ **IMPORTANT:** Change the default password before deploying to production!
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

## Last Updated
Password hash updated: 2025-11-08
