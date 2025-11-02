# CDX Token Purchase Platform - Project Structure

## 📁 Complete Directory Structure

```
cdx-platform/
│
├── backend/                          # Server-side application
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js          # MySQL connection setup
│   │   │   ├── stripe.js            # Stripe configuration
│   │   │   ├── solana.js            # Solana blockchain setup
│   │   │   └── email.js             # Email service configuration
│   │   │
│   │   ├── models/                   # Database models
│   │   │   ├── User.js              # User model & database queries
│   │   │   ├── Transaction.js       # Transaction model
│   │   │   ├── TokenConfig.js       # Token configuration model
│   │   │   └── index.js             # Export all models
│   │   │
│   │   ├── controllers/              # Business logic
│   │   │   ├── authController.js    # Registration, login, verification
│   │   │   ├── userController.js    # User profile, wallet management
│   │   │   ├── paymentController.js # Stripe payment processing
│   │   │   ├── tokenController.js   # Token distribution
│   │   │   ├── transactionController.js  # Transaction history
│   │   │   ├── adminController.js   # Admin operations
│   │   │   └── webhookController.js # Stripe webhook handler
│   │   │
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth.js              # /api/auth/* routes
│   │   │   ├── user.js              # /api/user/* routes
│   │   │   ├── payment.js           # /api/payment/* routes
│   │   │   ├── transaction.js       # /api/transaction/* routes
│   │   │   ├── admin.js             # /api/admin/* routes
│   │   │   └── webhook.js           # /api/webhook/* routes
│   │   │
│   │   ├── middleware/               # Request interceptors
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── admin.js             # Admin role check
│   │   │   ├── rateLimiter.js       # Rate limiting
│   │   │   ├── validator.js         # Input validation
│   │   │   └── errorHandler.js      # Global error handling
│   │   │
│   │   ├── services/                 # External service integrations
│   │   │   ├── stripeService.js     # Stripe API interactions
│   │   │   ├── solanaService.js     # Blockchain interactions
│   │   │   ├── emailService.js      # Email sending
│   │   │   └── kycService.js        # KYC verification (future)
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── jwt.js               # JWT token generation/verification
│   │   │   ├── bcrypt.js            # Password hashing
│   │   │   ├── validators.js        # Validation helpers
│   │   │   ├── logger.js            # Logging utility
│   │   │   └── helpers.js           # General helper functions
│   │   │
│   │   ├── templates/                # Email templates
│   │   │   ├── verification.html    # Email verification template
│   │   │   ├── welcome.html         # Welcome email
│   │   │   ├── passwordReset.html   # Password reset email
│   │   │   └── purchaseConfirmation.html  # Purchase confirmation
│   │   │
│   │   └── app.js                    # Express app setup
│   │
│   ├── tests/                        # Test files (optional for now)
│   │   ├── auth.test.js
│   │   ├── payment.test.js
│   │   └── token.test.js
│   │
│   ├── .env.example                  # Environment variables template
│   ├── .env                          # Actual environment variables (NOT in git)
│   ├── .gitignore                    # Git ignore file
│   ├── package.json                  # Node.js dependencies
│   ├── server.js                     # Server entry point
│   └── README.md                     # Backend documentation
│
├── frontend/                         # Client-side application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/                   # Static assets
│   │       ├── images/
│   │       └── icons/
│   │
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── common/              # Generic components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   │
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ResetPasswordForm.jsx
│   │   │   │
│   │   │   ├── user/                # User-related components
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── WalletConnect.jsx
│   │   │   │   └── TransactionHistory.jsx
│   │   │   │
│   │   │   ├── payment/             # Payment components
│   │   │   │   ├── TokenPurchase.jsx
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   └── PurchaseSuccess.jsx
│   │   │   │
│   │   │   └── admin/               # Admin components
│   │   │       ├── Dashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── TransactionList.jsx
│   │   │       └── PriceSettings.jsx
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PurchasePage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── services/                 # API communication
│   │   │   ├── api.js               # Axios setup & interceptors
│   │   │   ├── authService.js       # Auth API calls
│   │   │   ├── userService.js       # User API calls
│   │   │   ├── paymentService.js    # Payment API calls
│   │   │   └── adminService.js      # Admin API calls
│   │   │
│   │   ├── context/                  # React Context (state management)
│   │   │   ├── AuthContext.jsx      # User authentication state
│   │   │   └── ThemeContext.jsx     # Theme/UI state (optional)
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js           # Authentication hook
│   │   │   ├── useWallet.js         # Wallet connection hook
│   │   │   └── useTransaction.js    # Transaction management hook
│   │   │
│   │   ├── utils/                    # Frontend utilities
│   │   │   ├── validators.js        # Form validation
│   │   │   ├── formatters.js        # Data formatting (dates, currency)
│   │   │   └── constants.js         # App constants
│   │   │
│   │   ├── styles/                   # CSS files
│   │   │   ├── global.css           # Global styles
│   │   │   ├── variables.css        # CSS variables
│   │   │   └── components.css       # Component styles
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   ├── index.jsx                 # Entry point
│   │   └── routes.jsx                # Route definitions
│   │
│   ├── .env.example                  # Frontend environment variables template
│   ├── .env                          # Actual frontend env vars (NOT in git)
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── README.md
│
├── database/                         # Database related files
│   ├── schema.sql                    # Your MySQL database script
│   ├── migrations/                   # Database migrations (optional)
│   └── seeds/                        # Test data (optional)
│
├── docs/                             # Documentation
│   ├── API.md                        # API documentation
│   ├── SETUP.md                      # Setup instructions
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── TROUBLESHOOTING.md            # Common issues & solutions
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Initial setup script
│   ├── deploy.sh                     # Deployment script
│   └── backup.sh                     # Database backup script
│
├── .gitignore                        # Root gitignore
├── docker-compose.yml                # Docker setup (optional)
├── README.md                         # Main project documentation
└── LICENSE                           # License file
```

