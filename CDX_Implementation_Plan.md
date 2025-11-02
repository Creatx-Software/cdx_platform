# CDX Token Purchase Platform - Complete Implementation Plan

## 📋 Overview

This is your step-by-step guide to building the entire CDX platform from scratch to deployment. Follow each phase in order, completing all tasks before moving to the next phase.

**Total Timeline:** 8-10 weeks (working 20-30 hours per week)

---

## 🎯 Implementation Phases

```
Phase 1: Project Setup & Environment (Week 1)
Phase 2: Database & Backend Foundation (Week 2)
Phase 3: User Authentication System (Week 3)
Phase 4: Payment Integration (Week 4)
Phase 5: Blockchain Integration (Week 5)
Phase 6: Complete User Flow (Week 6)
Phase 7: Admin Dashboard (Week 7)
Phase 8: Testing & Deployment (Week 8)
```

---

# PHASE 1: PROJECT SETUP & ENVIRONMENT (Week 1)

## 🎯 Goal
Set up your development environment and create the basic project structure.

## ✅ Tasks

### 1.1 Install Required Software

**Development Tools:**
- [ ] Install Node.js (v18 or higher)
  - Download from nodejs.org
  - Verify: `node --version` and `npm --version`
- [ ] Install MySQL (v8.0 or higher)
  - MySQL Community Server
  - MySQL Workbench (GUI tool)
  - Verify: `mysql --version`
- [ ] Install Git
  - For version control
  - Verify: `git --version`
- [ ] Install VS Code or your preferred code editor
  - Extensions: ESLint, Prettier, MySQL

**Optional but Recommended:**
- [ ] Install Postman (for API testing)
- [ ] Install TablePlus or DBeaver (alternative database GUI)

### 1.2 Create Accounts for External Services

**Stripe (Payment Processing):**
- [ ] Sign up at stripe.com
- [ ] Verify your email
- [ ] Enable test mode
- [ ] Get your API keys:
  - Publishable key (starts with pk_test_)
  - Secret key (starts with sk_test_)
- [ ] Note: Keep in test mode until ready for production

**Solana (Blockchain):**
- [ ] Install Solana CLI (for devnet testing)
  - Follow: docs.solana.com/cli/install-solana-cli-tools
- [ ] Create a devnet wallet (test wallet)
  - Command: `solana-keygen new --outfile ~/cdx-treasury.json`
  - Save the public key (wallet address)
  - **IMPORTANT:** Back up the private key file securely
- [ ] Get devnet SOL (fake SOL for testing)
  - Command: `solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet`
- [ ] Install Phantom Wallet (browser extension)
  - For testing user wallet connections
  - Switch to Devnet in settings

**Email Service (Choose One):**
- [ ] Option 1: SendGrid (Recommended - Free tier: 100 emails/day)
  - Sign up at sendgrid.com
  - Verify sender identity
  - Get API key
- [ ] Option 2: AWS SES (More setup but cheaper at scale)
- [ ] Option 3: Nodemailer with Gmail (Quick testing only)

### 1.3 Set Up Git Repository

