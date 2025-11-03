import React, { useState } from 'react';
import {
  UserIcon,
  Cog6ToothIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Profile from '../../components/user/Profile';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: UserIcon,
      component: Profile,
      description: 'Manage your personal information and account settings'
    }
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component || Profile;
  const ActiveComponent = activeComponent;
  const activeTabInfo = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account settings and preferences
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="bg-white shadow lg:shadow-none lg:border-r lg:border-gray-200">
              {/* Mobile tab selector */}
              <div className="lg:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden lg:block py-6">
                <div className="px-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Account</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeTabInfo?.description}
                  </p>
                </div>

                <div className="space-y-1 px-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <tab.icon className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium">{tab.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tab.id === 'profile' ? 'Personal info & security' : 'Purchase history & exports'}
                          </div>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-none">
            <div className="bg-white lg:bg-transparent">
              <div className="p-6 lg:p-8">
                <ActiveComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;