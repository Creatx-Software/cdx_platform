import React, { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import authService from '../../services/authService';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ChangePasswordModal from './ChangePasswordModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
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
      const response = await api.get('/transactions/stats');

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
      const response = await api.put('/user/profile', formData);

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
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card-premium overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 px-8 py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/90 to-primary-600/90"></div>
          <div className="relative flex items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/20">
              <UserIcon className="w-12 h-12 text-primary-600" />
            </div>
            <div className="ml-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.first_name || 'User'} {user?.last_name || ''}
              </h1>
              <p className="text-primary-100 text-lg mb-3">{user?.email}</p>
              <div className="flex items-center">
                {user?.email_verified ? (
                  <div className="flex items-center bg-accent-success/20 text-white px-3 py-1 rounded-full">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Email Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-accent-error/20 text-white px-3 py-1 rounded-full">
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Email Not Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="px-8 py-8">
          {success && (
            <div className="alert-success mb-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-accent-success flex-shrink-0 mt-0.5" />
                <p className="text-sm ml-3">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="alert-error mb-6">
              <div className="flex items-start">
                <XCircleIcon className="h-5 w-5 text-accent-error flex-shrink-0 mt-0.5" />
                <p className="text-sm ml-3">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="title-card">Personal Information</h2>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant="primary"
              className="px-6 py-3"
            >
              <span className="flex items-center">
                {editMode ? (
                  <>
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </span>
            </Button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="max-w-sm"
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="max-w-sm"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  loading={updating}
                  variant="primary"
                  className="px-6 py-2"
                >
                  <span className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditMode(false)}
                  variant="secondary"
                  className="px-6 py-2"
                >
                  <span className="flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-text-muted">Full Name</p>
                    <p className="font-semibold text-text-primary">{user?.first_name || 'Not set'} {user?.last_name || ''}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-text-muted">Email Address</p>
                    <p className="font-semibold text-text-primary">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-text-muted">Member Since</p>
                    <p className="font-semibold text-text-primary">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              {userStats && (
                <div className="space-y-6">
                  <h3 className="title-card">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-gold p-6 text-center transform hover-scale">
                      <p className="text-3xl font-bold text-gradient mb-2">
                        {formatNumber(userStats.total_tokens)}
                      </p>
                      <p className="text-sm text-text-muted">CDX Tokens</p>
                    </div>
                    <div className="card-gold p-6 text-center transform hover-scale">
                      <p className="text-3xl font-bold text-gradient mb-2">
                        {formatCurrency(userStats.total_spent)}
                      </p>
                      <p className="text-sm text-text-muted">Total Spent</p>
                    </div>
                    <div className="card-gold p-6 text-center transform hover-scale">
                      <p className="text-3xl font-bold text-gradient mb-2">
                        {formatNumber(userStats.total_transactions)}
                      </p>
                      <p className="text-sm text-text-muted">Transactions</p>
                    </div>
                    <div className="card-gold p-6 text-center transform hover-scale">
                      <p className="text-3xl font-bold text-gradient mb-2">
                        {formatCurrency(userStats.pending_amount)}
                      </p>
                      <p className="text-sm text-text-muted">Pending</p>
                    </div>
                  </div>
                  {/* View All Transactions Link */}
                  <div className="mt-6">
                    <a
                      href="/transactions"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors group"
                    >
                      View All Transactions
                      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="card-premium mt-8 p-8">
        <h2 className="title-card mb-6">Security</h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-border-light">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Email Verification</p>
                <p className="text-sm text-text-muted mt-1">
                  {user?.email_verified ? 'Your email is verified' : 'Please verify your email address'}
                </p>
              </div>
            </div>
            {!user?.email_verified && (
              <Button variant="primary" className="px-6 py-3">
                <span className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Resend Verification
                </span>
              </Button>
            )}
          </div>
          <div className="flex justify-between items-center py-4 border-b border-border-light">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Password</p>
                <p className="text-sm text-text-muted mt-1">Last updated: Never</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="px-6 py-3"
              onClick={() => setShowChangePasswordModal(true)}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </span>
            </Button>
          </div>
          <div className="flex items-start py-4">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Last Login</p>
              <p className="text-sm text-text-muted mt-1">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={(message) => {
          setSuccess(message);
          setTimeout(() => setSuccess(null), 5000);
        }}
      />
    </div>
  );
};

export default Profile;