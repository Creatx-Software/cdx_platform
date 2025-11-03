import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

/**
 * Simple Chart Test Component
 * Minimal test to verify lightweight-charts v4.1.0 works
 */
const ChartTest = () => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🔧 Creating test chart...');

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: 800,
        height: 400,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
        },
      });

      console.log('✅ Chart created successfully');
      console.log('📊 Chart object:', chart);
      console.log('🔍 Chart methods:', Object.getOwnPropertyNames(chart));

      // Test adding candlestick series
      if (typeof chart.addCandlestickSeries === 'function') {
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#00C853',
          downColor: '#FF5252',
          borderDownColor: '#FF5252',
          borderUpColor: '#00C853',
          wickDownColor: '#FF5252',
          wickUpColor: '#00C853',
        });

        console.log('✅ Candlestick series added successfully');

        // Add some test data
        const sampleData = [
          { time: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
          { time: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
          { time: '2024-01-03', open: 112, high: 118, low: 108, close: 115 },
          { time: '2024-01-04', open: 115, high: 120, low: 110, close: 118 },
          { time: '2024-01-05', open: 118, high: 125, low: 115, close: 122 },
        ];

        candlestickSeries.setData(sampleData);
        console.log('✅ Sample data added to chart');

      } else {
        console.error('❌ addCandlestickSeries method not found');
        console.log('Available methods:', Object.getOwnPropertyNames(chart));
      }

      // Cleanup
      return () => {
        chart.remove();
      };

    } catch (error) {
      console.error('❌ Chart creation failed:', error);
    }
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chart Test</h2>
      <div className="border border-gray-300 rounded">
        <div ref={chartContainerRef} style={{ width: '800px', height: '400px' }} />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Check the browser console for detailed logs about chart creation.
      </p>
    </div>
  );
};

export default ChartTest;