## 📝 File Purpose Explanations

### Backend Files

#### **Configuration (`config/`)**
- `database.js` - MySQL connection pool setup
- `stripe.js` - Stripe API key and configuration
- `solana.js` - Solana RPC connection and wallet setup
- `email.js` - Email service (SendGrid, AWS SES, etc.)

#### **Models (`models/`)**
Database interaction layer. Each file contains:
- SQL query functions
- Data validation
- CRUD operations for a specific table

Example: `User.js` has `createUser()`, `findUserByEmail()`, `updateUser()`

#### **Controllers (`controllers/`)**
Business logic handlers. Each function:
- Receives HTTP request
- Processes data
- Calls models/services
- Returns HTTP response

Example: `authController.js` has `register()`, `login()`, `verifyEmail()`

#### **Routes (`routes/`)**
API endpoint definitions. Maps URLs to controllers.

Example:
```javascript
POST /api/auth/register → authController.register
POST /api/auth/login → authController.login
```

#### **Middleware (`middleware/`)**
Functions that run before controllers:
- `auth.js` - Checks if user is logged in (JWT verification)
- `admin.js` - Checks if user is admin
- `rateLimiter.js` - Prevents API abuse
- `validator.js` - Validates request data
- `errorHandler.js` - Catches and formats errors

#### **Services (`services/`)**
External API integrations:
- `stripeService.js` - Create payments, process refunds
- `solanaService.js` - Send tokens, check transactions
- `emailService.js` - Send emails
- `kycService.js` - Future KYC integration

#### **Utils (`utils/`)**
Helper functions used across the app:
- `jwt.js` - Create/verify authentication tokens
- `bcrypt.js` - Hash/compare passwords
- `validators.js` - Email, wallet address validation
- `logger.js` - Log important events
- `helpers.js` - Miscellaneous utilities

### Frontend Files

#### **Components (`components/`)**
Organized by feature area:
- `common/` - Used everywhere (buttons, inputs)
- `auth/` - Login, registration forms
- `user/` - User-specific features
- `payment/` - Purchase flow
- `admin/` - Admin dashboard components

