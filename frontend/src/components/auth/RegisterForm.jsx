import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-accent-success to-primary-500 shadow-lg animate-bounce">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="title-card text-gradient mb-3">Registration Successful!</h3>
          <p className="text-text-muted">{successMessage}</p>
        </div>
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-center text-sm text-text-muted">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"></div>
            Redirecting you to login page in a few seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              className="input-field transform focus:scale-105 transition-transform"
              required
            />
          </div>
          <div className="form-group">
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              className="input-field transform focus:scale-105 transition-transform"
              required
            />
          </div>
        </div>

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
          <div className="mt-2 text-xs text-text-muted">
            Must contain uppercase, lowercase, and number (minimum 8 characters)
          </div>
        </div>

        <div className="form-group">
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
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

      <Button
        type="submit"
        loading={loading}
        fullWidth
        className="py-4 text-lg font-medium"
      >
        <span className="flex items-center justify-center">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Create Account
        </span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-light"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background-primary text-text-muted">Already have an account?</span>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors group"
        >
          <span className="flex items-center">
            <svg className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Sign in to your account
          </span>
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;