import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrors({ submit: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 Attempting login for:', formData.email);
      const result = await loginUser(formData.email, formData.password);

      console.log('✅ Login successful! Result:', {
        hasUser: !!result.user,
        userId: result.user?.id,
        email: result.user?.email,
        role: result.user?.role,
        hasToken: !!result.token
      });

      // Role-based redirection
      if (result.user.role === 'ADMIN') {
        console.log('🔑 Admin role detected - redirecting to /admin');
        navigate('/admin');
      } else {
        console.log('👤 User role detected - redirecting to /dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Login failed:', {
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
        fullError: error
      });
      setErrors({
        submit: error.response?.data?.error || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="form-group">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            className="input-field transform focus:scale-105 transition-transform"
            required
          />
        </div>

        <div className="form-group">
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            className="input-field transform focus:scale-105 transition-transform"
            required
          />
        </div>
      </div>

      {errors.submit && (
        <div className="alert-error">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-accent-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm ml-3">{errors.submit}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors group"
        >
          <span className="flex items-center">
            Forgot password?
            <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>

      <Button
        type="submit"
        loading={loading}
        fullWidth
        className="py-4 text-lg font-medium"
      >
        <span className="flex items-center justify-center">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-light"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background-primary text-text-muted">New to CDX Platform?</span>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors group"
        >
          <span className="flex items-center">
            Create your account
            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </form>
  );
};

export default LoginForm;