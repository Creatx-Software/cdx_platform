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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Purchase <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Cryptocurrency Tokens</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 font-light leading-relaxed max-w-3xl mx-auto">
              Buy cryptocurrency tokens securely with your credit card. Manual fulfillment ensures safe delivery to your wallet.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="backdrop-blur-sm bg-white/10 rounded-full px-6 py-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-full px-6 py-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium">Bank-Level Security</span>
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-full px-6 py-3 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium">Multi-Token Support</span>
                </div>
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
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              SIMPLE PROCESS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Purchase cryptocurrency tokens in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Select Token & Details</h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    Choose your desired token, enter the amount you want to spend, and provide your wallet address
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Multi-token support
                    </div>
                  </div>
                </div>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-1/3 -right-4 z-10">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payment</h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    Pay securely with your credit card through Stripe's encrypted payment system with instant processing
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center text-sm text-cyan-600 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Bank-level encryption
                    </div>
                  </div>
                </div>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-1/3 -right-4 z-10">
                <svg className="w-8 h-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Tokens</h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    Admin will manually send tokens to your wallet after payment confirmation. You'll receive an email notification
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center text-sm text-emerald-600 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email confirmation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-10 md:p-12 border border-slate-200 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Secure & Safe
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Your payment information is protected by bank-level encryption. We never store your credit card details,
                  and all transactions are processed securely through Stripe's industry-leading payment infrastructure.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 font-semibold">PCI Compliant</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 font-semibold">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 font-semibold">Fraud Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center pb-12">
          <p className="text-sm text-gray-500 mb-8 font-medium">Powered by industry-leading technology</p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="flex items-center space-x-2 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.315 0 2.088.53 2.364 1.435.03.09.091.14.164.14h1.02c.094 0 .17-.084.17-.184 0-.029-.007-.058-.021-.087-.339-1.185-1.376-2.035-2.855-2.124v-1.33c0-.09-.077-.171-.17-.171h-.984c-.093 0-.17.08-.17.17v1.32c-1.598.176-2.613 1.09-2.613 2.405 0 1.627 1.32 2.48 3.443 3.254 1.949.724 2.628 1.369 2.628 2.369 0 1-.854 1.604-2.284 1.604-1.647 0-2.528-.629-2.821-1.605-.028-.089-.091-.14-.164-.14h-1.02c-.093 0-.17.084-.17.184 0 .029.007.058.021.087.355 1.329 1.419 2.219 3.008 2.398v1.33c0 .09.077.171.17.171h.984c.094 0 .17-.08.17-.17v-1.32c1.598-.18 2.613-1.096 2.613-2.462 0-1.746-1.405-2.625-3.443-3.354z" />
              </svg>
              <span className="text-sm font-bold text-gray-700">Stripe</span>
            </div>
            <div className="flex items-center space-x-2 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <svg className="w-6 h-6 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              <span className="text-sm font-bold text-gray-700">Solana</span>
            </div>
            <div className="flex items-center space-x-2 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-bold text-gray-700">Secure</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchasePage;