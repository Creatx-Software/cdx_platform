// Simple logger utility
const getTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message, data = null) => {
    console.log(`[${getTimestamp()}] [INFO] ${message}`, data || '');
  },
  
  warn: (message, data = null) => {
    console.warn(`[${getTimestamp()}] [WARN] ${message}`, data || '');
  },
  
  error: (message, error = null) => {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`, error || '');
  },
  
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${getTimestamp()}] [DEBUG] ${message}`, data || '');
    }
  }
};

module.exports = logger;