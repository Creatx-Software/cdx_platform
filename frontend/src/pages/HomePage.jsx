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
      icon: "🚀",
      title: "Instant Token Delivery",
      description: "Receive CDX tokens directly to your Solana wallet within minutes of payment confirmation.",
      highlight: true
    },
    {
      icon: "💳",
      title: "Credit Card Payments",
      description: "Purchase tokens with any major credit or debit card through our secure Stripe integration.",
      highlight: false
    },
    {
      icon: "🔒",
      title: "Bank-Level Security",
      description: "Your payments are protected by enterprise-grade encryption and security protocols.",
      highlight: false
    },
    {
      icon: "⚡",
      title: "Solana Blockchain",
      description: "Built on Solana network for fast, low-cost transactions and superior performance.",
      highlight: false
    },
    {
      icon: "📊",
      title: "Real-Time Tracking",
      description: "Monitor your transactions and token balance with our comprehensive dashboard.",
      highlight: false
    },
    {
      icon: "🛡️",
      title: "Compliance Ready",
      description: "Fully compliant with financial regulations and cryptocurrency guidelines.",
      highlight: false
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
                className={`${feature.highlight ? 'card-gold glow-gold' : 'card-premium'} p-8 hover-scale transition-all duration-300`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
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
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 text-xl">🔐</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">256-bit SSL Encryption</h4>
                    <p className="text-text-muted">All data transmitted is encrypted using bank-level security protocols.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 text-xl">🏦</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Stripe Payment Processing</h4>
                    <p className="text-text-muted">Payments processed through Stripe's secure and trusted infrastructure.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 text-xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Solana Blockchain</h4>
                    <p className="text-text-muted">Built on Solana's fast, secure, and decentralized blockchain network.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-premium p-8 text-center">
                <div className="text-6xl mb-6">🛡️</div>
                <h3 className="title-card mb-4">100% Secure Platform</h3>
                <p className="text-text-muted mb-6">
                  Join thousands of users who trust our platform for secure cryptocurrency purchases.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="font-bold text-2xl text-primary-600">99.9%</div>
                    <div className="text-sm text-text-muted">Uptime</div>
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-primary-600">24/7</div>
                    <div className="text-sm text-text-muted">Monitoring</div>
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
              <p className="text-gray-400 mb-4 leading-relaxed">
                The most secure and user-friendly platform for purchasing cryptocurrency tokens with credit cards.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <span className="text-xl">📧</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <span className="text-xl">🐦</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <span className="text-xl">📱</span>
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
                © 2024 CDX Platform. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  All systems operational
                </span>
                <span>Made with ❤️ for DeFi</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;