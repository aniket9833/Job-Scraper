import cron from 'node-cron';
import scrapingService from './scrapingService.js';
import Domain from '../models/Domain.js';
import { config } from '../config/serverConfig.js';

class SchedulerService {
  constructor() {
    this.scheduledJobs = new Map();
  }

  /**
   * Initialize the scheduler
   */
  async initialize() {
    try {
      // Load all active domains
      const domains = await Domain.find({ active: true });

      // Schedule each domain's scraping job
      for (const domain of domains) {
        this.scheduleDomain(domain);
      }

      // Schedule a global scraping operation as a fallback
      this.scheduleGlobalScraping();

      console.log(`Scheduler initialized with ${domains.length} domains`);
    } catch (error) {
      console.error(`Error initializing scheduler: ${error.message}`);
    }
  }

  /**
   * Schedule a domain for scraping
   * @param {Object} domain - Domain to schedule
   */
  scheduleDomain(domain) {
    // Cancel any existing job for this domain
    if (this.scheduledJobs.has(domain._id.toString())) {
      const existingJob = this.scheduledJobs.get(domain._id.toString());
      existingJob.stop();
    }

    // Create a new scheduled job
    const job = cron.schedule(
      domain.scrapingInterval || config.defaultScrapingInterval,
      async () => {
        try {
          console.log(
            `Running scheduled scraping for ${domain.name} (${domain.url})`
          );
          const keywords = await this.getActiveKeywords();
          await scrapingService.scrapeUrl(domain.url, keywords);
        } catch (error) {
          console.error(
            `Error in scheduled scraping for ${domain.url}: ${error.message}`
          );
        }
      }
    );

    // Store the job reference
    this.scheduledJobs.set(domain._id.toString(), job);
    console.log(
      `Scheduled domain ${domain.name} with interval: ${
        domain.scrapingInterval || config.defaultScrapingInterval
      }`
    );
  }

  /**
   * Schedule a global scraping operation
   */
  scheduleGlobalScraping() {
    // Schedule a daily operation to scrape all domains
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running global scraping operation');
        await scrapingService.runScrapingOperation();
      } catch (error) {
        console.error(`Error in global scraping operation: ${error.message}`);
      }
    });

    this.scheduledJobs.set('global', job);
    console.log('Scheduled global scraping operation (daily at midnight)');
  }

  /**
   * Get all active keywords
   * @returns {Promise<Array>} - Array of keyword strings
   */
  async getActiveKeywords() {
    const keywords = await Keyword.find({ active: true });
    return keywords.map((k) => k.text);
  }

  /**
   * Update domain schedule
   * @param {string} domainId - Domain ID
   * @param {string} interval - Cron interval string
   * @returns {Promise<Object>} - Updated domain
   */
  async updateDomainSchedule(domainId, interval) {
    try {
      // Update domain in database
      const domain = await Domain.findByIdAndUpdate(
        domainId,
        { scrapingInterval: interval },
        { new: true }
      );

      if (!domain) {
        throw new Error('Domain not found');
      }

      // Update scheduler
      this.scheduleDomain(domain);

      return domain;
    } catch (error) {
      console.error(`Error updating domain schedule: ${error.message}`);
      throw error;
    }
  }

  /**
   * Manually trigger a scraping operation
   * @param {string} domainId - Optional domain ID to scrape
   * @returns {Promise<Object>} - Results of the scraping operation
   */
  async triggerScraping(domainId) {
    try {
      if (domainId) {
        // Scrape specific domain
        const domain = await Domain.findById(domainId);

        if (!domain) {
          throw new Error('Domain not found');
        }

        const keywords = await this.getActiveKeywords();
        const jobs = await scrapingService.scrapeUrl(domain.url, keywords);

        return {
          domain: domain.name,
          jobsFound: jobs.length,
        };
      } else {
        // Scrape all domains
        return await scrapingService.runScrapingOperation();
      }
    } catch (error) {
      console.error(`Error triggering scraping: ${error.message}`);
      throw error;
    }
  }
}

// Create and export the scheduler service instance
const schedulerService = new SchedulerService();

export const initializeScheduler = async () => {
  await schedulerService.initialize();
};

export default schedulerService;
