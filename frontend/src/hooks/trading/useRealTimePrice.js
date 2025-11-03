import { useState, useEffect, useRef } from 'react';
import priceDataService from '../../services/trading/priceDataService';

/**
 * Hook for real-time price updates
 * Polls Jupiter API every 30 seconds and manages price history
 */
export const useRealTimePrice = (tokenMint = 'SOL', updateInterval = 30000) => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const intervalRef = useRef();
  const mountedRef = useRef(true);

  const fetchPrice = async () => {
    try {
      const priceData = await priceDataService.getRealTimePrice(tokenMint);

      if (priceData && priceData.price && mountedRef.current) {
        setCurrentPrice(priceData.price);
        setLastUpdate(new Date(priceData.timestamp));
        setError(null);

        // Add to price history (keep last 100 updates)
        setPriceHistory(prev => {
          const newHistory = [...prev.slice(-99), {
            price: priceData.price,
            timestamp: priceData.timestamp
          }];
          return newHistory;
        });

        setIsLoading(false);
      }
    } catch (err) {
      console.error('Real-time price fetch error:', err);
      if (mountedRef.current) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    fetchPrice();

    // Set up interval for regular updates
    intervalRef.current = setInterval(fetchPrice, updateInterval);

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tokenMint, updateInterval]);

  // Manual refresh function
  const refresh = () => {
    setIsLoading(true);
    fetchPrice();
  };

  return {
    currentPrice,
    priceHistory,
    isLoading,
    error,
    lastUpdate,
    refresh
  };
};

export default useRealTimePrice;