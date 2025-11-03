import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input-field ${
          error ? 'border-accent-error focus:border-accent-error focus:ring-accent-error/20' : ''
        } ${disabled ? 'bg-secondary-100 cursor-not-allowed opacity-60' : ''} ${className}`}
      />
      {error && (
        <div className="flex items-start mt-1">
          <svg className="h-4 w-4 text-accent-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-accent-error ml-2">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Input;