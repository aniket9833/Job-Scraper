import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scraping endpoints
export const scrapeUrl = (url, keywords) =>
  api.post('/scraping/url', { url, keywords });

export const runScraping = () => api.post('/scraping/run');

export const triggerScraping = () => api.post('/scraping/trigger');

// Domain endpoints
export const getDomains = () => api.get('/scraping/domains');

export const addDomain = (domain) => api.post('/scraping/domains', domain);

export const updateDomainPriority = (id, priority) =>
  api.put(`/scraping/domains/${id}/priority`, { priority });

export const updateDomainSchedule = (id, schedule) =>
  api.put(`/scraping/domains/${id}/schedule`, { schedule });

// Keyword endpoints
export const getKeywords = () => api.get('/scraping/keywords');

export const addKeyword = (keyword) => api.post('/scraping/keywords', keyword);

export const updateKeywordPriority = (id, priority) =>
  api.put(`/scraping/keywords/${id}/priority`, { priority });

// Job endpoints
export const getJobs = (filters = {}, page = 1, limit = 10) =>
  api.get('/jobs', { params: { ...filters, page, limit } });

export const getJobStats = () => api.get('/jobs/stats');

export const getJob = (id) => api.get(`/jobs/${id}`);

export const deleteJob = (id) => api.delete(`/jobs/${id}`);

export default api;
