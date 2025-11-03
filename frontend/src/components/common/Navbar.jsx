import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`${isActive(to) ? 'nav-link-active' : 'nav-link'} ${className}`}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`block ${isActive(to) ? 'nav-link-active' : 'nav-link'}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="navbar-premium">
      <div className="container-premium">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover-scale">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-primary-600">CDX</span>
              </div>
              <div className="ml-2">
                <span className="text-lg font-medium text-text-primary">Platform</span>
              </div>
            </Link>

            {/* Desktop navigation - User only */}
            {user && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/purchase">Buy Tokens</NavLink>
                <NavLink to="/transactions">Transactions</NavLink>
                <NavLink to="/profile">Profile</NavLink>
              </div>
            )}
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            {user ? (
              <>
                {/* Desktop user menu */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <div className="text-sm text-text-secondary">
                    Welcome, <span className="font-medium text-text-primary">{user.first_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                      <span className="text-primary-600 font-medium text-sm">
                        {user.first_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="btn-icon"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Guest menu */
              <div className="hidden md:flex md:items-center md:space-x-4">
                <NavLink to="/login">Login</NavLink>
                <Button
                  onClick={() => navigate('/register')}
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-tertiary border-t border-border-light">
            <MobileNavLink
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </MobileNavLink>
            <MobileNavLink
              to="/purchase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy Tokens
            </MobileNavLink>
            <MobileNavLink
              to="/transactions"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Transactions
            </MobileNavLink>
            <MobileNavLink
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </MobileNavLink>

            {/* Mobile user info and logout */}
            <div className="pt-4 pb-3 border-t border-border-light">
              <div className="flex items-center px-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                  <span className="text-primary-600 font-medium">
                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-text-primary">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-text-muted">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile guest menu */}
      {isMobileMenuOpen && !user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-tertiary border-t border-border-light">
            <MobileNavLink
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </MobileNavLink>
            <MobileNavLink
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;