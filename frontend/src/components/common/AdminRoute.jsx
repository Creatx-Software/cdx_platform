import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ AdminRoute check:', {
    loading,
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    role: user?.role
  });

  if (loading) {
    console.log('⏳ AdminRoute: Still loading...');
    return <Loader message="Checking permissions..." />;
  }

  if (!user) {
    console.log('❌ AdminRoute: No user - redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    console.log('⚠️ AdminRoute: User is not admin (role:', user.role, ') - redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AdminRoute: Access granted for admin');
  return children;
};

export default AdminRoute;