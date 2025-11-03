import React, { useState } from 'react';
import {
  UserIcon,
  Cog6ToothIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Profile from '../components/Profile';

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
    <div className="min-h-screen bg-background-secondary">
      <div className="container-premium">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 lg:max-w-none">
            <div className="section-premium">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;