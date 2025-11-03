import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';

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
      const result = await loginUser(formData.email, formData.password);

      // Role-based redirection
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        loading={loading}
        fullWidth
      >
        Login
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Register here
        </button>
      </p>
    </form>
  );
};

export default LoginForm;