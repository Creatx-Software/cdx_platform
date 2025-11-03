import React, { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import authService from '../../services/authService';
import Loader from '../common/Loader';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userInfo = authService.getCurrentUser();
      setUser(userInfo);
      setFormData({
        first_name: userInfo.first_name || '',
        last_name: userInfo.last_name || ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile information');
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/transactions/stats');

      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/api/user/profile', formData);

      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setEditMode(false);

        // Update local user data
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        authService.setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
  };

  if (loading && !user) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-gray-600" />
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-blue-100 mt-1">{user?.email}</p>
              <div className="flex items-center mt-2">
                {user?.email_verified ? (
                  <div className="flex items-center text-green-200">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Email Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-200">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Email Not Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="px-6 py-6">
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              {userStats && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(userStats.total_tokens)}
                      </p>
                      <p className="text-sm text-gray-600">CDX Tokens</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(userStats.total_spent)}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatNumber(userStats.total_transactions)}
                      </p>
                      <p className="text-sm text-gray-600">Transactions</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(userStats.pending_amount)}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                  {/* View All Transactions Link */}
                  <div className="mt-4">
                    <a
                      href="/transactions"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Transactions →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white shadow rounded-lg mt-8 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium">Email Verification</p>
              <p className="text-sm text-gray-500">
                {user?.email_verified ? 'Your email is verified' : 'Please verify your email address'}
              </p>
            </div>
            {!user?.email_verified && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                Resend Verification
              </button>
            )}
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-500">Last updated: Never</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm">
              Change Password
            </button>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium">Last Login</p>
              <p className="text-sm text-gray-500">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;