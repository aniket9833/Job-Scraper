import scraper from '../utils/scraper.js';
import priorityManager from '../utils/priorityManager.js';
import Job from '../models/Job.js';
import Domain from '../models/Domain.js';
import Keyword from '../models/Keyword.js';
import { config } from '../config/serverConfig.js';

class ScrapingService {
  /**
   * Scrape jobs from a specific URL with keywords
   * @param {string} url - URL to scrape
   * @param {string[]} keywords - Keywords to search for
   * @returns {Promise<Array>} - Array of scraped and saved jobs
   */
  async scrapeUrl(url, keywords) {
    try {
      // Scrape jobs from the URL
      const scrapedJobs = await scraper.scrapeJobs(url, keywords);

      // Save jobs to database and avoid duplicates
      const savedJobs = [];

      for (const jobData of scrapedJobs) {
        jobData.uniqueId = `${jobData.company}-${
          jobData.title
        }-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        try {
          const job = new Job(jobData);
          await job.save();
          savedJobs.push(job);

          // Update keyword counts
          for (const keyword of jobData.keywords) {
            await Keyword.findOneAndUpdate(
              { text: keyword },
              { $inc: { count: 1 } }
            );
          }
        } catch (error) {
          console.error(`Error saving job: ${error.message}`);
        }
      }

      // Update domain's lastScraped timestamp
      await Domain.findOneAndUpdate(
        { url: { $regex: new URL(url).hostname } },
        { lastScraped: new Date() }
      );

      return savedJobs;
    } catch (error) {
      console.error(`Error in scrapeUrl: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run a complete scraping operation based on priorities
   * @returns {Promise<Object>} - Results of the scraping operation
   */
  async runScrapingOperation() {
    try {
      // Get prioritized tasks
      const tasks = await priorityManager.getPrioritizedScrapingTasks();

      // Limit concurrent operations
      const results = {
        totalJobs: 0,
        domains: 0,
        errors: 0,
      };

      // Process in batches to limit concurrency
      const batchSize = config.maxConcurrentScrapes;

      for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);

        // Process batch in parallel
        const batchPromises = batch.map((task) =>
          this.scrapeUrl(task.domain.url, task.keywords)
            .then((jobs) => {
              results.totalJobs += jobs.length;
              results.domains++;
              return jobs;
            })
            .catch((error) => {
              console.error(`Error in batch operation: ${error.message}`);
              results.errors++;
              return [];
            })
        );

        await Promise.all(batchPromises);
      }

      return results;
    } catch (error) {
      console.error(`Error in runScrapingOperation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a new domain to scrape
   * @param {Object} domainData - Domain information
   * @returns {Promise<Object>} - Saved domain
   */
  async addDomain(domainData) {
    try {
      const domain = new Domain(domainData);
      return await domain.save();
    } catch (error) {
      console.error(`Error adding domain: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a new keyword to search for
   * @param {Object} keywordData - Keyword information
   * @returns {Promise<Object>} - Saved keyword
   */
  async addKeyword(keywordData) {
    try {
      const keyword = new Keyword(keywordData);
      return await keyword.save();
    } catch (error) {
      console.error(`Error adding keyword: ${error.message}`);
      throw error;
    }
  }
}

export default new ScrapingService();
