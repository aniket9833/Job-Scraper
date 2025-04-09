import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config/serverConfig.js';

export class Scraper {
  constructor() {
    this.axios = axios.create({
      timeout: config.requestTimeout,
      headers: {
        'User-Agent': config.userAgent,
      },
    });
  }

  /**
   * Fetches HTML content from a URL
   * @param {string} url - The URL to fetch
   * @returns {Promise<string>} - The HTML content
   */
  async fetchHTML(url) {
    try {
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}: ${error.message}`);
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }

  /**
   * Extract job data from a page based on keywords
   * @param {string} html - The HTML content
   * @param {string} url - The source URL
   * @param {string[]} keywords - Keywords to search for
   * @returns {Array} - Array of job objects
   */
  extractJobs(html, url, keywords) {
    const $ = cheerio.load(html);
    const jobs = [];
    const keywordsLower = keywords.map((k) => k.toLowerCase());

    // We'll use common job listing patterns to identify job posts
    // This approach avoids hardcoded selectors but looks for common patterns

    // Look for elements containing job information
    $('body')
      .find('*')
      .each(function () {
        const element = $(this);
        const text = element.text().trim();

        // Skip elements with very little text
        if (text.length < 30) return;

        // Check if the element contains any keywords
        const containsKeyword = keywordsLower.some((keyword) =>
          text.toLowerCase().includes(keyword)
        );

        if (containsKeyword) {
          // Potential job posting found
          // Try to extract job information from this element and nearby elements

          // Look for potential job title
          let title = '';
          let description = '';

          // Check if this element has a header-like tag within it or nearby
          const potentialTitle = element
            .find('h1, h2, h3, h4, h5, strong, b')
            .first()
            .text()
            .trim();

          if (
            potentialTitle &&
            potentialTitle.length > 0 &&
            potentialTitle.length < 200
          ) {
            title = potentialTitle;
          } else {
            // Check for short text paragraphs that might be titles
            const shortText = element
              .find('p')
              .filter(function () {
                const txt = $(this).text().trim();
                return txt.length > 5 && txt.length < 100;
              })
              .first()
              .text()
              .trim();

            if (shortText) {
              title = shortText;
            } else {
              // Just use the first part of the text as title
              title = text.substring(0, Math.min(100, text.length));
            }
          }

          // Set the longer text as description
          description = text;

          // Try to extract company name
          let company = '';
          const companyElement = element
            .find('*')
            .filter(function () {
              const txt = $(this).text().trim();
              return (
                txt.length > 0 &&
                txt.length < 50 &&
                !txt.includes(title) &&
                /company|employer|inc\.|ltd\.|llc/i.test(txt)
              );
            })
            .first();

          if (companyElement.length) {
            company = companyElement.text().trim();
          } else {
            company = 'Unknown Company';
          }

          // Try to identify location
          let location = '';
          const locationElements = element.find('*').filter(function () {
            const txt = $(this).text().trim();
            return (
              txt.length > 0 &&
              txt.length < 100 &&
              /location|remote|on-site|hybrid|city|state|zip/i.test(txt)
            );
          });

          if (locationElements.length) {
            location = locationElements.first().text().trim();
          }

          // Try to identify salary information
          let salary = '';
          const salaryElements = element.find('*').filter(function () {
            const txt = $(this).text().trim();
            return (
              txt.length > 0 &&
              /salary|\$|USD|per hour|per year|annually/i.test(txt)
            );
          });

          if (salaryElements.length) {
            salary = salaryElements.first().text().trim();
          }

          // Try to extract a job URL if there's a link
          let jobUrl = '';
          const links = element.find('a');

          if (links.length) {
            const href = links.first().attr('href');
            if (href) {
              // Convert to absolute URL if needed
              if (href.startsWith('http')) {
                jobUrl = href;
              } else if (href.startsWith('/')) {
                const urlObj = new URL(url);
                jobUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
              } else {
                jobUrl = new URL(href, url).href;
              }
            }
          }

          if (!jobUrl) {
            jobUrl = url;
          }

          // Check if this job is unique (not already in our list)
          const isDuplicate = jobs.some(
            (job) => job.title === title && job.company === company
          );

          if (!isDuplicate && title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Not specified',
              description,
              salary: salary || 'Not specified',
              url: jobUrl,
              sourceUrl: url,
              keywords: keywordsLower.filter((keyword) =>
                text.toLowerCase().includes(keyword)
              ),
              postedDate: new Date(),
            });
          }
        }
      });

    return jobs;
  }

  /**
   * Scrape jobs from a URL based on keywords
   * @param {string} url - The URL to scrape
   * @param {string[]} keywords - Keywords to search for
   * @returns {Promise<Array>} - Array of job objects
   */
  async scrapeJobs(url, keywords) {
    try {
      console.log(`Scraping ${url} for keywords: ${keywords.join(', ')}`);
      const html = await this.fetchHTML(url);
      const jobs = this.extractJobs(html, url, keywords);
      console.log(`Found ${jobs.length} potential jobs at ${url}`);
      return jobs;
    } catch (error) {
      console.error(`Error scraping jobs from ${url}: ${error.message}`);
      return [];
    }
  }
}

export default new Scraper();
