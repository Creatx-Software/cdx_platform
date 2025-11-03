import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="title-section text-center text-3xl font-extrabold">
            <span className="text-gradient">
              {isAuthenticated ? 'Already Signed In' : 'Create your account'}
            </span>
          </h2>
          <p className="mt-3 text-center text-text-muted">
            {isAuthenticated ? 'You are already logged in' : 'Start buying CDX tokens today'}
          </p>
        </div>

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
            <RegisterForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;