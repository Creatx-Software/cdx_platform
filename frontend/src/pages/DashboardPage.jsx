import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleBuyTokens = () => {
    navigate('/purchase');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CDX Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been set up successfully.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Account Info</h3>
                <p className="text-sm text-gray-600">Email: {user?.email}</p>
                <p className="text-sm text-gray-600">Role: {user?.role}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Wallet Status</h3>
                <p className="text-sm text-gray-600">
                  {user?.walletAddress ? 'Connected' : 'Not Connected'}
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
                <Button fullWidth variant="secondary" onClick={handleBuyTokens}>
                  Buy Tokens
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;