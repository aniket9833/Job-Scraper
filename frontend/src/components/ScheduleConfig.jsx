import { useState, useEffect } from 'react';
import { runScraping, triggerScraping, getDomains } from '../api/api';

function ScheduleConfig() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const response = await getDomains();
        setDomains(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load domains', err);
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const handleTriggerScraping = async () => {
    try {
      setLoading(true);
      await triggerScraping();
      setSuccess('Manual scraping triggered successfully');
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to trigger scraping', err);
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRunFullScraping = async () => {
    if (
      !window.confirm(
        'Are you sure you want to run a full scraping operation? This may take some time.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await runScraping();
      setSuccess('Full scraping operation started successfully');
      setLoading(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to run full scraping operation', err);
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading && domains.length === 0)
    return <div className="loading">Loading schedule data...</div>;

  return (
    <div className="schedule-config">
      <h1>Schedule Configuration</h1>

      <div className="schedule-actions">
        <div className="action-card">
          <h3>Manual Trigger</h3>
          <p>
            Manually trigger the scraping process based on the domain priorities
          </p>
          <button
            className="btn btn-primary"
            onClick={handleTriggerScraping}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Trigger Now'}
          </button>
        </div>

        <div className="action-card">
          <h3>Full Scraping</h3>
          <p>
            Run a complete scraping operation on all domains (may take time)
          </p>
          <button
            className="btn btn-secondary"
            onClick={handleRunFullScraping}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Run Full Scrape'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {success && <div className="success-message">{success}</div>}

      <div className="schedule-overview">
        <h2>Domain Schedules</h2>

        {domains.length === 0 ? (
          <div className="no-domains">No domains configured yet</div>
        ) : (
          <div className="domains-table-container">
            <table className="domains-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Schedule (CRON)</th>
                  <th>Priority</th>
                  <th>Next Run</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain._id}>
                    <td>{domain.url}</td>
                    <td>{domain.schedule}</td>
                    <td>
                      <PriorityBadge priority={domain.priority} />
                    </td>
                    <td>
                      {domain.nextRun
                        ? new Date(domain.nextRun).toLocaleString()
                        : 'Not scheduled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="cron-helper">
        <h3>CRON Expression Guide</h3>
        <div className="cron-examples">
          <div className="cron-example">
            <code>0 0 * * *</code>
            <span>Every day at midnight</span>
          </div>
          <div className="cron-example">
            <code>0 */6 * * *</code>
            <span>Every 6 hours</span>
          </div>
          <div className="cron-example">
            <code>0 9 * * 1-5</code>
            <span>Every weekday at 9 AM</span>
          </div>
          <div className="cron-example">
            <code>0 0 1 * *</code>
            <span>First day of each month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleConfig;
