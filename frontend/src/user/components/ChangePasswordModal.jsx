import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      if (response.data.success) {
        onSuccess('Password changed successfully');
        handleClose();
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setError(null);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-md">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
              <LockClosedIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="title-card">Change Password</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="alert-error mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="form-group">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-11 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-11 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-11 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            variant="primary"
            className="px-6 py-2"
          >
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;