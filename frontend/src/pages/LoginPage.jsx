import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <Loader message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAuthenticated ? 'Already Signed In' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isAuthenticated ? 'You are already logged in' : 'Access your CDX token dashboard'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {isAuthenticated ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">You are already signed in to your account.</p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Back to Home
                </Button>
              </div>
            </div>
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;