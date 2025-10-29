import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import authService from '../../services/authService';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-green-800 font-medium">Check Your Email</h3>
          </div>
          <p className="text-green-700 text-sm">
            If an account exists with that email, you will receive a password reset link shortly.
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/login')}
          fullWidth
          variant="secondary"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-gray-600 text-sm mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
      />

      <Button
        type="submit"
        loading={loading}
        fullWidth
      >
        Send Reset Link
      </Button>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Login here
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;