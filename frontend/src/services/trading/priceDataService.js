/**
 * Price Data Service
 * Handles fetching price data from multiple sources with fallback strategy
 */

class PriceDataService {
  constructor() {
    this.cache = new Map();
    this.lastFetch = new Map();
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache for historical data
    this.RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting to respect free API limits
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Get historical OHLCV data with caching
   */
  async getHistoricalData(symbol, days = 30) {
    const cacheKey = `historical_${symbol}_${days}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        console.log(`📦 Using cached data for ${symbol}`);
        return data;
      }
    }

    console.log(`🔄 Fetching fresh data for ${symbol} (${days} days)`);

    try {
      // Try our backend API first (when implemented)
      const backendData = await this.fetchFromBackend(symbol, days);
      if (backendData && backendData.length > 0) {
        this.cache.set(cacheKey, { data: backendData, timestamp: Date.now() });
        return backendData;
      }
    } catch (error) {
      console.warn('Backend API failed, trying external sources:', error.message);
    }

    try {
      // Fallback to CoinGecko
      await this.respectRateLimit();
      const coinGeckoData = await this.fetchFromCoinGecko(symbol, days);
      this.cache.set(cacheKey, { data: coinGeckoData, timestamp: Date.now() });
      return coinGeckoData;
    } catch (error) {
      console.error('CoinGecko API failed:', error);

      // Return cached data even if stale
      if (this.cache.has(cacheKey)) {
        console.log('⚠️ Using stale cached data');
        return this.cache.get(cacheKey).data;
      }

      throw new Error('All data sources failed');
    }
  }

  /**
   * Fetch from our backend API (when implemented)
   */
  async fetchFromBackend(symbol, days) {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/price-history/${symbol}/1d/${days}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch from CoinGecko API
   */
  async fetchFromCoinGecko(symbol, days) {
    // Map symbol to CoinGecko ID
    const coinGeckoIds = {
      'SOL': 'solana',
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'CDX': 'solana' // Use SOL as proxy for now, will be replaced with actual CDX data
    };

    const coinId = coinGeckoIds[symbol.toUpperCase()] || 'solana';

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert CoinGecko format to TradingView format
    return data.map(item => ({
      time: Math.floor(item[0] / 1000), // Convert milliseconds to seconds
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4]
    }));
  }

  /**
   * Get real-time price from Jupiter API
   */
  async getRealTimePrice(tokenMint = 'SOL') {
    try {
      const response = await fetch(`https://price.jup.ag/v6/price?ids=${tokenMint}`);

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        symbol: tokenMint,
        price: data[tokenMint]?.price || null,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Jupiter API failed:', error);
      return null;
    }
  }

  /**
   * Get multiple token prices
   */
  async getMultiplePrices(tokens = ['SOL']) {
    try {
      const tokenString = tokens.join(',');
      const response = await fetch(`https://price.jup.ag/v6/price?ids=${tokenString}`);

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();

      return tokens.map(token => ({
        symbol: token,
        price: data[token]?.price || null,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Jupiter API failed:', error);
      return tokens.map(token => ({ symbol: token, price: null, timestamp: Date.now() }));
    }
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache() {
    this.cache.clear();
    this.lastFetch.clear();
    console.log('🗑️ Price data cache cleared');
  }
}

// Export singleton instance
export const priceDataService = new PriceDataService();
export default priceDataService;