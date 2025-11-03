import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import TimeframeSelector from './TimeframeSelector';
import priceDataService from '../../services/trading/priceDataService';

/**
 * Fixed TradingChart Component
 * Professional trading chart using TradingView Lightweight Charts v5.0.9
 */
const TradingChartFixed = ({
  symbol = 'SOL',
  tokenMint = 'SOL',
  height = 500,
  className = ''
}) => {
  // Refs
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();

  // State
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedDays, setSelectedDays] = useState(30);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart options
  const chartOptions = {
    layout: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    rightPriceScale: {
      borderColor: '#cccccc',
    },
    timeScale: {
      borderColor: '#cccccc',
    },
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error('Chart container ref is not available');
      return;
    }

    console.log('🔧 Initializing TradingView chart...');

    try {
      // Create chart instance
      const chart = createChart(chartContainerRef.current, {
        ...chartOptions,
        width: chartContainerRef.current.clientWidth,
        height: height,
      });

      console.log('✅ Chart created:', chart);
      console.log('📊 Chart methods available:', Object.getOwnPropertyNames(chart));

      // Try to add candlestick series
      if (typeof chart.addCandlestickSeries === 'function') {
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#00C853',
          downColor: '#FF5252',
          borderDownColor: '#FF5252',
          borderUpColor: '#00C853',
          wickDownColor: '#FF5252',
          wickUpColor: '#00C853',
        });

        console.log('✅ Candlestick series added:', candlestickSeries);

        // Store references
        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
      } else {
        console.error('❌ addCandlestickSeries method not found on chart object');
        console.log('Available methods:', Object.getOwnPropertyNames(chart));
        setError('Chart library error: addCandlestickSeries not available');
        return;
      }

      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };

    } catch (err) {
      console.error('❌ Chart initialization error:', err);
      setError(`Chart initialization failed: ${err.message}`);
    }
  }, []);

  // Fetch historical data
  const fetchHistoricalData = async (days) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📈 Fetching ${days} days of data for ${symbol}`);
      const data = await priceDataService.getHistoricalData(symbol, days);
      console.log('📊 Received data:', data?.length, 'candles');

      setHistoricalData(data || []);

      if (data && data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchHistoricalData(selectedDays);
  }, [symbol, selectedDays]);

  // Update chart data when historical data changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !historicalData.length) {
      console.log('⏳ Waiting for chart series or data...');
      return;
    }

    console.log('📊 Updating chart with', historicalData.length, 'candles');
    try {
      candlestickSeriesRef.current.setData(historicalData);
      console.log('✅ Chart data updated successfully');
    } catch (err) {
      console.error('❌ Failed to update chart data:', err);
      setError(`Failed to update chart: ${err.message}`);
    }
  }, [historicalData]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe, days) => {
    console.log(`🔄 Changing timeframe to ${timeframe} (${days} days)`);
    setSelectedTimeframe(timeframe);
    setSelectedDays(days);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return 'Loading...';
    return `$${parseFloat(price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })}`;
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchHistoricalData(selectedDays);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Price Info */}
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{symbol}/USD</h2>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-sm text-gray-500">
                  {isLoading ? 'Loading...' : 'Live'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <TimeframeSelector
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={handleTimeframeChange}
          />
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-600">Loading chart data...</span>
            </div>
          </div>
        )}

        <div
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full"
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
          <div>
            Data from CoinGecko API • Real-time prices from Jupiter
          </div>
          <div>
            {error && (
              <span className="text-red-500">⚠️ {error}</span>
            )}
            {!error && historicalData.length > 0 && (
              <span className="text-green-600">✅ {historicalData.length} candles loaded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChartFixed;