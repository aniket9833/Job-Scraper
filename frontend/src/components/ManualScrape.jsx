import { useState } from 'react';
import { scrapeUrl } from '../api/api';

function ManualScrape() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('URL is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Convert comma-separated keywords to array
      const keywordsArray = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);

      const response = await scrapeUrl(url, keywordsArray);
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError('Scraping failed. Please check the URL and try again.', err);
      setLoading(false);
    }
  };

  return (
    <div className="manual-scrape">
      <h1>Manual Scrape</h1>

      <form className="scrape-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">URL to Scrape</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/jobs"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="keywords">Keywords (comma separated)</label>
          <input
            type="text"
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="developer, javascript, react"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Scraping...' : 'Start Scraping'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-container">
          <h2>Scraping Results</h2>
          <div className="result-summary">
            <p>Found {result.jobsFound} job(s)</p>
            <p>New jobs added: {result.newJobs}</p>
            <p>Duplicates skipped: {result.duplicates}</p>
          </div>

          {result.jobsFound > 0 && (
            <div className="result-actions">
              <button
                className="btn btn-secondary"
                onClick={() => (window.location.href = '/jobs')}
              >
                View All Jobs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManualScrape;
