import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import TimeframeSelector from './TimeframeSelector';
import priceDataService from '../../services/trading/priceDataService';
import useLiveCandle from '../../hooks/trading/useLiveCandle';

/**
 * TradingChart Component
 * Professional trading chart using TradingView Lightweight Charts
 * Combines historical data from database/APIs with real-time updates
 */
const TradingChart = ({
  symbol = 'SOL',
  tokenMint = 'SOL',
  height = 500,
  className = ''
}) => {
  // Refs
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const resizeObserverRef = useRef();

  // State
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedDays, setSelectedDays] = useState(30);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time data
  const { liveCandle, currentPrice, lastUpdate } = useLiveCandle(tokenMint, '1d');

  // Chart configuration
  const chartOptions = {
    layout: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontSize: 12,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    grid: {
      vertLines: {
        color: '#f0f0f0',
        style: 1,
        visible: true,
      },
      horzLines: {
        color: '#f0f0f0',
        style: 1,
        visible: true,
      },
    },
    crosshair: {
      mode: 1, // Normal crosshair
      vertLine: {
        width: 1,
        color: '#9598A1',
        style: 3,
      },
      horzLine: {
        width: 1,
        color: '#9598A1',
        style: 3,
      },
    },
    priceScale: {
      borderColor: '#cccccc',
      autoScale: true,
      entireTextOnly: false,
    },
    timeScale: {
      borderColor: '#cccccc',
      timeVisible: true,
      secondsVisible: false,
    },
    watermark: {
      visible: true,
      fontSize: 48,
      horzAlign: 'center',
      vertAlign: 'center',
      color: 'rgba(171, 171, 171, 0.3)',
      text: `${symbol}/USD`,
    },
  };

  // Candlestick series options
  const candlestickOptions = {
    upColor: '#00C853',
    downColor: '#FF5252',
    borderDownColor: '#FF5252',
    borderUpColor: '#00C853',
    wickDownColor: '#FF5252',
    wickUpColor: '#00C853',
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries(candlestickOptions);

    // Store references
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle container resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height: containerHeight } = entries[0].contentRect;
      chartRef.current.applyOptions({ width: Math.max(width, 0) });
    });

    resizeObserver.observe(chartContainerRef.current);
    resizeObserverRef.current = resizeObserver;

    // Cleanup function
    return () => {
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current);
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Fetch historical data
  const fetchHistoricalData = async (days) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await priceDataService.getHistoricalData(symbol, days);
      setHistoricalData(data);
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
    if (!candlestickSeriesRef.current || !historicalData.length) return;

    // Combine historical data with live candle
    let chartData = [...historicalData];

    if (liveCandle && currentPrice) {
      // Check if live candle should replace the last historical candle
      const lastHistoricalCandle = chartData[chartData.length - 1];

      if (lastHistoricalCandle && Math.abs(lastHistoricalCandle.time - liveCandle.time) < 24 * 60 * 60) {
        // Same day, replace last candle with live candle
        chartData[chartData.length - 1] = liveCandle;
      } else {
        // Different day, append live candle
        chartData.push(liveCandle);
      }
    }

    candlestickSeriesRef.current.setData(chartData);
  }, [historicalData, liveCandle, currentPrice]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe, days) => {
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

  // Calculate price change
  const priceChange = historicalData.length >= 2 && currentPrice
    ? ((currentPrice - historicalData[0].open) / historicalData[0].open * 100)
    : 0;

  if (error && !historicalData.length) {
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
            onClick={() => fetchHistoricalData(selectedDays)}
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
                {priceChange !== 0 && (
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    priceChange >= 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-red-700 bg-red-100'
                  }`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>

            {/* Live Indicator */}
            {currentPrice && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Live • {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Updating...'}
                </span>
              </div>
            )}
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
            Data from {historicalData.length > 0 ? 'CoinGecko API' : 'Loading'} •
            Real-time prices from Jupiter
          </div>
          <div>
            {error && (
              <span className="text-red-500">⚠️ {error}</span>
            )}
            {!error && historicalData.length > 0 && (
              <span className="text-green-600">✅ Connected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;