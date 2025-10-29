import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start buying CDX tokens today
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;