#### **Pages (`pages/`)**
Full page views that use multiple components.

Example: `PurchasePage.jsx` uses:
- Navbar (common)
- TokenPurchase (payment)
- PaymentForm (payment)

#### **Services (`services/`)**
API communication layer. All backend calls go through here.

Example:
```javascript
authService.login(email, password)
paymentService.createPayment(amount)
```

#### **Context (`context/`)**
Global state management:
- `AuthContext` - Current user info, login status
- Shared across all components without prop drilling

#### **Hooks (`hooks/`)**
Reusable React logic:
- `useAuth()` - Access current user
- `useWallet()` - Wallet connection logic
- `useTransaction()` - Transaction state management

## 🎯 Key Project Files

### **Backend Entry Point**

**`backend/server.js`** - Starts the server
```javascript
const app = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**`backend/src/app.js`** - Express app configuration
```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
```

### **Frontend Entry Point**

**`frontend/src/index.jsx`**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

**`frontend/src/App.jsx`**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* More routes */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

## 🔐 Environment Variables

### **Backend `.env`**
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=cdx_app
DB_PASSWORD=your_password
DB_NAME=cdx_platform
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TREASURY_PRIVATE_KEY=your_private_key
CDX_TOKEN_MINT_ADDRESS=your_token_address

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_api_key
EMAIL_FROM=noreply@cdxplatform.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend `.env`**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

## 📦 Package.json Examples

### **Backend `package.json`**
```json
{
  "name": "cdx-platform-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "stripe": "^13.0.0",
    "@solana/web3.js": "^1.87.0",
    "@solana/spl-token": "^0.3.9",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.5",
    "validator": "^13.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

### **Frontend `package.json`**
```json
{
  "name": "cdx-platform-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "axios": "^1.5.0",
    "@stripe/react-stripe-js": "^2.3.0",
    "@stripe/stripe-js": "^2.1.0",
    "@solana/wallet-adapter-react": "^0.15.32",
    "@solana/wallet-adapter-wallets": "^0.19.20",
    "tailwindcss": "^3.3.3"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

## 🚀 How to Use This Structure

### **Step 1: Create the Structure**
```bash
# Create backend
mkdir -p backend/src/{config,models,controllers,routes,middleware,services,utils,templates}

# Create frontend
mkdir -p frontend/src/{components/{common,auth,user,payment,admin},pages,services,context,hooks,utils,styles}

# Create other directories
mkdir -p database docs scripts
```

### **Step 2: Initialize Projects**
```bash
# Initialize backend
cd backend
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken stripe @solana/web3.js cors helmet express-rate-limit dotenv

# Initialize frontend
cd ../frontend
npx create-react-app .
npm install axios react-router-dom @stripe/react-stripe-js @stripe/stripe-js
```

### **Step 3: Create Configuration Files**
1. Copy `.env.example` to `.env` in both folders
2. Fill in your actual credentials
3. Create `.gitignore` files

### **Step 4: Start Building**
Follow the development roadmap from the previous guide:
1. Database setup ✅ (You already have this!)
2. Backend authentication
3. Payment integration
4. Blockchain integration
5. Frontend UI
6. Admin panel

## 🎨 Why This Structure?

### ✅ **Organized by Feature**
Each feature has its own folder, making it easy to find related files.

### ✅ **Separation of Concerns**
- Models handle database
- Controllers handle logic
- Routes handle endpoints
- Services handle external APIs

### ✅ **Scalable**
Easy to add new features without restructuring.

### ✅ **Maintainable**
Clear naming and organization makes it easy for others to understand.

### ✅ **Industry Standard**
Follows common patterns used in professional applications.

## 📚 Next Steps

1. **Create the folder structure** using the commands above
2. **Set up package.json** for both backend and frontend
3. **Install dependencies** for both projects
4. **Create .env files** with your configuration
5. **Start with authentication** - Build register/login first

This structure will grow with your project but provides a solid foundation to start building! 🚀
