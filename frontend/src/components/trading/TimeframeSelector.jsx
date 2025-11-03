import React from 'react';

/**
 * Timeframe Selector Component
 * Allows users to switch between different chart timeframes
 */
const TimeframeSelector = ({
  selectedTimeframe = '1d',
  onTimeframeChange,
  className = ''
}) => {
  const timeframes = [
    { value: '7d', label: '7D', days: 7 },
    { value: '30d', label: '30D', days: 30 },
    { value: '90d', label: '90D', days: 90 },
    { value: '1y', label: '1Y', days: 365 }
  ];

  const handleTimeframeClick = (timeframe) => {
    if (onTimeframeChange) {
      onTimeframeChange(timeframe.value, timeframe.days);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-sm font-medium text-gray-600 mr-3">Timeframe:</span>
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.value}
          onClick={() => handleTimeframeClick(timeframe)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedTimeframe === timeframe.value
              ? 'bg-blue-500 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;