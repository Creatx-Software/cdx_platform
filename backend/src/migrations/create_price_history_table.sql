-- Migration: Create price_history table (MySQL Version)
-- This migration creates the table structure for storing historical OHLCV price data

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_symbol VARCHAR(10) NOT NULL,
    token_mint VARCHAR(50), -- Solana mint address for custom tokens
    timeframe CHAR(3) NOT NULL, -- '1m', '5m', '1h', '4h', '1d', '1w'
    timestamp TIMESTAMP NOT NULL,
    open_price DECIMAL(18,8) NOT NULL,
    high_price DECIMAL(18,8) NOT NULL,
    low_price DECIMAL(18,8) NOT NULL,
    close_price DECIMAL(18,8) NOT NULL,
    volume DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Ensure unique candles
    UNIQUE KEY unique_candle (token_symbol, timeframe, timestamp)
);

-- Create indexes for better query performance
CREATE INDEX idx_price_history_symbol_timeframe
ON price_history (token_symbol, timeframe);

CREATE INDEX idx_price_history_timestamp
ON price_history (timestamp DESC);

CREATE INDEX idx_price_history_recent
ON price_history (token_symbol, timeframe, timestamp DESC);

-- Create index for latest price queries
CREATE INDEX idx_price_history_latest
ON price_history (token_symbol, timestamp DESC);

-- Insert some sample data for SOL (optional, for testing)
INSERT INTO price_history (token_symbol, timeframe, timestamp, open_price, high_price, low_price, close_price, volume)
VALUES
    ('SOL', '1d', DATE_SUB(NOW(), INTERVAL 30 DAY), 100.00, 105.50, 98.20, 103.75, 1500000),
    ('SOL', '1d', DATE_SUB(NOW(), INTERVAL 29 DAY), 103.75, 108.90, 101.30, 107.45, 1650000),
    ('SOL', '1d', DATE_SUB(NOW(), INTERVAL 28 DAY), 107.45, 112.20, 105.80, 110.90, 1750000)
ON DUPLICATE KEY UPDATE
    high_price = GREATEST(VALUES(high_price), high_price),
    low_price = LEAST(VALUES(low_price), low_price),
    close_price = VALUES(close_price),
    updated_at = CURRENT_TIMESTAMP;

-- Create a view for easy access to latest prices
CREATE OR REPLACE VIEW latest_prices AS
SELECT
    token_symbol,
    token_mint,
    close_price as current_price,
    timestamp as last_update,
    volume
FROM price_history p1
WHERE timestamp = (
    SELECT MAX(timestamp)
    FROM price_history p2
    WHERE p2.token_symbol = p1.token_symbol
);

-- Performance monitoring query (for admins)
-- SELECT
--     token_symbol,
--     timeframe,
--     COUNT(*) as total_candles,
--     MIN(timestamp) as oldest_data,
--     MAX(timestamp) as newest_data,
--     AVG(volume) as avg_volume
-- FROM price_history
-- GROUP BY token_symbol, timeframe
-- ORDER BY token_symbol, timeframe;