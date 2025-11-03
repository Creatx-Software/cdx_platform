import { useState, useEffect, useMemo } from 'react';
import useRealTimePrice from './useRealTimePrice';

/**
 * Hook to create live candles from real-time price data
 * Combines historical data with current live candle
 */
export const useLiveCandle = (tokenMint = 'SOL', timeframe = '1d') => {
  const { currentPrice, priceHistory, lastUpdate } = useRealTimePrice(tokenMint);
  const [lastClosePrice, setLastClosePrice] = useState(null);

  // Calculate timeframe duration in milliseconds
  const timeframeDuration = useMemo(() => {
    const durations = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return durations[timeframe] || durations['1d'];
  }, [timeframe]);

  // Calculate current candle start time
  const getCurrentCandleTime = (timestamp) => {
    return Math.floor(timestamp / timeframeDuration) * timeframeDuration;
  };

  // Create live candle from price history
  const liveCandle = useMemo(() => {
    if (!currentPrice || priceHistory.length === 0) {
      return null;
    }

    const now = Date.now();
    const candleStartTime = getCurrentCandleTime(now);

    // Filter prices within current candle timeframe
    const candlePrices = priceHistory.filter(
      pricePoint => pricePoint.timestamp >= candleStartTime
    );

    if (candlePrices.length === 0) {
      return null;
    }

    // Calculate OHLC from price history
    const prices = candlePrices.map(p => p.price);
    const openPrice = lastClosePrice || candlePrices[0].price;

    return {
      time: Math.floor(candleStartTime / 1000), // TradingView expects seconds
      open: openPrice,
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: currentPrice,
      isLive: true // Flag to identify live candle
    };
  }, [currentPrice, priceHistory, timeframeDuration, lastClosePrice]);

  // Update last close price when starting a new candle
  useEffect(() => {
    if (currentPrice && liveCandle) {
      const now = Date.now();
      const currentCandleTime = getCurrentCandleTime(now);
      const previousCandleTime = currentCandleTime - timeframeDuration;

      // Check if we've moved to a new candle period
      if (lastUpdate) {
        const lastUpdateCandleTime = getCurrentCandleTime(lastUpdate.getTime());
        if (lastUpdateCandleTime !== currentCandleTime) {
          // New candle started, save previous close as new open
          setLastClosePrice(currentPrice);
        }
      }
    }
  }, [currentPrice, lastUpdate, timeframeDuration]);

  return {
    liveCandle,
    currentPrice,
    lastUpdate,
    timeframe,
    isUpdating: currentPrice !== null
  };
};

export default useLiveCandle;