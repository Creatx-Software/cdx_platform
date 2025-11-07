import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, isAuthenticated } = useAuth();
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowVerifiedMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  // Show loading while checking authentication
  if (loading) {
    return <Loader message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="title-section text-center text-3xl font-extrabold">
            <span className="text-gradient">
              {isAuthenticated ? 'Already Signed In' : 'Sign in to your account'}
            </span>
          </h2>
          <p className="mt-3 text-center text-text-muted">
            {isAuthenticated ? 'You are already logged in' : 'Access your CDX token dashboard'}
          </p>
        </div>

        {showVerifiedMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">Email verified successfully! You can now log in.</p>
            </div>
          </div>
        )}

        <div className="card-premium p-8 transform hover-scale-sm">
          {isAuthenticated ? (
            <div className="text-center space-y-6">
              <div className="w-12 h-12 bg-accent-success rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-muted">You are already signed in to your account.</p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/dashboard')} fullWidth variant="primary" className="py-3">
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    Go to Dashboard
                  </span>
                </Button>
                <Button onClick={() => navigate('/')} fullWidth variant="secondary" className="py-3">
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Home
                  </span>
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