import express from 'express';
import scrapingController from '../controllers/scrapingController.js';

const router = express.Router();

// Scrape routes
router.post('/url', scrapingController.scrapeUrl);
router.post('/run', scrapingController.runScrapingOperation);
router.post('/trigger', scrapingController.triggerScraping);

// Domain routes
router.get('/domains', scrapingController.getDomains);
router.post('/domains', scrapingController.addDomain);
router.put(
  '/domains/:domainId/priority',
  scrapingController.updateDomainPriority
);
router.put(
  '/domains/:domainId/schedule',
  scrapingController.updateDomainSchedule
);

// Keyword routes
router.get('/keywords', scrapingController.getKeywords);
router.post('/keywords', scrapingController.addKeyword);
router.put(
  '/keywords/:keywordId/priority',
  scrapingController.updateKeywordPriority
);

export default router;
