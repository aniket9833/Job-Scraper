import { useState, useEffect } from 'react';
import { getJobStats, getDomains, getKeywords } from '../api/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    newJobsToday: 0,
    activeKeywords: 0,
    activeDomains: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, domainsRes, keywordsRes] = await Promise.all([
          getJobStats(),
          getDomains(),
          getKeywords(),
        ]);

        setStats({
          totalJobs: statsRes.data.totalJobs || 0,
          newJobsToday: statsRes.data.newJobsToday || 0,
          activeKeywords: keywordsRes.data.length || 0,
          activeDomains: domainsRes.data.length || 0,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalJobs}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.newJobsToday}</div>
          <div className="stat-label">New Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeKeywords}</div>
          <div className="stat-label">Keywords</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeDomains}</div>
          <div className="stat-label">Domains</div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = '/manual-scrape')}
        >
          Manual Scrape
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
