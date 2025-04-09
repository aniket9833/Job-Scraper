import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  mongoURI: process.env.MONGODB_URL,

  defaultScrapingInterval:
    process.env.DEFAULT_SCRAPING_INTERVAL || '0 */6 * * *', // Every 6 hours by default

  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

  maxConcurrentScrapes: parseInt(process.env.MAX_CONCURRENT_SCRAPES) || 5,

  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 seconds

  defaultPriority: 1,
};
