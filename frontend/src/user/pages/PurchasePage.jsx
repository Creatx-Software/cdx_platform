import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenPurchase from '../../components/payment/TokenPurchase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const PurchasePage = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Purchase <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Cryptocurrency Tokens</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 font-light leading-relaxed">
              Buy cryptocurrency tokens securely with your credit card. Admin will manually send tokens to your wallet after payment.
            </p>

            {/* Stats Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="text-sm font-medium">💳 Secure Payment</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="text-sm font-medium">🔒 Bank-Level Security</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <span className="text-sm font-medium">⚡ Multi-Token Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 -mt-8 relative z-10">
        {/* Token Purchase Component */}
        <TokenPurchase />

        {/* How it Works Section */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purchase cryptocurrency tokens in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Select Token & Enter Details</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose your desired token, enter the amount you want to spend, and provide your wallet address
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-4"></div>
            </div>

            <div className="relative">
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pay securely with your credit card through Stripe's encrypted payment system with instant processing
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 transform translate-x-4"></div>
            </div>

            <div className="relative">
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Tokens</h3>
                <p className="text-gray-600 leading-relaxed">
                  Admin will manually send tokens to your wallet after payment confirmation. You'll receive an email notification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-emerald-200/50 shadow-lg">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🔒 Secure & Safe
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Your payment information is protected by bank-level encryption. We never store your credit card details,
                  and all transactions are processed securely through Stripe's industry-leading payment infrastructure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">PCI Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Fraud Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by thousands of users worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-50">
            <div className="text-2xl font-bold text-gray-400">Stripe</div>
            <div className="text-2xl font-bold text-gray-400">Blockchain</div>
            <div className="text-2xl font-bold text-gray-400">Crypto</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchasePage;