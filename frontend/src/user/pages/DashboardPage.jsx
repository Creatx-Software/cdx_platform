import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import TradingChartFixed from '../../components/trading/TradingChartFixed';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleBuyTokens = () => {
    navigate('/purchase');
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <main className="container-premium py-6">
        <div className="section-premium">
          {/* Trading Chart Section */}
          <div className="card-premium p-6">
            <h3 className="title-section mb-6">
              <span className="text-gradient">SOL/USD Trading Chart</span>
            </h3>
            <TradingChartFixed
              symbol="SOL"
              tokenMint="SOL"
              height={500}
              className="w-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;