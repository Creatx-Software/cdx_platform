import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../components/Dashboard';
import UserManagement from '../components/UserManagement';
import TransactionList from '../components/TransactionList';
import PriceSettings from '../components/PriceSettings';
import FulfillmentManagement from '../components/FulfillmentManagement';
import TokenManagement from '../components/TokenManagement';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const components = {
    dashboard: Dashboard,
    users: UserManagement,
    transactions: TransactionList,
    fulfillments: FulfillmentManagement,
    tokens: TokenManagement,
    settings: PriceSettings
  };

  const ActiveComponent = components[activeTab] || Dashboard;

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ActiveComponent />
    </AdminLayout>
  );
};

export default AdminPage;