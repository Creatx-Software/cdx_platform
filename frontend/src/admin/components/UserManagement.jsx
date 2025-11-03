import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_users: 0,
    has_next: false,
    has_prev: false
  });

  // Backend filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users when page or filters change
  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page, filters]);

  // Fetch users from backend with filtering and pagination
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.current_page,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value && value !== 'all'))
      };

      const response = await adminService.getUsers(params);

      if (response.success) {
        setUsers(response.users);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await adminService.getUserDetails(userId);
      if (response.success) {
        setSelectedUser(response);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage registered users and view their activity
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Email, name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="verified">Email Verified</option>
                <option value="unverified">Email Not Verified</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loader message="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">
              Users will appear here as they register
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CDX Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email_verified ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">Not Verified</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(user.transaction_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(user.total_spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(user.total_tokens)} CDX
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => fetchUserDetails(user.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {users.map((user) => (
                <div key={user.id} className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {user.email_verified ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Transactions</p>
                      <p className="font-semibold">{formatNumber(user.transaction_count)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Spent</p>
                      <p className="font-semibold">{formatCurrency(user.total_spent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CDX Tokens</p>
                      <p className="font-semibold">{formatNumber(user.total_tokens)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="font-semibold">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchUserDetails(user.id)}
                    className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Backend Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_prev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{pagination.current_page}</span> of{' '}
                      <span className="font-medium">{pagination.total_pages}</span>
                      {' '}({pagination.total_users} total users)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={!pagination.has_prev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {pagination.current_page}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={!pagination.has_next}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  �
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">
                          {selectedUser.user.first_name} {selectedUser.user.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.user.email}</p>
                        {selectedUser.user.email_verified ? (
                          <span className="text-green-600 text-xs">Verified</span>
                        ) : (
                          <span className="text-red-600 text-xs">Not Verified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(selectedUser.user.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">{formatDate(selectedUser.user.last_login)}</p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Account Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-lg font-bold text-blue-600">
                        {formatNumber(selectedUser.stats.total_transactions)}
                      </p>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedUser.stats.total_spent)}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-lg font-bold text-purple-600">
                        {formatNumber(selectedUser.stats.total_tokens)}
                      </p>
                      <p className="text-sm text-gray-600">CDX Tokens</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-lg font-bold text-red-600">
                        {formatNumber(selectedUser.stats.failed_transactions)}
                      </p>
                      <p className="text-sm text-gray-600">Failed Transactions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Recent Transactions</h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUser.transactions.slice(0, 10).map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            #{transaction.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(transaction.amount_usd)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;