**Initialize Repository:**
- [ ] Create a GitHub account (if you don't have one)
- [ ] Create a new repository: "cdx-platform"
- [ ] Set to private (contains sensitive data)
- [ ] Clone to your local machine
  ```bash
  git clone https://github.com/YOUR_USERNAME/cdx-platform.git
  cd cdx-platform
  ```

**Create .gitignore:**
- [ ] Create root `.gitignore` file
- [ ] Add common ignore patterns:
  - `node_modules/`
  - `.env`
  - `*.log`
  - `.DS_Store`
  - `dist/`
  - `build/`

### 1.4 Create Project Structure

**Create Directory Structure:**
- [ ] Create all folders from the project structure document
  ```bash
  mkdir -p backend/src/{config,models,controllers,routes,middleware,services,utils,templates}
  mkdir -p frontend/src/{components/{common,auth,user,payment,admin},pages,services,context,hooks,utils,styles}
  mkdir -p frontend/public/assets/{images,icons}
  mkdir -p database/{migrations,seeds}
  mkdir -p docs scripts
  ```

**Create README Files:**
- [ ] Create root `README.md` - Project overview
- [ ] Create `backend/README.md` - Backend documentation
- [ ] Create `frontend/README.md` - Frontend documentation

### 1.5 Initialize Backend Project

**Navigate to Backend:**
```bash
cd backend
```

**Initialize Node.js Project:**
- [ ] Run `npm init -y`
- [ ] Update package.json with proper details (name, description, author)

**Install Core Dependencies:**
- [ ] Install production dependencies:
  ```bash
  npm install express mysql2 bcryptjs jsonwebtoken cors helmet express-rate-limit dotenv uuid validator
  ```
- [ ] Install Stripe:
  ```bash
  npm install stripe
  ```
- [ ] Install Solana:
  ```bash
  npm install @solana/web3.js @solana/spl-token
  ```
- [ ] Install email service:
  ```bash
  npm install nodemailer
  ```

**Install Development Dependencies:**
- [ ] Install dev tools:
  ```bash
  npm install --save-dev nodemon
  ```

**Configure package.json Scripts:**
- [ ] Add scripts:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"No tests yet\""
  }
  ```

### 1.6 Initialize Frontend Project

**Navigate to Frontend:**
```bash
cd ../frontend
```

**Create React App:**
- [ ] Run: `npx create-react-app .`
- [ ] Wait for installation to complete

**Install Frontend Dependencies:**
- [ ] Install routing:
  ```bash
  npm install react-router-dom
  ```
- [ ] Install HTTP client:
  ```bash
  npm install axios
  ```
- [ ] Install Stripe:
  ```bash
  npm install @stripe/react-stripe-js @stripe/stripe-js
  ```
- [ ] Install Solana wallet adapters:
  ```bash
  npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base
  ```
- [ ] Install Tailwind CSS:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

### 1.7 Set Up Database

**Create Database:**
- [ ] Open MySQL Workbench
- [ ] Connect to your MySQL server
- [ ] Run the CDX database script (from Phase 0)
- [ ] Verify all tables were created
- [ ] Check that default admin user exists
- [ ] Check that token_configuration has default values

**Test Database Connection:**
- [ ] Try to connect from MySQL CLI
- [ ] Run a simple query: `SELECT * FROM users;`
- [ ] Verify you see the admin user

### 1.8 Create Environment Files

**Backend .env File:**
- [ ] Create `backend/.env`
- [ ] Add all configuration:
  ```
  NODE_ENV=development
  PORT=5000
  
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=cdx_platform
  DB_PORT=3306
  
  JWT_SECRET=your_random_secret_key_min_32_chars
  JWT_EXPIRES_IN=7d
  
  STRIPE_SECRET_KEY=sk_test_your_key
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
  
  SOLANA_RPC_URL=https://api.devnet.solana.com
  SOLANA_NETWORK=devnet
  SOLANA_TREASURY_PRIVATE_KEY=[your,private,key,array]
  CDX_TOKEN_MINT_ADDRESS=your_token_mint_address
  
  EMAIL_SERVICE=sendgrid
  EMAIL_API_KEY=your_email_api_key
  EMAIL_FROM=noreply@cdxplatform.com
  EMAIL_FROM_NAME=CDX Platform
  
  FRONTEND_URL=http://localhost:3000
  
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=100
  ```

**Frontend .env File:**
- [ ] Create `frontend/.env`
- [ ] Add configuration:
  ```
  REACT_APP_API_URL=http://localhost:5000/api
  REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_key
  REACT_APP_SOLANA_NETWORK=devnet
  ```

**Create .env.example Files:**
- [ ] Copy `.env` to `.env.example` in both folders
- [ ] Replace actual values with placeholders
- [ ] Commit `.env.example` to git (NOT `.env`)

### 1.9 Create Basic Server Files

**Backend Entry Point:**
- [ ] Create `backend/server.js` (minimal server start)
- [ ] Create `backend/src/app.js` (Express app setup)
- [ ] Test server starts: `npm run dev`
- [ ] Should see: "Server running on port 5000"

**Frontend Entry Point:**
- [ ] Test React app starts: `npm start`
- [ ] Should open browser to localhost:3000
- [ ] Should see React logo

### 1.10 Test Everything Works

**Verification Checklist:**
- [ ] MySQL is running and accessible
- [ ] CDX database exists with all tables
- [ ] Backend server starts without errors
- [ ] Frontend React app starts without errors
- [ ] Can access both in browser
- [ ] Git repository is initialized
- [ ] All dependencies installed successfully

## 📝 Deliverables for Phase 1

- ✅ Complete project structure created
- ✅ All development tools installed
- ✅ Database created and populated
- ✅ Backend and frontend projects initialized
- ✅ All accounts created (Stripe, Solana, Email)
- ✅ Environment files configured
- ✅ Git repository set up
- ✅ Both servers can start successfully

## ⚠️ Common Issues & Solutions

**MySQL Connection Error:**
- Check MySQL is running: `mysql.server status` (Mac) or Services (Windows)
- Verify credentials in .env match your MySQL user
- Try: `mysql -u root -p` to test manual connection

**Port Already in Use:**
- Backend: Change PORT in .env to 5001 or 5002
- Frontend: Will auto-increment to 3001 if 3000 is taken

**Solana CLI Not Found:**
- Add Solana to PATH
- Restart terminal after installation
- Try: `solana --version`

**Node Version Issues:**
- Use Node v18 or higher
- Check: `node --version`
- Use nvm to manage versions if needed

---

# PHASE 2: DATABASE & BACKEND FOUNDATION (Week 2)

## 🎯 Goal
Build the database connection layer and core utilities that everything else will depend on.

## ✅ Tasks

### 2.1 Database Connection Setup

**Create Database Configuration:**
- [ ] Create `backend/src/config/database.js`
- [ ] Set up MySQL connection pool
- [ ] Add connection error handling
- [ ] Add retry logic for failed connections
- [ ] Export connection pool

**Test Database Connection:**
- [ ] Create test endpoint to verify database connection
- [ ] Test with Postman: `GET /api/test/database`
- [ ] Should return success message and connection status

**Create Database Utilities:**
- [ ] Create helper for running queries
- [ ] Create helper for transactions
- [ ] Add query error logging

### 2.2 Core Utilities

**Password Hashing (bcrypt):**
- [ ] Create `backend/src/utils/bcrypt.js`
- [ ] Function: `hashPassword(password)` - Returns hashed password
- [ ] Function: `comparePassword(password, hash)` - Returns boolean
- [ ] Set salt rounds to 10

**JWT Token Management:**
- [ ] Create `backend/src/utils/jwt.js`
- [ ] Function: `generateToken(payload)` - Creates JWT
- [ ] Function: `verifyToken(token)` - Verifies and decodes JWT
- [ ] Function: `generateRefreshToken(payload)` - Long-lived token
- [ ] Use JWT_SECRET from environment

**Validation Helpers:**
- [ ] Create `backend/src/utils/validators.js`
- [ ] Function: `validateEmail(email)` - Returns boolean
- [ ] Function: `validatePassword(password)` - Checks strength (min 8 chars, 1 uppercase, 1 number)
- [ ] Function: `validateSolanaAddress(address)` - Validates wallet address format
- [ ] Function: `validateAmount(amount)` - Checks if valid number and positive

**Logger Utility:**
- [ ] Create `backend/src/utils/logger.js`
- [ ] Set up console logging with timestamps
- [ ] Add log levels: info, warn, error, debug
- [ ] Format: `[TIMESTAMP] [LEVEL] Message`

**General Helpers:**
- [ ] Create `backend/src/utils/helpers.js`
- [ ] Function: `generateUUID()` - Creates unique IDs
- [ ] Function: `generateVerificationToken()` - Random token for email verification
- [ ] Function: `formatCurrency(amount)` - Formats numbers as currency
- [ ] Function: `calculateTokenAmount(usdAmount, tokenPrice)` - Token calculation

### 2.3 Middleware Setup

**Error Handler:**
- [ ] Create `backend/src/middleware/errorHandler.js`
- [ ] Catch all errors from routes/controllers
- [ ] Format error responses consistently
- [ ] Log errors to console
- [ ] Don't expose sensitive info in production

**Rate Limiter:**
- [ ] Create `backend/src/middleware/rateLimiter.js`
- [ ] Configure: 100 requests per 15 minutes
- [ ] Apply to all routes
- [ ] Return 429 status when limit exceeded

**CORS Configuration:**
- [ ] Set up in `backend/src/app.js`
- [ ] Allow frontend origin (localhost:3000 for development)
- [ ] Allow credentials
- [ ] Allow specific headers

**Helmet Security:**
- [ ] Configure Helmet.js in `backend/src/app.js`
- [ ] Set security headers
- [ ] Configure CSP (Content Security Policy)

**Request Logger:**
- [ ] Log all incoming requests
- [ ] Format: `[METHOD] [URL] [IP] [TIMESTAMP]`
- [ ] Log response status and time taken

### 2.4 User Model

**Create User Model:**
- [ ] Create `backend/src/models/User.js`
- [ ] Function: `createUser(userData)` - Insert new user
  - Hash password before saving
  - Generate email verification token
  - Set default values
  - Return user ID
- [ ] Function: `findUserByEmail(email)` - Find user by email
- [ ] Function: `findUserById(id)` - Find user by ID
- [ ] Function: `updateUser(id, updates)` - Update user data
- [ ] Function: `verifyUserEmail(token)` - Mark email as verified
- [ ] Function: `updatePassword(userId, newPassword)` - Update password
- [ ] Function: `setPasswordResetToken(email)` - Generate reset token
- [ ] Function: `resetPassword(token, newPassword)` - Reset with token
- [ ] Function: `updateWalletAddress(userId, address)` - Save Solana wallet
- [ ] Function: `updateLastLogin(userId, ip)` - Update login timestamp

**Test User Model:**
- [ ] Create a test script
- [ ] Test creating a user
- [ ] Test finding user by email
- [ ] Test updating user
- [ ] Verify database entries

### 2.5 Token Configuration Model

**Create TokenConfig Model:**
- [ ] Create `backend/src/models/TokenConfig.js`
- [ ] Function: `getActiveConfig()` - Get current token pricing
- [ ] Function: `updateConfig(adminId, updates)` - Update pricing
- [ ] Function: `createConfigHistory(changes)` - Log price changes

**Test TokenConfig Model:**
- [ ] Test retrieving current config
- [ ] Should return default values from database

### 2.6 Models Index File

**Create Model Exports:**
- [ ] Create `backend/src/models/index.js`
- [ ] Import all models
- [ ] Export as object: `{ User, TokenConfig, Transaction }`
- [ ] Makes imports cleaner in controllers

### 2.7 Basic API Structure

**Set Up Express App:**
- [ ] Configure `backend/src/app.js`
- [ ] Add JSON body parser
- [ ] Add URL-encoded parser
- [ ] Add CORS middleware
- [ ] Add Helmet middleware
- [ ] Add rate limiter
- [ ] Add request logger
- [ ] Add error handler (last middleware)

**Create Health Check Endpoint:**
- [ ] Route: `GET /api/health`
- [ ] Returns: `{ status: "ok", timestamp: Date.now() }`
- [ ] No authentication required

**Create Test Endpoints:**
- [ ] Route: `GET /api/test/database` - Test DB connection
- [ ] Route: `GET /api/test/env` - Test environment variables loaded
- [ ] These will be removed in production

### 2.8 Configuration Files

**Stripe Configuration:**
- [ ] Create `backend/src/config/stripe.js`
- [ ] Initialize Stripe with secret key
- [ ] Export Stripe instance
- [ ] Add error handling for missing API key

**Solana Configuration:**
- [ ] Create `backend/src/config/solana.js`
- [ ] Set up Solana connection (devnet)
- [ ] Load treasury wallet keypair
- [ ] Export connection and wallet objects
- [ ] Add error handling

**Email Configuration:**
- [ ] Create `backend/src/config/email.js`
- [ ] Configure your email service (SendGrid/SES/etc)
- [ ] Set up transporter/client
- [ ] Export configured client

## 📝 Deliverables for Phase 2

- ✅ Database connection working
- ✅ All utility functions created and tested
- ✅ All middleware configured
- ✅ User model complete with all CRUD operations
- ✅ Token config model complete
- ✅ Basic API structure with health checks
- ✅ All configuration files set up
- ✅ Error handling working

## 🧪 Testing Checklist

- [ ] Health check endpoint returns 200
- [ ] Database test endpoint works
- [ ] Can create a user in database via model
- [ ] Can find user by email
- [ ] Password hashing works
- [ ] JWT generation and verification works
- [ ] Email validation works
- [ ] Solana address validation works
- [ ] Rate limiter blocks after limit exceeded
- [ ] Error handler catches and formats errors

---

# PHASE 3: USER AUTHENTICATION SYSTEM (Week 3)

## 🎯 Goal
Build complete user registration, login, email verification, and password reset functionality.

## ✅ Tasks

### 3.1 Auth Controller - Registration

**Create Auth Controller:**
- [ ] Create `backend/src/controllers/authController.js`

**Build Register Function:**
- [ ] Function: `register(req, res)`
- [ ] Extract: email, password, firstName, lastName from request body
- [ ] Validate all fields are present
- [ ] Validate email format
- [ ] Validate password strength (min 8 chars, uppercase, number)
- [ ] Check if email already exists
- [ ] Hash password using bcrypt
- [ ] Generate email verification token
- [ ] Set token expiry (24 hours from now)
- [ ] Create user in database
- [ ] Send verification email
- [ ] Return success response (don't return password)
- [ ] Log registration event

**Handle Registration Errors:**
- [ ] Duplicate email → 409 Conflict
- [ ] Invalid data → 400 Bad Request
- [ ] Database error → 500 Internal Server Error

### 3.2 Email Service - Verification

**Create Email Service:**
- [ ] Create `backend/src/services/emailService.js`

**Build Send Email Function:**
- [ ] Function: `sendEmail(to, subject, html)`
- [ ] Use configured email service
- [ ] Handle send errors
- [ ] Log email sent/failed
- [ ] Return success/failure status

**Build Verification Email Template:**
- [ ] Create `backend/src/templates/verification.html`
- [ ] Professional HTML email template
- [ ] Include verification link
- [ ] Link format: `{FRONTEND_URL}/verify-email?token={TOKEN}`
- [ ] Add company branding
- [ ] Include expiry time (24 hours)

**Build Send Verification Email Function:**
- [ ] Function: `sendVerificationEmail(userEmail, userName, token)`
- [ ] Load verification template
- [ ] Replace placeholders (name, link)
- [ ] Send email
- [ ] Log email sent to database (email_notifications table)

### 3.3 Auth Controller - Email Verification

**Build Verify Email Function:**
- [ ] Function: `verifyEmail(req, res)`
- [ ] Extract token from query parameter
- [ ] Find user by verification token
- [ ] Check if token exists
- [ ] Check if token expired
- [ ] Mark email as verified
- [ ] Clear verification token
- [ ] Return success response
- [ ] Redirect to login page (frontend)

**Handle Verification Errors:**
- [ ] Invalid token → 400 Bad Request
- [ ] Expired token → 400 Bad Request with "resend" option
- [ ] Already verified → 200 OK with message

### 3.4 Auth Controller - Login

**Build Login Function:**
- [ ] Function: `login(req, res)`
- [ ] Extract: email, password from request body
- [ ] Validate fields are present
- [ ] Find user by email
- [ ] Check if user exists
- [ ] Check if email is verified
- [ ] Compare password with hash
- [ ] Check account status (not suspended/banned)
- [ ] Generate JWT token
- [ ] Update last login timestamp and IP
- [ ] Create session record (user_sessions table)
- [ ] Return token and user data (without password)
- [ ] Log login event

**Handle Login Errors:**
- [ ] User not found → 401 Unauthorized "Invalid credentials"
- [ ] Wrong password → 401 Unauthorized "Invalid credentials"
- [ ] Email not verified → 403 Forbidden "Please verify your email"
- [ ] Account suspended → 403 Forbidden "Account suspended"

### 3.5 Auth Middleware

**Create Auth Middleware:**
- [ ] Create `backend/src/middleware/auth.js`
- [ ] Function: `authenticate(req, res, next)`
- [ ] Extract token from Authorization header
- [ ] Check if token exists
- [ ] Verify JWT token
- [ ] Check if session is active (user_sessions table)
- [ ] Attach user ID to request object: `req.userId`
- [ ] Call next() if authenticated
- [ ] Return 401 if not authenticated

**Token Refresh Logic:**
- [ ] Function: `refreshToken(req, res)`
- [ ] Verify refresh token
- [ ] Generate new access token
- [ ] Update session last activity
- [ ] Return new token

### 3.6 Auth Controller - Password Reset

**Build Forgot Password Function:**
- [ ] Function: `forgotPassword(req, res)`
- [ ] Extract email from request body
- [ ] Find user by email
- [ ] Generate password reset token
- [ ] Set token expiry (1 hour from now)
- [ ] Save token to database
- [ ] Send password reset email
- [ ] Return success (always, even if email not found - security)
- [ ] Log reset request

**Create Password Reset Email Template:**
- [ ] Create `backend/src/templates/passwordReset.html`
- [ ] Include reset link
- [ ] Link format: `{FRONTEND_URL}/reset-password?token={TOKEN}`
- [ ] Add security warning
- [ ] Include expiry time (1 hour)

**Build Send Password Reset Email:**
- [ ] Function: `sendPasswordResetEmail(userEmail, userName, token)`
- [ ] Load reset template
- [ ] Replace placeholders
- [ ] Send email
- [ ] Log email sent

**Build Reset Password Function:**
- [ ] Function: `resetPassword(req, res)`
- [ ] Extract: token, newPassword from request body
- [ ] Validate new password strength
- [ ] Find user by reset token
- [ ] Check if token exists
- [ ] Check if token expired
- [ ] Hash new password
- [ ] Update password in database
- [ ] Clear reset token
- [ ] Invalidate all existing sessions
- [ ] Send confirmation email
- [ ] Return success response

### 3.7 Auth Routes

**Create Auth Routes:**
- [ ] Create `backend/src/routes/auth.js`
- [ ] Route: `POST /api/auth/register` → authController.register
- [ ] Route: `POST /api/auth/login` → authController.login
- [ ] Route: `GET /api/auth/verify-email` → authController.verifyEmail
- [ ] Route: `POST /api/auth/forgot-password` → authController.forgotPassword
- [ ] Route: `POST /api/auth/reset-password` → authController.resetPassword
- [ ] Route: `POST /api/auth/refresh-token` → authController.refreshToken
- [ ] Route: `POST /api/auth/logout` → authController.logout (requires auth middleware)

**Add Input Validation:**
- [ ] Create validation middleware for each route
- [ ] Validate email format
- [ ] Validate password requirements
- [ ] Validate required fields
- [ ] Return 400 with field errors if validation fails

### 3.8 Frontend - API Service

**Create API Client:**
- [ ] Create `frontend/src/services/api.js`
- [ ] Set up Axios instance with base URL
- [ ] Add request interceptor (attach JWT token)
- [ ] Add response interceptor (handle errors)
- [ ] Handle 401 (redirect to login)
- [ ] Handle 403 (show permission error)
- [ ] Handle 500 (show server error)

**Create Auth Service:**
- [ ] Create `frontend/src/services/authService.js`
- [ ] Function: `register(userData)` - Calls POST /api/auth/register
- [ ] Function: `login(email, password)` - Calls POST /api/auth/login
- [ ] Function: `verifyEmail(token)` - Calls GET /api/auth/verify-email
- [ ] Function: `forgotPassword(email)` - Calls POST /api/auth/forgot-password
- [ ] Function: `resetPassword(token, password)` - Calls POST /api/auth/reset-password
- [ ] Function: `logout()` - Clears local storage, calls backend
- [ ] Function: `getCurrentUser()` - Gets user from token
- [ ] Store JWT in localStorage
- [ ] Store user data in localStorage

### 3.9 Frontend - Auth Context

**Create Auth Context:**
- [ ] Create `frontend/src/context/AuthContext.jsx`
- [ ] State: `user` (current user object or null)
- [ ] State: `token` (JWT token or null)
- [ ] State: `loading` (boolean for auth check)
- [ ] Function: `loginUser(email, password)` - Updates state after login
- [ ] Function: `registerUser(userData)` - Handles registration
- [ ] Function: `logoutUser()` - Clears state and localStorage
- [ ] Check for stored token on mount
- [ ] Verify token validity on mount
- [ ] Provide context to entire app

**Create useAuth Hook:**
- [ ] Create `frontend/src/hooks/useAuth.js`
- [ ] Returns auth context
- [ ] Easier access to auth state: `const { user, login, logout } = useAuth()`

### 3.10 Frontend - Auth Components

**Create Input Component:**
- [ ] Create `frontend/src/components/common/Input.jsx`
- [ ] Props: type, name, value, onChange, placeholder, error
- [ ] Show error message if error prop provided
- [ ] Style with Tailwind CSS

**Create Button Component:**
- [ ] Create `frontend/src/components/common/Button.jsx`
- [ ] Props: children, onClick, type, loading, disabled
- [ ] Show loading spinner when loading
- [ ] Disable when disabled or loading

**Create Registration Form:**
- [ ] Create `frontend/src/components/auth/RegisterForm.jsx`
- [ ] Fields: firstName, lastName, email, password, confirmPassword
- [ ] Validate all fields client-side
- [ ] Password strength indicator
- [ ] Confirm password matches
- [ ] Submit to authService.register()
- [ ] Show success message with "Check your email"
- [ ] Show error messages if registration fails
- [ ] Link to login page

**Create Login Form:**
- [ ] Create `frontend/src/components/auth/LoginForm.jsx`
- [ ] Fields: email, password
- [ ] "Remember me" checkbox (optional)
- [ ] Submit to authService.login()
- [ ] Store token and user in context
- [ ] Redirect to dashboard on success
- [ ] Show error if login fails
- [ ] Links: "Forgot password?" and "Don't have an account?"

**Create Forgot Password Form:**
- [ ] Create `frontend/src/components/auth/ForgotPasswordForm.jsx`
- [ ] Field: email
- [ ] Submit to authService.forgotPassword()
- [ ] Show success: "Check your email for reset link"
- [ ] Link back to login

**Create Reset Password Form:**
- [ ] Create `frontend/src/components/auth/ResetPasswordForm.jsx`
- [ ] Fields: newPassword, confirmPassword
- [ ] Extract token from URL query parameter
- [ ] Validate passwords match
- [ ] Submit to authService.resetPassword()
- [ ] Show success: "Password reset! Redirecting to login..."
- [ ] Auto-redirect to login after 3 seconds

### 3.11 Frontend - Auth Pages

**Create Register Page:**
- [ ] Create `frontend/src/pages/RegisterPage.jsx`
- [ ] Include RegisterForm component
- [ ] Add branding/logo
- [ ] Responsive design

**Create Login Page:**
- [ ] Create `frontend/src/pages/LoginPage.jsx`
- [ ] Include LoginForm component
- [ ] Add branding/logo
- [ ] Responsive design

**Create Forgot Password Page:**
- [ ] Create `frontend/src/pages/ForgotPasswordPage.jsx`
- [ ] Include ForgotPasswordForm component

**Create Reset Password Page:**
- [ ] Create `frontend/src/pages/ResetPasswordPage.jsx`
- [ ] Include ResetPasswordForm component

**Create Email Verification Page:**
- [ ] Create `frontend/src/pages/VerifyEmailPage.jsx`
- [ ] Extract token from URL automatically
- [ ] Call authService.verifyEmail() on mount
- [ ] Show loading spinner
- [ ] Show success: "Email verified! Redirecting to login..."
- [ ] Show error if verification fails
- [ ] Button to resend verification email

### 3.12 Frontend - Routing

**Set Up React Router:**
- [ ] Update `frontend/src/App.jsx`
- [ ] Wrap app in AuthProvider
- [ ] Wrap app in BrowserRouter
- [ ] Define routes:
  - `/` → HomePage (public)
  - `/register` → RegisterPage (public)
  - `/login` → LoginPage (public)
  - `/forgot-password` → ForgotPasswordPage (public)
  - `/reset-password` → ResetPasswordPage (public)
  - `/verify-email` → VerifyEmailPage (public)
  - `/dashboard` → DashboardPage (protected)

**Create Protected Route Component:**
- [ ] Create `frontend/src/components/common/ProtectedRoute.jsx`
- [ ] Check if user is authenticated
- [ ] If yes, render children
- [ ] If no, redirect to login

### 3.13 Testing Auth System

**Backend Testing (Postman):**
- [ ] Test POST /api/auth/register
  - Valid data → 201 Created
  - Duplicate email → 409 Conflict
  - Invalid email → 400 Bad Request
  - Weak password → 400 Bad Request
- [ ] Test POST /api/auth/login
  - Valid credentials → 200 OK with token
  - Wrong password → 401 Unauthorized
  - Unverified email → 403 Forbidden
- [ ] Test GET /api/auth/verify-email?token=xxx
  - Valid token → 200 OK
  - Invalid token → 400 Bad Request
- [ ] Test POST /api/auth/forgot-password
  - Valid email → 200 OK
  - Non-existent email → 200 OK (security)
- [ ] Test POST /api/auth/reset-password
  - Valid token + password → 200 OK
  - Expired token → 400 Bad Request

**Frontend Testing (Manual):**
- [ ] Test registration flow end-to-end
- [ ] Check email received
- [ ] Test email verification link
- [ ] Test login after verification
- [ ] Test login with unverified email
- [ ] Test forgot password flow
- [ ] Test reset password with link
- [ ] Test protected route redirect
- [ ] Test logout functionality

**Database Verification:**
- [ ] Check users table for new registrations
- [ ] Verify passwords are hashed
- [ ] Check email_notifications table for sent emails
- [ ] Check user_sessions table for active sessions

## 📝 Deliverables for Phase 3

- ✅ Complete registration system
- ✅ Email verification working
- ✅ Login system with JWT
- ✅ Password reset flow working
- ✅ Auth middleware protecting routes
- ✅ Frontend forms with validation
- ✅ Auth context managing user state
- ✅ All emails sending successfully
- ✅ Protected routes working

## 🧪 Testing Checklist

- [ ] Can register new user
- [ ] Receive verification email
- [ ] Can verify email with link
- [ ] Can login after verification
- [ ] Cannot login without verification
- [ ] JWT token works for protected routes
- [ ] Can request password reset
- [ ] Receive reset email
- [ ] Can reset password with link
- [ ] Old password doesn't work after reset
- [ ] Can logout successfully
- [ ] Protected routes redirect to login

---

# PHASE 4: PAYMENT INTEGRATION (Week 4)

## 🎯 Goal
Integrate Stripe payment processing for token purchases.

## ✅ Tasks

### 4.1 Stripe Service Setup

**Create Stripe Service:**
- [ ] Create `backend/src/services/stripeService.js`

**Build Create Payment Intent Function:**
- [ ] Function: `createPaymentIntent(userId, amount, tokenAmount, metadata)`
- [ ] Calculate amount in cents (Stripe uses smallest currency unit)
- [ ] Create Stripe payment intent
- [ ] Set currency to USD
- [ ] Add metadata: userId, tokenAmount, walletAddress
- [ ] Return payment intent details
- [ ] Handle Stripe errors

**Build Get Payment Intent Function:**
- [ ] Function: `getPaymentIntent(paymentIntentId)`
- [ ] Retrieve payment intent from Stripe
- [ ] Return payment intent details
- [ ] Handle not found errors

**Build Create Stripe Customer Function:**
- [ ] Function: `createStripeCustomer(email, name, metadata)`
- [ ] Create customer in Stripe
- [ ] Store customer ID for future transactions
- [ ] Add metadata: userId
- [ ] Return customer ID

**Build Refund Payment Function:**
- [ ] Function: `createRefund(paymentIntentId, amount, reason)`
- [ ] Create refund in Stripe
- [ ] Can be full or partial refund
- [ ] Add reason to metadata
- [ ] Return refund details

### 4.2 Transaction Model

**Create Transaction Model:**
- [ ] Create `backend/src/models/Transaction.js`

**Build Transaction Functions:**
- [ ] Function: `createTransaction(transactionData)`
  - Generate UUID
  - Insert transaction record
  - Status: pending
  - Return transaction ID
- [ ] Function: `findTransactionById(id)`
- [ ] Function: `findTransactionByUUID(uuid)`
- [ ] Function: `findTransactionsByUserId(userId, limit, offset)`
- [ ] Function: `updateTransactionStatus(id, status, details)`
- [ ] Function: `updatePaymentDetails(id, paymentData)`
  - Store Stripe payment intent ID
  - Store payment method
  - Store customer ID
- [ ] Function: `updateBlockchainDetails(id, blockchainData)`
  - Store transaction signature
  - Store confirmations
  - Update blockchain status
- [ ] Function: `markTransactionCompleted(id)`
  - Set status: completed
  - Set completed_at timestamp
- [ ] Function: `markTransactionFailed(id, errorMessage)`
  - Set status: failed
  - Store error message
  - Increment retry count
- [ ] Function: `createRefund(transactionId, refundData)`
  - Set status: refunded
  - Store refund amount and reason
  - Store Stripe refund ID
  - Set refunded_at timestamp
- [ ] Function: `getUserTotalSpentToday(userId)`
  - Calculate today's spending
  - For daily limit check
- [ ] Function: `getTransactionStats()`
  - Total transactions
  - Total revenue
  - Success rate

### 4.3 Payment Controller

**Create Payment Controller:**
- [ ] Create `backend/src/controllers/paymentController.js`

**Build Get Token Config Function:**
- [ ] Function: `getTokenConfig(req, res)`
- [ ] Get active token configuration
- [ ] Return: price, min/max amounts, limits
- [ ] Public endpoint (no auth required)

**Build Calculate Purchase Function:**
- [ ] Function: `calculatePurchase(req, res)`
- [ ] Extract: amount (USD) from request body
- [ ] Get current token price
- [ ] Calculate token amount
- [ ] Validate within min/max limits
- [ ] Return: amount, tokens, price per token

**Build Create Purchase Intent Function:**
- [ ] Function: `createPurchaseIntent(req, res)`
- [ ] Requires authentication (use auth middleware)
- [ ] Extract: amount (USD) from request body
- [ ] Get user details (from req.userId)
- [ ] Check if user has wallet address
- [ ] Check daily purchase limit
- [ ] Get token configuration
- [ ] Calculate token amount
- [ ] Validate amount within limits
- [ ] Create Stripe payment intent
- [ ] Create transaction record (status: pending)
- [ ] Return: clientSecret, transactionId, tokenAmount

**Build Confirm Purchase Function:**
- [ ] Function: `confirmPurchase(req, res)`
- [ ] Extract: paymentIntentId from request body
- [ ] Get payment intent from Stripe
- [ ] Check payment status
- [ ] Find transaction by payment intent ID
- [ ] If payment succeeded:
  - Trigger token distribution (call Solana service)
  - Update transaction with blockchain details
  - Send purchase confirmation email
  - Return success response
- [ ] If payment failed:
  - Update transaction status to failed
  - Return error response

**Build Get User Transactions Function:**
- [ ] Function: `getUserTransactions(req, res)`
- [ ] Requires authentication
- [ ] Get user ID from req.userId
- [ ] Extract: page, limit from query params (pagination)
- [ ] Get transactions for user
- [ ] Return transactions array

**Build Get Transaction Details Function:**
- [ ] Function: `getTransactionDetails(req, res)`
- [ ] Requires authentication
- [ ] Extract transaction ID from params
- [ ] Find transaction
- [ ] Verify transaction belongs to user
- [ ] Return full transaction details

### 4.4 Webhook Controller

**Create Webhook Controller:**
- [ ] Create `backend/src/controllers/webhookController.js`

**Build Stripe Webhook Handler:**
- [ ] Function: `handleStripeWebhook(req, res)`
- [ ] Verify webhook signature
- [ ] Extract event type and data
- [ ] Log webhook to database
- [ ] Handle different event types:

**Handle payment_intent.succeeded:**
- [ ] Find transaction by payment intent ID
- [ ] Update transaction with payment details
- [ ] Trigger token distribution
- [ ] Update transaction status to processing
- [ ] Send confirmation email

**Handle payment_intent.payment_failed:**
- [ ] Find transaction
- [ ] Update status to failed
- [ ] Store error message
- [ ] Send failure notification email

**Handle charge.refunded:**
- [ ] Find transaction
- [ ] Update status to refunded
- [ ] Store refund details
- [ ] Send refund notification email

**Handle payment_intent.canceled:**
- [ ] Find transaction
- [ ] Update status to cancelled

**Webhook Error Handling:**
- [ ] Log failed webhook processing
- [ ] Update webhook_logs table
- [ ] Return 200 even on error (Stripe requirement)
- [ ] Implement retry logic for failed processing

### 4.5 Payment Routes

**Create Payment Routes:**
- [ ] Create `backend/src/routes/payment.js`
- [ ] Route: `GET /api/payment/config` → paymentController.getTokenConfig
- [ ] Route: `POST /api/payment/calculate` → paymentController.calculatePurchase
- [ ] Route: `POST /api/payment/create-intent` → paymentController.createPurchaseIntent (auth required)
- [ ] Route: `POST /api/payment/confirm` → paymentController.confirmPurchase (auth required)

**Create Transaction Routes:**
- [ ] Create `backend/src/routes/transaction.js`
- [ ] Route: `GET /api/transactions` → paymentController.getUserTransactions (auth required)
- [ ] Route: `GET /api/transactions/:id` → paymentController.getTransactionDetails (auth required)

**Create Webhook Routes:**
- [ ] Create `backend/src/routes/webhook.js`
- [ ] Route: `POST /api/webhook/stripe` → webhookController.handleStripeWebhook
- [ ] Important: Use raw body for webhook signature verification
- [ ] Do NOT apply rate limiting to webhook route

### 4.6 Frontend - Payment Service

**Create Payment Service:**
- [ ] Create `frontend/src/services/paymentService.js`
- [ ] Function: `getTokenConfig()` - GET /api/payment/config
- [ ] Function: `calculatePurchase(amount)` - POST /api/payment/calculate
- [ ] Function: `createPaymentIntent(amount)` - POST /api/payment/create-intent
- [ ] Function: `confirmPayment(paymentIntentId)` - POST /api/payment/confirm
- [ ] Function: `getUserTransactions(page, limit)` - GET /api/transactions
- [ ] Function: `getTransactionDetails(id)` - GET /api/transactions/:id

### 4.7 Frontend - Payment Components

**Create Token Purchase Calculator:**
- [ ] Create `frontend/src/components/payment/TokenPurchase.jsx`
- [ ] Display current token price
- [ ] Input: USD amount to spend
- [ ] Show calculated token amount in real-time
- [ ] Show min/max limits
- [ ] Show daily limit remaining
- [ ] "Buy Now" button
- [ ] Validate amount within limits

**Create Stripe Payment Form:**
- [ ] Create `frontend/src/components/payment/PaymentForm.jsx`
- [ ] Use Stripe Elements (CardElement)
- [ ] Wrap in Elements provider
- [ ] Load Stripe with publishable key
- [ ] Props: amount, tokenAmount, onSuccess, onError
- [ ] Show amount summary
- [ ] Show token amount receiving
- [ ] "Pay" button
- [ ] Handle payment submission:
  - Call createPaymentIntent
  - Confirm card payment with Stripe
  - Call confirmPayment on backend
  - Show success/error message

**Create Purchase Success Component:**
- [ ] Create `frontend/src/components/payment/PurchaseSuccess.jsx`
- [ ] Show success message
- [ ] Display transaction details
- [ ] Show tokens purchased
- [ ] Show Solana transaction link
- [ ] Button: "View Transaction History"
- [ ] Button: "Buy More Tokens"

**Create Transaction History Component:**
- [ ] Create `frontend/src/components/user/TransactionHistory.jsx`
- [ ] Fetch user transactions on mount
- [ ] Display in table/list:
  - Date/Time
  - Amount (USD)
  - Tokens received
  - Status
  - Solana transaction link
- [ ] Pagination controls
- [ ] Filter by status (optional)
- [ ] Click row to see details

**Create Transaction Details Modal:**
- [ ] Create `frontend/src/components/user/TransactionDetails.jsx`
- [ ] Props: transactionId
- [ ] Fetch full transaction details
- [ ] Display:
  - Transaction UUID
  - Date/Time
  - Amount paid
  - Tokens received
  - Token price at purchase
  - Payment method
  - Stripe payment ID
  - Solana transaction signature
  - Transaction status
  - Error message (if failed)
- [ ] Link to Solana explorer
- [ ] Close button

### 4.8 Frontend - Payment Pages

**Create Purchase Page:**
- [ ] Create `frontend/src/pages/PurchasePage.jsx`
- [ ] Requires authentication
- [ ] Check if user has wallet address
- [ ] If no wallet, show "Connect wallet first" message
- [ ] Include TokenPurchase component
- [ ] Handle purchase flow:
  - User enters amount
  - Show PaymentForm
  - On success, show PurchaseSuccess
  - On error, show error message

**Update Dashboard Page:**
- [ ] Add "Buy Tokens" button
- [ ] Show account balance (if tracking)
- [ ] Show recent transactions (last 5)
- [ ] Link to full transaction history

**Create Transactions Page:**
- [ ] Create `frontend/src/pages/TransactionsPage.jsx`
- [ ] Include TransactionHistory component
- [ ] Full page view of all transactions

### 4.9 Email Templates

**Create Purchase Confirmation Email:**
- [ ] Create `backend/src/templates/purchaseConfirmation.html`
- [ ] Thank you message
- [ ] Transaction details:
  - Date/Time
  - Amount paid
  - Tokens received
  - Wallet address
- [ ] Solana transaction link
- [ ] Support contact info

**Send Confirmation Email Function:**
- [ ] In emailService.js
- [ ] Function: `sendPurchaseConfirmation(userEmail, userName, transactionData)`
- [ ] Load template
- [ ] Replace placeholders
- [ ] Send email
- [ ] Log to database

### 4.10 Configure Stripe Webhook

**Set Up Webhook Endpoint:**
- [ ] In Stripe Dashboard, go to Developers → Webhooks
- [ ] Add endpoint: `https://yourdomain.com/api/webhook/stripe`
- [ ] For development: Use Stripe CLI
  - Install: `brew install stripe/stripe-cli/stripe` (Mac)
  - Login: `stripe login`
  - Forward: `stripe listen --forward-to localhost:5000/api/webhook/stripe`
  - Get webhook secret from CLI output
  - Add to .env: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Select Events to Listen:**
- [ ] payment_intent.succeeded
- [ ] payment_intent.payment_failed
- [ ] payment_intent.canceled
- [ ] charge.refunded

### 4.11 Testing Payment Flow

**Backend Testing (Postman):**
- [ ] Test GET /api/payment/config
- [ ] Test POST /api/payment/calculate with various amounts
- [ ] Test POST /api/payment/create-intent
  - Without auth → 401
  - With auth → Returns clientSecret
  - Above daily limit → 400
- [ ] Test webhook endpoint with Stripe CLI
  - Trigger payment_intent.succeeded
  - Check transaction updated

**Frontend Testing (Manual):**
- [ ] Navigate to purchase page
- [ ] Enter amount
- [ ] See correct token calculation
- [ ] Try amount below minimum → See error
- [ ] Try amount above maximum → See error
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] See success message
- [ ] Check transaction appears in history

**Stripe Test Cards:**
- [ ] Success: 4242 4242 4242 4242
- [ ] Decline: 4000 0000 0000 0002
- [ ] Insufficient funds: 4000 0000 0000 9995
- [ ] Test 3D Secure: 4000 0027 6000 3184

**Database Verification:**
- [ ] Check transactions table
- [ ] Verify payment intent ID stored
- [ ] Check webhook_logs table
- [ ] Check email_notifications table

## 📝 Deliverables for Phase 4

- ✅ Stripe payment integration complete
- ✅ Payment intent creation working
- ✅ Webhook handling implemented
- ✅ Transaction model with all operations
- ✅ Frontend payment forms
- ✅ Transaction history display
- ✅ Email confirmations sending
- ✅ Daily limit checking
- ✅ Full payment flow tested

## 🧪 Testing Checklist

- [ ] Can create payment intent
- [ ] Can process test payment
- [ ] Webhook receives events
- [ ] Transaction records created
- [ ] Payment success updates transaction
- [ ] Email confirmation sent
- [ ] Transaction history shows purchases
- [ ] Daily limit enforced
- [ ] Refund processing works
- [ ] Error handling works for failed payments

---

# PHASE 5: BLOCKCHAIN INTEGRATION (Week 5)

## 🎯 Goal
Integrate Solana blockchain to automatically send CDX tokens after successful payments.

## ✅ Tasks

### 5.1 Create CDX Token on Solana (One-Time Setup)

**Install Solana CLI Tools:**
- [ ] Already done in Phase 1
- [ ] Verify: `solana --version`

**Create Token Mint:**
- [ ] Connect to devnet: `solana config set --url devnet`
- [ ] Check balance: `solana balance`
- [ ] Create token: `spl-token create-token`
- [ ] Save the token address (mint address)
- [ ] This is your CDX token mint address

**Create Token Account:**
- [ ] Create account for treasury wallet
- [ ] Command: `spl-token create-account <TOKEN_MINT_ADDRESS>`
- [ ] Save the token account address

**Mint Initial Supply:**
- [ ] Decide total supply (e.g., 1,000,000 CDX)
- [ ] Mint tokens: `spl-token mint <TOKEN_MINT_ADDRESS> 1000000`
- [ ] Verify: `spl-token balance <TOKEN_MINT_ADDRESS>`
- [ ] All tokens now in treasury wallet

**Update Environment Variables:**
- [ ] Add to backend .env:
  - `CDX_TOKEN_MINT_ADDRESS=<your_mint_address>`
  - `CDX_TREASURY_TOKEN_ACCOUNT=<your_token_account>`

### 5.2 Solana Service Setup

**Create Solana Service:**
- [ ] Create `backend/src/services/solanaService.js`

**Initialize Solana Connection:**
- [ ] Import Solana web3.js and SPL token
- [ ] Load connection from config
- [ ] Load treasury wallet keypair
- [ ] Export connection and wallet

**Build Get Treasury Balance Function:**
- [ ] Function: `getTreasuryBalance()`
- [ ] Get token account balance
- [ ] Return available CDX tokens
- [ ] Handle errors

**Build Validate Wallet Address Function:**
- [ ] Function: `validateWalletAddress(address)`
- [ ] Check if valid Solana address format
- [ ] Try to create PublicKey object
- [ ] Return true/false
- [ ] Used before storing wallet address

**Build Get Token Account Function:**
- [ ] Function: `getOrCreateTokenAccount(walletAddress)`
- [ ] Check if user has CDX token account
- [ ] If not, create one (user pays rent, ~0.002 SOL)
- [ ] Return token account address
- [ ] Handle errors

**Build Send Tokens Function:**
- [ ] Function: `sendTokens(recipientWallet, amount, transactionId)`
- [ ] Validate recipient address
- [ ] Get or create recipient token account
- [ ] Build transfer instruction
- [ ] Create transaction
- [ ] Sign with treasury wallet
- [ ] Send and confirm transaction
- [ ] Get transaction signature
- [ ] Wait for confirmation
- [ ] Return: signature, status, confirmations
- [ ] Log transaction details
- [ ] Handle errors (insufficient balance, network errors)

