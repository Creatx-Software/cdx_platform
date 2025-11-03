import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users to admin panel
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default UserRoute;