import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = () => {
      // Validate session (checks token expiration)
      if (authService.validateSession()) {
        const storedUser = authService.getCurrentUser();
        const storedToken = authService.getToken();

        setUser(storedUser);
        setToken(storedToken);
      } else {
        // Clear invalid/expired session
        setUser(null);
        setToken(null);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const loginUser = async (email, password) => {
    console.log('🔑 AuthContext.loginUser called for:', email);
    const data = await authService.login(email, password);
    console.log('📦 Login response data:', {
      hasUser: !!data.user,
      userId: data.user?.id,
      userEmail: data.user?.email,
      userRole: data.user?.role,
      hasToken: !!data.token
    });
    setUser(data.user);
    setToken(data.token);
    console.log('✅ AuthContext state updated - user:', data.user?.email, 'role:', data.user?.role);
    return data;
  };

  // Register
  const registerUser = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  // Logout
  const logoutUser = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  // Update user
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    loginUser,
    registerUser,
    logoutUser,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};