**Build Check Transaction Status Function:**
- [ ] Function: `checkTransactionStatus(signature)`
- [ ] Get transaction from Solana
- [ ] Check confirmation status
- [ ] Return: confirmed, slot, confirmations
- [ ] Handle not found

**Build Get Transaction Details Function:**
- [ ] Function: `getTransactionDetails(signature)`
- [ ] Fetch full transaction from Solana
- [ ] Parse transaction data
- [ ] Return detailed information
- [ ] Used for verification

### 5.3 Token Distribution Integration

**Update Payment Controller:**
- [ ] In `confirmPurchase` function
- [ ] After payment succeeds:
  - Get user's wallet address
  - Calculate token amount (already have this)
  - Call solanaService.sendTokens()
  - Update transaction with blockchain details
  - Handle success/failure

**Build Token Distribution Function:**
- [ ] Function: `distributeTokens(transactionId)`
- [ ] Find transaction by ID
- [ ] Get user wallet address
- [ ] Get token amount
- [ ] Send tokens via Solana
- [ ] Update transaction:
  - blockchain_status: processing
  - solana_transaction_signature
- [ ] Wait for confirmation
- [ ] Update transaction:
  - blockchain_status: confirmed
  - blockchain_confirmations
  - status: completed
  - completed_at timestamp
- [ ] If error:
  - Update transaction status: failed
  - Store error message
  - Increment retry count
  - Log error for manual review

**Build Retry Failed Distribution Function:**
- [ ] Function: `retryFailedDistribution(transactionId)`
- [ ] Check if transaction qualifies for retry
- [ ] Attempt distribution again
- [ ] Maximum 3 retry attempts
- [ ] Update transaction status accordingly

### 5.4 Token Controller

**Create Token Controller:**
- [ ] Create `backend/src/controllers/tokenController.js`

**Build Get Token Info Function:**
- [ ] Function: `getTokenInfo(req, res)`
- [ ] Get CDX token mint address
- [ ] Get treasury balance
- [ ] Get total supply
- [ ] Return token information
- [ ] Public endpoint

**Build Check Distribution Status Function:**
- [ ] Function: `checkDistributionStatus(req, res)`
- [ ] Extract transaction ID from params
- [ ] Requires authentication
- [ ] Verify transaction belongs to user
- [ ] Get transaction details
- [ ] If blockchain signature exists:
  - Check transaction status on Solana
  - Update database if status changed
- [ ] Return current status

**Build Manual Distribution Trigger (Admin Only):**
- [ ] Function: `triggerDistribution(req, res)`
- [ ] Requires admin authentication
- [ ] Extract transaction ID
- [ ] Find transaction
- [ ] Check if eligible for distribution
- [ ] Call distributeTokens()
- [ ] Return result

### 5.5 User Controller - Wallet Management

**Create User Controller:**
- [ ] Create `backend/src/controllers/userController.js`

**Build Get Profile Function:**
- [ ] Function: `getProfile(req, res)`
- [ ] Requires authentication
- [ ] Get user ID from req.userId
- [ ] Find user by ID
- [ ] Remove password from response
- [ ] Return user profile

**Build Update Wallet Address Function:**
- [ ] Function: `updateWalletAddress(req, res)`
- [ ] Requires authentication
- [ ] Extract: walletAddress from request body
- [ ] Validate Solana address format
- [ ] Check if address already used by another user
- [ ] Update user record
- [ ] Return success response

**Build Get User Stats Function:**
- [ ] Function: `getUserStats(req, res)`
- [ ] Requires authentication
- [ ] Get user transaction statistics
- [ ] Return: total purchases, total spent, total tokens

### 5.6 Background Job for Confirmation Checking

**Create Background Job Service:**
- [ ] Create `backend/src/services/jobService.js`

**Build Transaction Confirmation Checker:**
- [ ] Function: `checkPendingTransactions()`
- [ ] Find all transactions with:
  - blockchain_status: processing
  - Has solana_transaction_signature
- [ ] For each transaction:
  - Check status on Solana
  - Update confirmations count
  - If confirmed (32+ confirmations):
    - Update blockchain_status: confirmed
    - Update status: completed
- [ ] Run every 30 seconds

**Set Up Job Scheduler:**
- [ ] Install node-cron: `npm install node-cron`
- [ ] Create scheduler in server.js
- [ ] Schedule confirmation checker
- [ ] Start after server starts

### 5.7 Frontend - Wallet Connection

**Create Wallet Hook:**
- [ ] Create `frontend/src/hooks/useWallet.js`
- [ ] Use Solana wallet adapter
- [ ] State: connected, publicKey, connecting
- [ ] Function: connect() - Trigger wallet connection
- [ ] Function: disconnect() - Disconnect wallet
- [ ] Function: signMessage() - Sign for verification
- [ ] Return wallet state and functions

**Create Wallet Connect Component:**
- [ ] Create `frontend/src/components/user/WalletConnect.jsx`
- [ ] Use useWallet hook
- [ ] If not connected:
  - Show "Connect Wallet" button
  - List supported wallets (Phantom, Solflare)
  - Detect installed wallets
- [ ] If connected:
  - Show wallet address (truncated)
  - Show "Disconnect" button
  - Copy address button
- [ ] After connection:
  - Save address to backend
  - Update user profile

**Update Profile Page:**
- [ ] Add WalletConnect component
- [ ] Show current saved wallet address
- [ ] Allow changing wallet address
- [ ] Warning: "Tokens will be sent to this address"

### 5.8 Frontend - Token Distribution Status

**Create Distribution Status Component:**
- [ ] Create `frontend/src/components/payment/DistributionStatus.jsx`
- [ ] Props: transactionId
- [ ] Poll transaction status every 5 seconds
- [ ] Show status:
  - Pending: "Processing payment..."
  - Processing: "Sending tokens..." (with spinner)
  - Confirmed: "Tokens sent!" (with checkmark)
  - Failed: "Distribution failed" (with error)
- [ ] Show Solana transaction link when available
- [ ] Stop polling when completed or failed

**Update Purchase Success Component:**
- [ ] Include DistributionStatus component
- [ ] Pass transaction ID
- [ ] Show live status updates

**Create Token Balance Display:**
- [ ] Create `frontend/src/components/user/TokenBalance.jsx`
- [ ] Show user's CDX token balance
- [ ] Option 1: Read from Solana (requires RPC call)
- [ ] Option 2: Calculate from transactions
- [ ] Show in user dashboard

### 5.9 Testing Blockchain Integration

**Backend Testing:**
- [ ] Test solanaService.sendTokens() directly
  - With test wallet address
  - Check transaction on Solana explorer
  - Verify tokens received
- [ ] Test complete purchase flow:
  - Create payment intent
  - Complete payment
  - Check tokens sent automatically
  - Verify transaction updated
- [ ] Test with invalid wallet address
- [ ] Test with insufficient treasury balance
- [ ] Test retry logic for failed distribution

**Frontend Testing:**
- [ ] Connect wallet (Phantom on devnet)
- [ ] Save wallet address
- [ ] Complete test purchase
- [ ] Watch distribution status update
- [ ] Click Solana transaction link
- [ ] Verify on Solana explorer
- [ ] Check tokens in wallet

**Solana Explorer:**
- [ ] URL: https://explorer.solana.com/?cluster=devnet
- [ ] Search for:
  - Your transaction signature
  - Your wallet address
  - Token mint address
- [ ] Verify transaction details

**Database Verification:**
- [ ] Check transactions table
- [ ] Verify solana_transaction_signature stored
- [ ] Check blockchain_status progresses:
  - pending → processing → confirmed
- [ ] Check completed_at timestamp set

### 5.10 Error Handling & Edge Cases

**Handle Insufficient Treasury Balance:**
- [ ] Check balance before sending
- [ ] If insufficient:
  - Mark transaction as failed
  - Alert admin (email/Slack)
  - Queue for manual review
  - Don't retry automatically

**Handle Network Errors:**
- [ ] Catch Solana RPC errors
- [ ] Implement retry logic (max 3 attempts)
- [ ] Exponential backoff between retries
- [ ] Log all errors
- [ ] Alert after multiple failures

**Handle Wallet Address Issues:**
- [ ] Invalid format → Reject before payment
- [ ] Not initialized → Create token account first
- [ ] No SOL for rent → Either cover it or notify user

**Handle Transaction Confirmation Delays:**
- [ ] Some transactions take longer
- [ ] Don't mark as failed too quickly
- [ ] Check status for up to 10 minutes
- [ ] After timeout, flag for manual review

**Build Admin Review Function:**
- [ ] Function for admins to:
  - View failed distributions
  - Manually trigger retry
  - Mark as resolved
  - Issue refund if needed

## 📝 Deliverables for Phase 5

- ✅ CDX token created on Solana devnet
- ✅ Solana service with token sending
- ✅ Automatic token distribution after payment
- ✅ Wallet connection in frontend
- ✅ Transaction confirmation monitoring
- ✅ Distribution status tracking
- ✅ Error handling and retry logic
- ✅ Full payment-to-delivery flow working

## 🧪 Testing Checklist

- [ ] CDX token exists on devnet
- [ ] Treasury wallet has tokens
- [ ] Can validate wallet addresses
- [ ] Can send tokens to test wallet
- [ ] Payment triggers token distribution
- [ ] Transaction confirmation updates status
- [ ] Frontend shows distribution status
- [ ] Solana transaction link works
- [ ] Error handling works for failures
- [ ] Retry logic works for failed distributions
- [ ] Tokens appear in recipient wallet

## 🎯 Success Criteria

Complete payment-to-token-delivery flow:
1. User pays with credit card
2. Payment succeeds (Stripe)
3. Tokens automatically sent (Solana)
4. User sees tokens in wallet
5. Transaction marked complete
6. Confirmation email sent

---

# PHASE 6: COMPLETE USER FLOW (Week 6)

## 🎯 Goal
Build remaining user features and polish the complete user experience.

## ✅ Tasks

### 6.1 User Profile Management

**Complete Profile Page:**
- [ ] Create full profile page layout
- [ ] Display user information:
  - Name
  - Email
  - Registration date
  - Wallet address
  - KYC status
- [ ] Edit profile form:
  - Update name
  - Change wallet address
  - Request email change (requires verification)
- [ ] Account statistics:
  - Total purchases
  - Total spent
  - Total tokens purchased
  - Last purchase date

**Build Update Profile Function:**
- [ ] In userController.js
- [ ] Function: `updateProfile(req, res)`
- [ ] Allow updating: firstName, lastName
- [ ] Validate inputs
- [ ] Update database
- [ ] Return updated profile

**Build Change Email Function:**
- [ ] Function: `requestEmailChange(req, res)`
- [ ] Extract new email
- [ ] Check if email available
- [ ] Generate verification token
- [ ] Send verification to new email
- [ ] Store pending email change
- [ ] Function: `confirmEmailChange(req, res)`
- [ ] Verify token
- [ ] Update email
- [ ] Clear token

### 6.2 Dashboard Page

**Create Dashboard Layout:**
- [ ] Create `frontend/src/pages/DashboardPage.jsx`
- [ ] Protected route (requires auth)
- [ ] Responsive design

**Dashboard Sections:**

**Header:**
- [ ] Welcome message with user name
- [ ] Current CDX token balance
- [ ] Link to buy more tokens

**Quick Stats Cards:**
- [ ] Total Purchases (count)
- [ ] Total Spent (USD)
- [ ] Total Tokens Acquired
- [ ] Average Purchase Size

**Recent Transactions:**
- [ ] Last 5 transactions
- [ ] Show: date, amount, tokens, status
- [ ] Link to full transaction history

**Quick Actions:**
- [ ] Buy Tokens button (goes to purchase page)
- [ ] View All Transactions button
- [ ] Edit Profile button
- [ ] Connect/Change Wallet button

### 6.3 Navigation & Layout

