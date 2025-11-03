import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import UserRoute from './components/common/UserRoute';
import Navbar from './components/common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './user/pages/DashboardPage';
import PurchasePage from './user/pages/PurchasePage';
import ProfilePage from './user/pages/ProfilePage';
import AdminPage from './admin/pages/AdminPage';

// Components
import PurchaseSuccess from './components/payment/PurchaseSuccess';
import TransactionHistory from './user/components/TransactionHistory';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* User-only routes with Navbar */}
            <Route
              path="/dashboard"
              element={
                <UserRoute>
                  <>
                    <Navbar />
                    <DashboardPage />
                  </>
                </UserRoute>
              }
            />
            <Route
              path="/purchase"
              element={
                <UserRoute>
                  <>
                    <Navbar />
                    <PurchasePage />
                  </>
                </UserRoute>
              }
            />
            <Route
              path="/purchase/success"
              element={
                <UserRoute>
                  <>
                    <Navbar />
                    <PurchaseSuccess />
                  </>
                </UserRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <UserRoute>
                  <>
                    <Navbar />
                    <ProfilePage />
                  </>
                </UserRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <UserRoute>
                  <>
                    <Navbar />
                    <div className="container mx-auto py-8 px-4">
                      <TransactionHistory />
                    </div>
                  </>
                </UserRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;