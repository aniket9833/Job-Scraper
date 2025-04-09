import scrapingService from '../services/scrapingService.js';
import schedulerService from '../services/schedulerService.js';
import Domain from '../models/Domain.js';
import Keyword from '../models/Keyword.js';
import priorityManager from '../utils/priorityManager.js';

class ScrapingController {
  /**
   * Scrape jobs from a URL with keywords
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async scrapeUrl(req, res) {
    try {
      const { url, keywords } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const keywordsArray = keywords || [];
      const jobs = await scrapingService.scrapeUrl(url, keywordsArray);

      res.status(200).json({
        success: true,
        jobsFound: jobs.length,
        jobs,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Run a scraping operation on all domains
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async runScrapingOperation(req, res) {
    try {
      const results = await scrapingService.runScrapingOperation();

      res.status(200).json({
        success: true,
        ...results,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Add a new domain
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addDomain(req, res) {
    try {
      const { url, name, priority, scrapingInterval } = req.body;

      if (!url || !name) {
        return res.status(400).json({ error: 'URL and name are required' });
      }

      const domain = await scrapingService.addDomain({
        url,
        name,
        priority,
        scrapingInterval,
      });

      // Schedule the domain
      schedulerService.scheduleDomain(domain);

      res.status(201).json({
        success: true,
        domain,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Add a new keyword
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addKeyword(req, res) {
    try {
      const { text, priority } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Keyword text is required' });
      }

      const keyword = await scrapingService.addKeyword({
        text,
        priority,
      });

      res.status(201).json({
        success: true,
        keyword,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update domain priority
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateDomainPriority(req, res) {
    try {
      const { domainId } = req.params;
      const { priority } = req.body;

      if (!priority || isNaN(priority)) {
        return res.status(400).json({ error: 'Valid priority is required' });
      }

      const domain = await priorityManager.updateDomainPriority(
        domainId,
        priority
      );

      res.status(200).json({
        success: true,
        domain,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update keyword priority
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateKeywordPriority(req, res) {
    try {
      const { keywordId } = req.params;
      const { priority } = req.body;

      if (!priority || isNaN(priority)) {
        return res.status(400).json({ error: 'Valid priority is required' });
      }

      const keyword = await priorityManager.updateKeywordPriority(
        keywordId,
        priority
      );

      res.status(200).json({
        success: true,
        keyword,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update domain schedule
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateDomainSchedule(req, res) {
    try {
      const { domainId } = req.params;
      const { interval } = req.body;

      if (!interval) {
        return res.status(400).json({ error: 'Scraping interval is required' });
      }

      const domain = await schedulerService.updateDomainSchedule(
        domainId,
        interval
      );

      res.status(200).json({
        success: true,
        domain,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Trigger manual scraping
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async triggerScraping(req, res) {
    try {
      const { domainId } = req.query;
      const results = await schedulerService.triggerScraping(domainId);

      res.status(200).json({
        success: true,
        results,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all domains
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDomains(req, res) {
    try {
      const domains = await Domain.find().sort({ priority: -1 });

      res.status(200).json({
        success: true,
        count: domains.length,
        domains,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all keywords
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getKeywords(req, res) {
    try {
      const keywords = await Keyword.find().sort({ priority: -1 });

      res.status(200).json({
        success: true,
        count: keywords.length,
        keywords,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ScrapingController();
