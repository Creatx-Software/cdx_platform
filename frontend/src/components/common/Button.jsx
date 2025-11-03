import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  className = ''
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-900 border border-secondary-300 hover:from-secondary-200 hover:to-secondary-300 focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
    danger: 'bg-gradient-to-r from-accent-error to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-accent-error'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${(disabled || loading) ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;