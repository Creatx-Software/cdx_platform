import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <Loader message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            CDX Token Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Buy cryptocurrency tokens with your credit card
          </p>

          {/* Show different buttons based on auth status and role */}
          <div className="flex justify-center space-x-4 mb-12">
            {isAuthenticated ? (
              user?.role === 'ADMIN' ? (
                /* Admin buttons */
                <>
                  <Button onClick={() => navigate('/admin')}>
                    Go to Admin Panel
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outline">
                    Back to Home
                  </Button>
                </>
              ) : (
                /* User buttons */
                <>
                  <Button onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                  <Button onClick={() => navigate('/purchase')} variant="secondary">
                    Buy Tokens
                  </Button>
                </>
              )
            ) : (
              /* Guest buttons */
              <>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button onClick={() => navigate('/login')} variant="secondary">
                  Sign In
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-4xl mb-4">💳</div>
              <h3 className="text-lg font-semibold mb-2">Easy Payment</h3>
              <p className="text-gray-600 text-sm">
                Purchase tokens with credit card or debit card
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Delivery</h3>
              <p className="text-gray-600 text-sm">
                Tokens delivered to your wallet automatically
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Safe</h3>
              <p className="text-gray-600 text-sm">
                Bank-level security for all transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;