**Create Navbar Component:**
- [ ] Create `frontend/src/components/common/Navbar.jsx`
- [ ] Logo/Brand name
- [ ] Navigation links:
  - Home
  - Dashboard (if logged in)
  - Buy Tokens (if logged in)
  - Transactions (if logged in)
- [ ] User menu (dropdown):
  - Profile
  - Settings
  - Logout
- [ ] Show user name/email
- [ ] Responsive mobile menu

**Create Footer Component:**
- [ ] Create `frontend/src/components/common/Footer.jsx`
- [ ] Company information
- [ ] Links: Terms, Privacy, Support
- [ ] Social media links (optional)
- [ ] Copyright notice

**Create Main Layout Component:**
- [ ] Create `frontend/src/components/common/Layout.jsx`
- [ ] Include Navbar
- [ ] Include Footer
- [ ] Content area with children
- [ ] Wrap all pages in Layout

### 6.4 Home Page

**Create Home Page:**
- [ ] Create `frontend/src/pages/HomePage.jsx`
- [ ] Public page (no auth required)

**Home Page Sections:**

**Hero Section:**
- [ ] Headline: "Buy CDX Tokens Instantly"
- [ ] Subheadline: "Purchase crypto tokens with your credit card"
- [ ] CTA button: "Get Started" (→ register)
- [ ] Show current token price

**Features Section:**
- [ ] Feature 1: Easy Payment (credit card)
- [ ] Feature 2: Instant Delivery (automatic)
- [ ] Feature 3: Secure (bank-level security)
- [ ] Icons for each feature

**How It Works:**
- [ ] Step 1: Create account
- [ ] Step 2: Connect wallet
- [ ] Step 3: Purchase tokens
- [ ] Step 4: Receive instantly

**CTA Section:**
- [ ] "Ready to buy CDX?"
- [ ] Register button
- [ ] Login link for existing users

### 6.5 Transaction Details & History

**Enhance Transaction History:**
- [ ] Add search functionality
- [ ] Add date range filter
- [ ] Add status filter (all, completed, pending, failed)
- [ ] Add sorting (date, amount)
- [ ] Add export to CSV (optional)
- [ ] Show total count and summary

**Transaction Details Modal:**
- [ ] Already created in Phase 4
- [ ] Enhance with more details:
  - Payment method details (last 4 digits)
  - Blockchain explorer links
  - Retry button for failed transactions
  - Support contact for issues

### 6.6 Settings Page

**Create Settings Page:**
- [ ] Create `frontend/src/pages/SettingsPage.jsx`
- [ ] Protected route

**Settings Sections:**

**Account Settings:**
- [ ] Change password form
- [ ] Delete account (with confirmation)

**Notification Settings:**
- [ ] Email notifications on/off
- [ ] Transaction alerts
- [ ] Marketing emails

**Security Settings:**
- [ ] Two-factor authentication (future)
- [ ] Active sessions list
- [ ] Logout all sessions

**Build Change Password Function:**
- [ ] In userController.js
- [ ] Function: `changePassword(req, res)`
- [ ] Verify current password
- [ ] Validate new password
- [ ] Hash new password
- [ ] Update database
- [ ] Invalidate other sessions

### 6.7 Email Notifications Enhancement

**Create Welcome Email:**
- [ ] Create `backend/src/templates/welcome.html`
- [ ] Welcome message
- [ ] Getting started guide
- [ ] Next steps
- [ ] Support contact

**Send Welcome Email:**
- [ ] In emailService.js
- [ ] Function: `sendWelcomeEmail(userEmail, userName)`
- [ ] Send after email verification

**Create All Email Templates:**
- [ ] Already have: verification, passwordReset, purchaseConfirmation
- [ ] New: welcome
- [ ] Optional: KYC approved, KYC rejected, refund processed

**Email Service Functions:**
- [ ] `sendVerificationEmail()`
- [ ] `sendWelcomeEmail()`
- [ ] `sendPasswordResetEmail()`
- [ ] `sendPurchaseConfirmationEmail()`
- [ ] `sendDistributionFailedEmail()` (to admin)

### 6.8 Loading States & Error Handling

**Create Loading Component:**
- [ ] Create `frontend/src/components/common/Loader.jsx`
- [ ] Spinner animation
- [ ] Optional text message
- [ ] Use throughout app

**Create Error Component:**
- [ ] Create `frontend/src/components/common/ErrorMessage.jsx`
- [ ] Display error message
- [ ] Retry button (optional)
- [ ] Dismiss button

**Add Loading States:**
- [ ] All API calls should show loading
- [ ] Disable buttons during loading
- [ ] Show loading indicator

**Add Error States:**
- [ ] Catch all API errors
- [ ] Display user-friendly messages
- [ ] Log errors to console
- [ ] Provide retry options

### 6.9 Form Validation Enhancement

**Client-Side Validation:**
- [ ] All forms validate before submission
- [ ] Show error messages immediately
- [ ] Highlight invalid fields
- [ ] Prevent submission if invalid

**Server-Side Validation:**
- [ ] Already implemented in Phase 3
- [ ] Ensure all endpoints validate inputs
- [ ] Return clear error messages

**Create Validation Utilities:**
- [ ] In `frontend/src/utils/validators.js`
- [ ] Functions match backend validation
- [ ] Used in all forms

### 6.10 Responsive Design

**Make All Pages Responsive:**
- [ ] Test on mobile (320px - 480px)
- [ ] Test on tablet (481px - 768px)
- [ ] Test on desktop (769px+)

**Responsive Components:**
- [ ] Navbar - hamburger menu on mobile
- [ ] Forms - stack vertically on mobile
- [ ] Tables - scroll horizontally or cards on mobile
- [ ] Dashboard - stack cards on mobile

**Use Tailwind Breakpoints:**
- [ ] sm: (640px)
- [ ] md: (768px)
- [ ] lg: (1024px)
- [ ] xl: (1280px)

### 6.11 User Experience Polish

**Add Notifications/Toasts:**
- [ ] Install react-hot-toast: `npm install react-hot-toast`
- [ ] Show toast on:
  - Successful actions
  - Errors
  - Warnings
- [ ] Auto-dismiss after 5 seconds

**Add Confirmation Dialogs:**
- [ ] Before important actions:
  - Delete account
  - Logout all sessions
  - Change wallet address
- [ ] Modal: "Are you sure?" with Cancel/Confirm

**Add Copy to Clipboard:**
- [ ] For wallet addresses
- [ ] For transaction IDs
- [ ] For Solana signatures
- [ ] Show "Copied!" message

**Add Empty States:**
- [ ] No transactions yet - show helpful message
- [ ] No search results - show "try different terms"
- [ ] Use friendly illustrations (optional)

### 6.12 Performance Optimization

**Frontend Optimization:**
- [ ] Lazy load components: `React.lazy()` and `Suspense`
- [ ] Optimize images (compress, use WebP)
- [ ] Minimize bundle size
- [ ] Code splitting for routes

**Backend Optimization:**
- [ ] Add database indexes (already have from Phase 1)
- [ ] Implement caching for token config
- [ ] Optimize queries (avoid N+1 problems)
- [ ] Use connection pooling (already configured)

**API Response Time:**
- [ ] Most endpoints under 200ms
- [ ] Payment endpoints under 500ms
- [ ] Blockchain operations may take longer (acceptable)

### 6.13 Testing Complete User Flows

**User Registration Flow:**
- [ ] Register → verify email → login → success

**First Purchase Flow:**
- [ ] Login → connect wallet → buy tokens → receive tokens

**Repeat Purchase Flow:**
- [ ] Login → buy tokens → receive tokens

**Profile Management Flow:**
- [ ] View profile → update info → change wallet → success

**Password Reset Flow:**
- [ ] Forgot password → receive email → reset → login

**Test Error Scenarios:**
- [ ] Network failure during purchase
- [ ] Payment failure
- [ ] Token distribution failure
- [ ] Session expiration
- [ ] Invalid inputs

## 📝 Deliverables for Phase 6

- ✅ Complete user dashboard
- ✅ Profile management
- ✅ Settings page
- ✅ Responsive navigation
- ✅ Professional home page
- ✅ All email templates
- ✅ Loading and error states
- ✅ Enhanced transaction history
- ✅ Responsive design
- ✅ User experience polish

## 🧪 Testing Checklist

- [ ] Can register, verify, and login
- [ ] Dashboard shows correct data
- [ ] Can update profile information
- [ ] Can connect and change wallet
- [ ] Can purchase tokens end-to-end
- [ ] Transaction history accurate
- [ ] All emails sending correctly
- [ ] All pages responsive
- [ ] Loading states show correctly
- [ ] Errors display clearly
- [ ] Navigation works smoothly
- [ ] Can change password
- [ ] Can reset password

## 🎯 Success Criteria

A new user can:
1. Register and verify email
2. Login to dashboard
3. Connect wallet
4. Purchase tokens
5. See tokens delivered
6. View transaction history
7. Update profile
8. Change settings

---

# PHASE 7: ADMIN DASHBOARD (Week 7)

## 🎯 Goal
Build administrative features for managing users, transactions, and system configuration.

## ✅ Tasks

### 7.1 Admin Middleware

**Create Admin Middleware:**
- [ ] Create `backend/src/middleware/admin.js`
- [ ] Function: `requireAdmin(req, res, next)`
- [ ] Check if user authenticated (use auth middleware first)
- [ ] Check if user role is ADMIN
- [ ] If yes, call next()
- [ ] If no, return 403 Forbidden

**Apply to Admin Routes:**
- [ ] All admin routes require both:
  - `authenticate` (from auth middleware)
  - `requireAdmin` (from admin middleware)

### 7.2 Admin Controller - User Management

**Create Admin Controller:**
- [ ] Create `backend/src/controllers/adminController.js`

**Build Get All Users Function:**
- [ ] Function: `getAllUsers(req, res)`
- [ ] Extract: page, limit, search, filter from query
- [ ] Get users with pagination
- [ ] Support search by email/name
- [ ] Support filter by:
  - Role (USER/ADMIN)
  - Status (active/suspended/banned)
  - KYC status
- [ ] Return users array and total count

**Build Get User Details Function:**
- [ ] Function: `getUserDetails(req, res)`
- [ ] Extract user ID from params
- [ ] Get full user details
- [ ] Get user transaction summary
- [ ] Return detailed user info

**Build Update User Role Function:**
- [ ] Function: `updateUserRole(req, res)`
- [ ] Extract: userId, newRole from request
- [ ] Update user role
- [ ] Log admin action
- [ ] Return success

**Build Suspend User Function:**
- [ ] Function: `suspendUser(req, res)`
- [ ] Extract: userId, reason
- [ ] Update account_status to suspended
- [ ] Invalidate all user sessions
- [ ] Log admin action
- [ ] Send notification email to user (optional)
- [ ] Return success

**Build Ban User Function:**
- [ ] Function: `banUser(req, res)`
- [ ] Extract: userId, reason
- [ ] Update account_status to banned
- [ ] Invalidate all user sessions
- [ ] Log admin action
- [ ] Return success

**Build Reactivate User Function:**
- [ ] Function: `reactivateUser(req, res)`
- [ ] Update account_status to active
- [ ] Log admin action
- [ ] Return success

### 7.3 Admin Controller - KYC Management

**Build Get Pending KYC Function:**
- [ ] Function: `getPendingKYC(req, res)`
- [ ] Get all users with kyc_status: submitted
- [ ] Sort by submission date
- [ ] Return list

**Build Approve KYC Function:**
- [ ] Function: `approveKYC(req, res)`
- [ ] Extract user ID
- [ ] Update kyc_status to approved
- [ ] Set kyc_approved_at timestamp
- [ ] Log admin action
- [ ] Send approval email to user
- [ ] Return success

**Build Reject KYC Function:**
- [ ] Function: `rejectKYC(req, res)`
- [ ] Extract: userId, reason
- [ ] Update kyc_status to rejected
- [ ] Store rejection_reason
- [ ] Log admin action
- [ ] Send rejection email to user
- [ ] Return success

