import Domain from '../models/Domain.js';
import Keyword from '../models/Keyword.js';

class PriorityManager {
  /**
   * Sort domains by priority (highest first)
   * @param {Array} domains - Array of domain objects
   * @returns {Array} - Sorted domains
   */
  sortDomainsByPriority(domains) {
    return [...domains].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Sort keywords by priority (highest first)
   * @param {Array} keywords - Array of keyword objects
   * @returns {Array} - Sorted keywords
   */
  sortKeywordsByPriority(keywords) {
    return [...keywords].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update domain priority
   * @param {string} domainId - Domain ID
   * @param {number} priority - New priority value
   * @returns {Promise<Object>} - Updated domain
   */
  async updateDomainPriority(domainId, priority) {
    const domain = await Domain.findByIdAndUpdate(
      domainId,
      { priority },
      { new: true }
    );

    if (!domain) {
      throw new Error('Domain not found');
    }

    return domain;
  }

  /**
   * Update keyword priority
   * @param {string} keywordId - Keyword ID
   * @param {number} priority - New priority value
   * @returns {Promise<Object>} - Updated keyword
   */
  async updateKeywordPriority(keywordId, priority) {
    const keyword = await Keyword.findByIdAndUpdate(
      keywordId,
      { priority },
      { new: true }
    );

    if (!keyword) {
      throw new Error('Keyword not found');
    }

    return keyword;
  }

  /**
   * Get scraping tasks in priority order
   * @returns {Promise<Array>} - Array of scraping tasks with domains and keywords
   */
  async getPrioritizedScrapingTasks() {
    // Get all active domains and keywords
    const domains = await Domain.find({ active: true }).sort({ priority: -1 });
    const keywords = await Keyword.find({ active: true }).sort({
      priority: -1,
    });

    // Create tasks by combining domains and keywords
    const tasks = [];

    for (const domain of domains) {
      tasks.push({
        domain,
        keywords: keywords.map((k) => k.text),
        priority: domain.priority,
      });
    }

    return tasks;
  }
}

export default new PriorityManager();
