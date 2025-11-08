import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Navbar from '../components/common/Navbar';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPrice] = useState(0.20); // Current CDX token price
  const [animatedStats, setAnimatedStats] = useState({
    totalTokens: 0,
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0
  });

  // Animate statistics on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        totalTokens: 1000000,
        totalUsers: 2847,
        totalTransactions: 15432,
        totalVolume: 125000
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return <Loader message="Loading..." />;
  }

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Token Delivery",
      description: "Receive CDX tokens directly to your Solana wallet within minutes of payment confirmation.",
      highlight: true,
      color: "text-yellow-500"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Credit Card Payments",
      description: "Purchase tokens with any major credit or debit card through our secure Stripe integration.",
      highlight: false,
      color: "text-blue-500"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Bank-Level Security",
      description: "Your payments are protected by enterprise-grade encryption and security protocols.",
      highlight: false,
      color: "text-green-500"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
      ),
      title: "Solana Blockchain",
      description: "Built on Solana network for fast, low-cost transactions and superior performance.",
      highlight: false,
      color: "text-purple-500"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Real-Time Tracking",
      description: "Monitor your transactions and token balance with our comprehensive dashboard.",
      highlight: false,
      color: "text-cyan-500"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Compliance Ready",
      description: "Fully compliant with financial regulations and cryptocurrency guidelines.",
      highlight: false,
      color: "text-emerald-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up for your free CDX Platform account in under 2 minutes."
    },
    {
      number: "02",
      title: "Enter Wallet Address",
      description: "Provide your Solana wallet address where you want to receive tokens."
    },
    {
      number: "03",
      title: "Make Payment",
      description: "Pay securely with your credit card through our encrypted payment system."
    },
    {
      number: "04",
      title: "Receive Tokens",
      description: "Get your CDX tokens delivered instantly to your Solana wallet."
    }
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 lg:py-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container-premium relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
              Live on Solana Blockchain
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
              Buy <span className="text-transparent bg-clip-text bg-gradient-primary">CDX Tokens</span><br />
              with Your Credit Card
            </h1>

            <p className="text-xl lg:text-2xl text-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              The easiest way to purchase cryptocurrency tokens. Secure payments, instant delivery,
              and seamless integration with the Solana blockchain ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate('/register')}
                    className="btn-primary text-lg px-8 py-4 hover-scale"
                  >
                    Start Buying Tokens
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="text-lg px-8 py-4"
                  >
                    Sign In
                  </Button>
                </>
              ) : user?.role === 'ADMIN' ? (
                <Button
                  onClick={() => navigate('/admin')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Go to Admin Panel
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/purchase')}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Buy Tokens Now
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="text-lg px-8 py-4"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}
            </div>

            {/* Current Price Display */}
            <div className="inline-flex items-center bg-background-card border border-border-light rounded-2xl px-6 py-4 shadow-card">
              <span className="text-text-muted mr-2">Current Price:</span>
              <span className="price-display">${currentPrice.toFixed(3)}</span>
              <span className="text-text-muted ml-1">per CDX</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-background-card border-y border-border-light">
        <div className="container-premium">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.totalTokens.toLocaleString()}+
              </div>
              <div className="text-text-muted">Total Tokens Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-text-muted">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.totalTransactions.toLocaleString()}+
              </div>
              <div className="text-text-muted">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                ${animatedStats.totalVolume.toLocaleString()}+
              </div>
              <div className="text-text-muted">Trading Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="title-page mb-4">Why Choose CDX Platform?</h2>
            <p className="subtitle max-w-3xl mx-auto">
              Experience the future of cryptocurrency purchasing with our secure, fast, and user-friendly platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.highlight ? 'card-gold glow-gold' : 'card-premium'} p-8 hover-scale transition-all duration-300 group`}
              >
                <div className={`${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="title-card mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background-card">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="title-page mb-4">How It Works</h2>
            <p className="subtitle max-w-2xl mx-auto">
              Get started with CDX tokens in just four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-primary-200 z-0"></div>
                )}

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary text-text-white rounded-full text-2xl font-bold mb-6 shadow-premium">
                    {step.number}
                  </div>
                  <h3 className="title-card mb-3">{step.title}</h3>
                  <p className="text-text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate(isAuthenticated ? '/purchase' : '/register')}
              className="btn-primary text-lg px-8 py-4"
            >
              {isAuthenticated ? 'Start Buying Now' : 'Get Started Today'}
            </Button>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="title-page mb-6">Security & Trust</h2>
              <p className="text-xl text-text-muted mb-8 leading-relaxed">
                Your security is our top priority. We use industry-leading security measures
                to protect your payments and personal information.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-text-primary mb-2">256-bit SSL Encryption</h4>
                    <p className="text-text-muted">All data transmitted is encrypted using bank-level security protocols.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.315 0 2.088.53 2.364 1.435.03.09.091.14.164.14h1.02c.094 0 .17-.084.17-.184 0-.029-.007-.058-.021-.087-.339-1.185-1.376-2.035-2.855-2.124v-1.33c0-.09-.077-.171-.17-.171h-.984c-.093 0-.17.08-.17.17v1.32c-1.598.176-2.613 1.09-2.613 2.405 0 1.627 1.32 2.48 3.443 3.254 1.949.724 2.628 1.369 2.628 2.369 0 1-.854 1.604-2.284 1.604-1.647 0-2.528-.629-2.821-1.605-.028-.089-.091-.14-.164-.14h-1.02c-.093 0-.17.084-.17.184 0 .029.007.058.021.087.355 1.329 1.419 2.219 3.008 2.398v1.33c0 .09.077.171.17.171h.984c.094 0 .17-.08.17-.17v-1.32c1.598-.18 2.613-1.096 2.613-2.462 0-1.746-1.405-2.625-3.443-3.354z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-text-primary mb-2">Stripe Payment Processing</h4>
                    <p className="text-text-muted">Payments processed through Stripe's secure and trusted infrastructure.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-text-primary mb-2">Solana Blockchain</h4>
                    <p className="text-text-muted">Built on Solana's fast, secure, and decentralized blockchain network.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-gold p-10 text-center glow-gold">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">100% Secure Platform</h3>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Join thousands of users who trust our platform for secure cryptocurrency purchases.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="font-bold text-3xl text-primary-600 mb-1">99.9%</div>
                    <div className="text-sm font-medium text-text-muted">Uptime</div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="font-bold text-3xl text-primary-600 mb-1">24/7</div>
                    <div className="text-sm font-medium text-text-muted">Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-primary text-text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-premium text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Buy CDX Tokens?
          </h2>
          <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the future of decentralized finance. Start purchasing CDX tokens today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(isAuthenticated ? '/purchase' : '/register')}
              className="bg-background-card text-text-primary hover:bg-background-tertiary text-lg px-8 py-4 font-semibold"
            >
              {isAuthenticated ? 'Buy Tokens Now' : 'Create Account'}
            </Button>
            {!isAuthenticated && (
              <Button
                onClick={() => navigate('/login')}
                className="border-2 border-text-white text-text-white hover:bg-text-white hover:text-primary-600 text-lg px-8 py-4"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-text-white py-16">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold text-primary-400">CDX</span>
                <span className="ml-2 text-lg font-medium">Platform</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The most secure and user-friendly platform for purchasing cryptocurrency tokens with credit cards.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">API Documentation</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Status Page</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Bug Reports</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2025 CDX Platform. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  All systems operational
                </span>
                <span>Design & Developed by CODEXER</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;