### 7.4 Admin Controller - Transaction Management

**Build Get All Transactions Function:**
- [ ] Function: `getAllTransactions(req, res)`
- [ ] Extract: page, limit, search, filter from query
- [ ] Get transactions with pagination
- [ ] Support filter by:
  - Status
  - Date range
  - Amount range
  - User
- [ ] Include user information
- [ ] Return transactions and total count

**Build Get Transaction Details Function:**
- [ ] Function: `getTransactionDetails(req, res)`
- [ ] Extract transaction ID
- [ ] Get full transaction details
- [ ] Include user details
- [ ] Include Stripe details
- [ ] Include Solana details
- [ ] Return detailed info

**Build Refund Transaction Function:**
- [ ] Function: `refundTransaction(req, res)`
- [ ] Extract: transactionId, reason, amount (optional for partial)
- [ ] Get transaction details
- [ ] Verify transaction can be refunded (completed status)
- [ ] Create refund in Stripe
- [ ] Update transaction:
  - status: refunded
  - refund_amount
  - refund_reason
  - refunded_at
  - stripe_refund_id
- [ ] Log admin action
- [ ] Send refund notification email
- [ ] Return success

**Build Retry Failed Distribution Function:**
- [ ] Function: `retryDistribution(req, res)`
- [ ] Extract transaction ID
- [ ] Verify transaction is failed
- [ ] Call token distribution service
- [ ] Return result

### 7.5 Admin Controller - System Configuration

**Build Get Token Config Function:**
- [ ] Function: `getTokenConfig(req, res)`
- [ ] Get current configuration
- [ ] Get configuration history
- [ ] Return both

**Build Update Token Config Function:**
- [ ] Function: `updateTokenConfig(req, res)`
- [ ] Extract: price, min, max, limits
- [ ] Validate values
- [ ] Update configuration
- [ ] Log change with old/new values
- [ ] Return success

### 7.6 Admin Controller - Statistics

**Build Get Dashboard Stats Function:**
- [ ] Function: `getDashboardStats(req, res)`
- [ ] Get statistics:
  - Total users
  - New users today/this week/this month
  - Total transactions
  - Transactions today
  - Total revenue
  - Revenue today/this week/this month
  - Total tokens sold
  - Success rate
  - Pending KYC count
  - Failed transactions count
- [ ] Return all stats

**Build Get Revenue Report Function:**
- [ ] Function: `getRevenueReport(req, res)`
- [ ] Extract: startDate, endDate, groupBy (day/week/month)
- [ ] Aggregate revenue by period
- [ ] Include transaction counts
- [ ] Return report data

**Build Get User Growth Report Function:**
- [ ] Function: `getUserGrowthReport(req, res)`
- [ ] Extract: startDate, endDate
- [ ] Aggregate new users by day
- [ ] Calculate growth rate
- [ ] Return report data

### 7.7 Admin Routes

**Create Admin Routes:**
- [ ] Create `backend/src/routes/admin.js`
- [ ] All routes require: authenticate + requireAdmin

**User Management Routes:**
- [ ] `GET /api/admin/users` → getAllUsers
- [ ] `GET /api/admin/users/:id` → getUserDetails
- [ ] `PUT /api/admin/users/:id/role` → updateUserRole
- [ ] `PUT /api/admin/users/:id/suspend` → suspendUser
- [ ] `PUT /api/admin/users/:id/ban` → banUser
- [ ] `PUT /api/admin/users/:id/reactivate` → reactivateUser

**KYC Routes:**
- [ ] `GET /api/admin/kyc/pending` → getPendingKYC
- [ ] `PUT /api/admin/kyc/:id/approve` → approveKYC
- [ ] `PUT /api/admin/kyc/:id/reject` → rejectKYC

**Transaction Routes:**
- [ ] `GET /api/admin/transactions` → getAllTransactions
- [ ] `GET /api/admin/transactions/:id` → getTransactionDetails
- [ ] `POST /api/admin/transactions/:id/refund` → refundTransaction
- [ ] `POST /api/admin/transactions/:id/retry` → retryDistribution

**Configuration Routes:**
- [ ] `GET /api/admin/config` → getTokenConfig
- [ ] `PUT /api/admin/config` → updateTokenConfig

**Statistics Routes:**
- [ ] `GET /api/admin/stats` → getDashboardStats
- [ ] `GET /api/admin/reports/revenue` → getRevenueReport
- [ ] `GET /api/admin/reports/users` → getUserGrowthReport

### 7.8 Frontend - Admin Service

**Create Admin Service:**
- [ ] Create `frontend/src/services/adminService.js`
- [ ] All functions correspond to admin API endpoints
- [ ] Include proper error handling
- [ ] All require authentication

### 7.9 Frontend - Admin Components

**Create Admin Stats Cards:**
- [ ] Create `frontend/src/components/admin/StatsCard.jsx`
- [ ] Props: title, value, change, icon
- [ ] Show metric with percentage change
- [ ] Color code: green (up), red (down)

**Create User Management Table:**
- [ ] Create `frontend/src/components/admin/UserManagement.jsx`
- [ ] Display users in table
- [ ] Columns: name, email, role, status, KYC, registered, actions
- [ ] Actions: view details, suspend, ban, change role
- [ ] Search and filter functionality
- [ ] Pagination

**Create User Details Modal:**
- [ ] Props: userId
- [ ] Fetch user details
- [ ] Display all user information
- [ ] Show transaction summary
- [ ] Show account actions (suspend, ban, role change)

**Create Transaction Management Table:**
- [ ] Create `frontend/src/components/admin/TransactionList.jsx`
- [ ] Display transactions
- [ ] Columns: date, user, amount, tokens, status, actions
- [ ] Filter by status, date range
- [ ] Actions: view details, refund, retry
- [ ] Pagination

**Create Transaction Details Modal:**
- [ ] Props: transactionId
- [ ] Fetch transaction details
- [ ] Display all transaction info
- [ ] Show Stripe details
- [ ] Show Solana details
- [ ] Actions: refund, retry distribution

**Create Price Settings Component:**
- [ ] Create `frontend/src/components/admin/PriceSettings.jsx`
- [ ] Form to update token configuration
- [ ] Fields: price per token, min/max amounts, daily limit
- [ ] Show current values
- [ ] Confirm before updating
- [ ] Show configuration history

**Create Revenue Chart:**
- [ ] Create `frontend/src/components/admin/RevenueChart.jsx`
- [ ] Use chart library: Chart.js or Recharts
- [ ] Display revenue over time
- [ ] Show transactions count
- [ ] Date range selector

**Create User Growth Chart:**
- [ ] Create `frontend/src/components/admin/UserGrowthChart.jsx`
- [ ] Display new users over time
- [ ] Line chart
- [ ] Date range selector

**Create KYC Management Component:**
- [ ] Create `frontend/src/components/admin/KYCManagement.jsx`
- [ ] List pending KYC submissions
- [ ] Show user details
- [ ] Actions: approve, reject
- [ ] Rejection reason input

### 7.10 Frontend - Admin Pages

**Create Admin Dashboard:**
- [ ] Create `frontend/src/pages/AdminPage.jsx`
- [ ] Protected route (requires admin)
- [ ] Layout with tabs/sections

**Dashboard Tab:**
- [ ] Stats cards at top:
  - Total Users
  - Total Revenue
  - Transactions Today
  - Success Rate
  - Pending KYC
- [ ] Revenue chart
- [ ] Recent transactions
- [ ] Recent users

**Users Tab:**
- [ ] UserManagement component
- [ ] Search and filters
- [ ] User actions

**Transactions Tab:**
- [ ] TransactionList component
- [ ] Filters and search
- [ ] Export option

**KYC Tab:**
- [ ] KYCManagement component
- [ ] Pending submissions

**Settings Tab:**
- [ ] PriceSettings component
- [ ] System configuration

**Reports Tab:**
- [ ] Revenue report
- [ ] User growth report
- [ ] Export options

### 7.11 Admin Navigation

**Update Navbar:**
- [ ] If user is admin, show "Admin" link
- [ ] Opens admin dashboard

**Admin Layout:**
- [ ] Separate layout for admin pages
- [ ] Sidebar with admin navigation
- [ ] Main content area

### 7.12 Admin Permissions Check

**Frontend Route Protection:**
- [ ] Create AdminRoute component
- [ ] Check user role before rendering
- [ ] Redirect non-admins to dashboard

**Backend Verification:**
- [ ] All admin endpoints check role
- [ ] Log unauthorized access attempts

### 7.13 Admin Action Logging

**Log All Admin Actions:**
- [ ] Already have admin_actions table
- [ ] Log every admin action:
  - Who (admin ID)
  - What (action type)
  - When (timestamp)
  - Target (user/transaction ID)
  - Details (what changed)

**Admin Activity Log View:**
- [ ] Create component to view admin actions
- [ ] Filter by admin, action type, date
- [ ] Show full audit trail

### 7.14 Testing Admin Features

**Backend Testing:**
- [ ] Test all admin endpoints with Postman
- [ ] Test with admin user
- [ ] Test with regular user (should fail)
- [ ] Test user suspension flow
- [ ] Test KYC approval/rejection
- [ ] Test transaction refund
- [ ] Test configuration updates

**Frontend Testing:**
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] Test all admin functions:
  - View users
  - Suspend/ban user
  - Approve/reject KYC
  - View transactions
  - Process refund
  - Update pricing
- [ ] Verify charts display correctly
- [ ] Test filters and search

**Database Verification:**
- [ ] Check admin_actions table logs all actions
- [ ] Check suspended users can't login
- [ ] Check refunded transactions status
- [ ] Check configuration changes saved

## 📝 Deliverables for Phase 7

- ✅ Complete admin dashboard
- ✅ User management functionality
- ✅ Transaction management
- ✅ KYC approval system
- ✅ Price/configuration management
- ✅ Statistics and reports
- ✅ Admin action logging
- ✅ Charts and data visualization
- ✅ Admin permissions enforced

## 🧪 Testing Checklist

- [ ] Admin can view all users
- [ ] Admin can suspend/ban users
- [ ] Admin can change user roles
- [ ] Admin can approve/reject KYC
- [ ] Admin can view all transactions
- [ ] Admin can process refunds
- [ ] Admin can retry failed distributions
- [ ] Admin can update token pricing
- [ ] Admin can view statistics
- [ ] Admin can generate reports
- [ ] All admin actions logged
- [ ] Regular users cannot access admin features
- [ ] Charts display correctly
- [ ] Filters work properly

---

# PHASE 8: TESTING & DEPLOYMENT (Week 8)

## 🎯 Goal
Thoroughly test the entire system and deploy to production.

## ✅ Tasks

### 8.1 Comprehensive Testing

**Create Test Users:**
- [ ] Create multiple test users with different scenarios:
  - New user (just registered)
  - Verified user (email verified)
  - User with wallet connected
  - User with purchase history
  - Suspended user
  - Admin user

**Test All User Flows:**
- [ ] Registration to first purchase (complete flow)
- [ ] Multiple purchases by same user
- [ ] Password reset flow
- [ ] Profile updates
- [ ] Wallet address changes
- [ ] Session management and logout

**Test Payment Scenarios:**
- [ ] Successful payment
- [ ] Failed payment (use test card)
- [ ] Insufficient funds
- [ ] Payment declined
- [ ] Network timeout during payment
- [ ] Duplicate payment prevention

**Test Blockchain Scenarios:**
- [ ] Successful token transfer
- [ ] Failed transfer (network error)
- [ ] Retry mechanism
- [ ] Confirmation tracking
- [ ] Invalid wallet address

**Test Edge Cases:**
- [ ] Concurrent purchases
- [ ] Rate limit exceeded
- [ ] Session expiration
- [ ] Invalid tokens
- [ ] Expired tokens
- [ ] Very large purchase amounts
- [ ] Very small purchase amounts

**Test Admin Features:**
- [ ] All admin functions
- [ ] Permission enforcement
- [ ] Action logging
- [ ] Report generation

**Browser Compatibility:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

**Device Testing:**
- [ ] Desktop (various screen sizes)
- [ ] Tablet
- [ ] Mobile (iOS and Android)

### 8.2 Security Audit

**Authentication Security:**
- [ ] JWT tokens secure
- [ ] Tokens expire correctly
- [ ] Refresh tokens work
- [ ] Session invalidation works
- [ ] Password hashing strong (bcrypt, 10 rounds)

**API Security:**
- [ ] All endpoints have proper authentication
- [ ] Admin endpoints require admin role
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection (if using cookies)

**Environment Variables:**
- [ ] All secrets in .env
- [ ] .env not committed to git
- [ ] Different .env for production
- [ ] Sensitive data not logged

**Rate Limiting:**
- [ ] Rate limiting working
- [ ] Appropriate limits set
- [ ] Doesn't block legitimate users

**Stripe Security:**
- [ ] Using Stripe's secure checkout
- [ ] Webhook signature verification
- [ ] Not storing card details
- [ ] PCI compliance maintained

**Solana Security:**
- [ ] Private keys secure
- [ ] Not exposed in code or logs
- [ ] Treasury wallet secure
- [ ] Transaction signing secure

### 8.3 Performance Testing

**Load Testing:**
- [ ] Test with multiple concurrent users
- [ ] Measure response times
- [ ] Identify bottlenecks
- [ ] Database query optimization

**Database Performance:**
- [ ] Indexes working
- [ ] Queries optimized
- [ ] Connection pooling efficient
- [ ] No N+1 query problems

**Frontend Performance:**
- [ ] Bundle size reasonable
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Fast initial load

**API Response Times:**
- [ ] Most endpoints < 200ms
- [ ] Payment endpoints < 500ms
- [ ] Blockchain operations < 5s

### 8.4 Error Handling & Logging

**Error Handling Complete:**
- [ ] All errors caught
- [ ] User-friendly error messages
- [ ] Technical details logged
- [ ] No sensitive info in errors

**Logging Setup:**
- [ ] Important events logged
- [ ] Error logging comprehensive
- [ ] Log levels appropriate
- [ ] Logs useful for debugging

**Monitoring Setup:**
- [ ] Set up error monitoring (Sentry, optional)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Alert on critical errors

### 8.5 Documentation

**API Documentation:**
- [ ] Create `docs/API.md`
- [ ] Document all endpoints
- [ ] Include request/response examples
- [ ] Document error codes

**Setup Documentation:**
- [ ] Create `docs/SETUP.md`
- [ ] Step-by-step setup instructions
- [ ] Requirements listed
- [ ] Environment variables explained

**Deployment Documentation:**
- [ ] Create `docs/DEPLOYMENT.md`
- [ ] Deployment steps
- [ ] Server requirements
- [ ] Environment setup

**User Guide:**
- [ ] How to register
- [ ] How to connect wallet
- [ ] How to purchase tokens
- [ ] How to view history

**Admin Guide:**
- [ ] Admin features explained
- [ ] User management procedures
- [ ] Configuration management
- [ ] Handling issues

### 8.6 Prepare for Production

**Production Environment Setup:**

**Server Setup:**
- [ ] Choose hosting provider:
  - Option 1: Railway (easy, good for MVP)
  - Option 2: Heroku (popular, easy)
  - Option 3: DigitalOcean/AWS (more control)
  - Option 4: VPS (most control, more work)
- [ ] Set up server
- [ ] Configure firewall
- [ ] Set up SSL certificate (HTTPS)

**Database Setup:**
- [ ] Set up production MySQL database
- [ ] Could be same server or separate (e.g., AWS RDS)
- [ ] Run database script
- [ ] Set up automated backups
- [ ] Configure backup schedule (daily recommended)

**Production Environment Variables:**
- [ ] Create production .env file
- [ ] Use strong JWT secret (generate random 64 chars)
- [ ] Production Stripe keys (switch from test to live)
- [ ] Production Solana wallet (IMPORTANT: Secure this)
- [ ] Production email service
- [ ] Set NODE_ENV=production

**Domain & DNS:**
- [ ] Purchase domain name (if you want)
- [ ] Configure DNS
- [ ] Point to server IP
- [ ] Wait for propagation (up to 48 hours)

**SSL Certificate:**
- [ ] Use Let's Encrypt (free)
- [ ] Use hosting provider's SSL
- [ ] Configure HTTPS redirect
- [ ] Test certificate

### 8.7 Mainnet Preparation (Solana)

**⚠️ CRITICAL: Moving to Mainnet**

This is the most critical and expensive part. Be very careful.

**Create Mainnet Wallet:**
- [ ] Create new mainnet wallet (NOT devnet)
- [ ] Command: `solana-keygen new --outfile ~/cdx-mainnet-treasury.json`
- [ ] **BACKUP THIS FILE SECURELY**
- [ ] Store in multiple secure locations
- [ ] Consider hardware wallet for maximum security

**Fund Wallet with SOL:**
- [ ] You need real SOL for:
  - Creating token (~0.01 SOL)
  - Transaction fees (~0.000005 SOL per transaction)
- [ ] Purchase SOL from exchange (Coinbase, Binance, etc.)
- [ ] Transfer to your mainnet wallet

**Create Mainnet Token:**
- [ ] Switch to mainnet: `solana config set --url mainnet-beta`
- [ ] Create token: `spl-token create-token`
- [ ] Create token account: `spl-token create-account <TOKEN_MINT>`
- [ ] Mint total supply: `spl-token mint <TOKEN_MINT> <AMOUNT>`
- [ ] Disable minting (optional but recommended):
  - `spl-token authorize <TOKEN_MINT> mint --disable`
- [ ] Save token mint address

**Update Production Environment:**
- [ ] Update SOLANA_RPC_URL to mainnet
- [ ] Update SOLANA_TREASURY_PRIVATE_KEY
- [ ] Update CDX_TOKEN_MINT_ADDRESS
- [ ] Update CDX_TREASURY_TOKEN_ACCOUNT

**Cost Estimates:**
- [ ] SOL needed:
  - Token creation: ~0.02 SOL
  - Per transaction: ~0.000005 SOL
  - Initial fund: 1-2 SOL recommended (~$30-60 at current prices)

### 8.8 Final Security Checks

**Before Going Live:**
- [ ] Change default admin password
- [ ] Verify no test data in database
- [ ] Remove test endpoints
- [ ] Verify rate limiting active
- [ ] Check all environment variables correct
- [ ] Verify error messages don't expose sensitive info
- [ ] Check CORS settings (only allow your domain)
- [ ] Verify Stripe webhook signature checking enabled
- [ ] Test with production Stripe keys
- [ ] Test with mainnet Solana (small amount first)

### 8.9 Deployment

**Build Frontend:**
- [ ] Run: `npm run build`
- [ ] Test build locally: `serve -s build`
- [ ] Verify all routes work
- [ ] Verify environment variables loaded

**Deploy Backend:**
- [ ] Push code to Git repository
- [ ] Deploy to server
- [ ] Install dependencies: `npm install --production`
- [ ] Set up environment variables
- [ ] Start server with PM2 or similar
- [ ] Verify server running

**Deploy Frontend:**
- [ ] Deploy build folder to server or CDN
- [ ] Options:
  - Same server as backend (serve with nginx)
  - Separate server
  - CDN (Netlify, Vercel, Cloudflare Pages)
- [ ] Configure for SPA routing
- [ ] Verify all pages load

**Configure Web Server:**
- [ ] If using nginx:
  - Proxy API requests to backend
  - Serve frontend static files
  - Configure SSL
  - Set up redirects
- [ ] Test all routes work

**Database Migration:**
- [ ] Run production database script
- [ ] Verify all tables created
- [ ] Set up database backups
- [ ] Create database user for app
- [ ] Grant only necessary permissions

**Configure Stripe Webhook:**
- [ ] In Stripe Dashboard
- [ ] Add production webhook endpoint
- [ ] Select events to listen for
- [ ] Get webhook secret
- [ ] Add to production .env

### 8.10 Post-Deployment Testing

**Smoke Testing:**
- [ ] Visit website
- [ ] Register new user
- [ ] Verify email
- [ ] Login
- [ ] Connect wallet (real wallet)
- [ ] Make small test purchase (real money)
- [ ] Verify tokens received
- [ ] Check transaction history
- [ ] Test admin functions

**Monitor After Launch:**
- [ ] Watch logs for errors
- [ ] Monitor server resources
- [ ] Monitor database performance
- [ ] Check email deliverability
- [ ] Monitor transaction success rate

### 8.11 Backup & Recovery

**Set Up Backups:**
- [ ] Database backups (automated daily)
- [ ] Code backups (git repository)
- [ ] Environment backups (secure storage)
- [ ] Wallet backups (CRITICAL - multiple locations)

**Test Recovery:**
- [ ] Test database restore
- [ ] Test server recovery
- [ ] Have disaster recovery plan

### 8.12 Launch Checklist

**Final Checks Before Launch:**
- [ ] ✅ All tests passing
- [ ] ✅ Security audit complete
- [ ] ✅ Documentation complete
- [ ] ✅ Production environment configured
- [ ] ✅ Mainnet token created (if launching on mainnet)
- [ ] ✅ SSL certificate active
- [ ] ✅ Monitoring set up
- [ ] ✅ Backups configured
- [ ] ✅ Tested end-to-end on production
- [ ] ✅ Admin account secured
- [ ] ✅ Support contact available
- [ ] ✅ Legal terms and privacy policy ready (if needed)

**Launch:**
- [ ] Make final announcement
- [ ] Monitor closely for first 24 hours
- [ ] Be ready for support requests
- [ ] Collect user feedback

### 8.13 Post-Launch

**Week 1 After Launch:**
- [ ] Monitor daily
- [ ] Check error logs
- [ ] Review transaction success rate
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately

**Ongoing Maintenance:**
- [ ] Regular security updates
- [ ] Database maintenance
- [ ] Monitor server health
- [ ] Review and improve based on feedback
- [ ] Keep dependencies updated

## 📝 Deliverables for Phase 8

- ✅ Comprehensive testing complete
- ✅ Security audit passed
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Production environment set up
- ✅ Application deployed
- ✅ Backups configured
- ✅ Monitoring in place
- ✅ Successfully launched

## 🎯 Success Criteria

- [ ] Application accessible at production URL
- [ ] Users can register and login
- [ ] Users can purchase tokens with real money
- [ ] Tokens delivered automatically
- [ ] All features working in production
- [ ] No critical bugs
- [ ] Response times acceptable
- [ ] Security measures active
- [ ] Admin dashboard functional

---

# 🎉 CONGRATULATIONS!

You've completed building a production-ready cryptocurrency token purchase platform!

## 📊 What You've Built

- ✅ Complete user authentication system
- ✅ Stripe payment integration
- ✅ Solana blockchain integration
- ✅ Automatic token distribution
- ✅ Admin dashboard
- ✅ Transaction management
- ✅ Email notifications
- ✅ Security features
- ✅ Professional UI/UX
- ✅ Production deployment

## 🚀 Next Steps (Future Enhancements)

**Phase 9: Additional Features (Optional)**
- [ ] KYC verification integration
- [ ] Two-factor authentication
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Token staking features
- [ ] Referral program
- [ ] Advanced analytics
- [ ] API for third-party integration
- [ ] Batch token distributions
- [ ] White-label solution

**Continuous Improvement:**
- [ ] Gather user feedback
- [ ] Monitor analytics
- [ ] A/B test features
- [ ] Optimize performance
- [ ] Add requested features
- [ ] Improve documentation

## 📚 Resources for Learning More

- Solana Documentation: docs.solana.com
- Stripe Documentation: stripe.com/docs
- React Documentation: react.dev
- Node.js Best Practices: github.com/goldbergyoni/nodebestpractices

## 💡 Remember

- Always test thoroughly before deploying changes
- Keep security as top priority
- Listen to user feedback
- Document everything
- Keep learning and improving

Good luck with your CDX platform! 🚀
