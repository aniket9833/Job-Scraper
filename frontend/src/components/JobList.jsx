import { useState, useEffect } from 'react';
import { getJobs, deleteJob } from '../api/api';
import PriorityBadge from './common/PriorityBadge';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    domain: '',
    dateFrom: '',
    dateTo: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs(
        filters,
        pagination.page,
        pagination.limit
      );
      setJobs(response.data.jobs);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }));
      setLoading(false);
    } catch (err) {
      setError('Failed to load jobs', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    fetchJobs();
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        fetchJobs();
      } catch (err) {
        setError('Failed to delete job', err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading && jobs.length === 0)
    return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="job-list">
      <h1>Job Listings</h1>

      <form className="filter-form" onSubmit={handleFilterSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="keyword"
            placeholder="Filter by keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="domain"
            placeholder="Filter by domain"
            value={filters.domain}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            name="dateFrom"
            placeholder="From date"
            value={filters.dateFrom}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            name="dateTo"
            placeholder="To date"
            value={filters.dateTo}
            onChange={handleFilterChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
      </form>

      {jobs.length === 0 ? (
        <div className="no-jobs">No jobs found matching your criteria</div>
      ) : (
        <>
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Domain</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {job.title}
                      </a>
                    </td>
                    <td>{job.domain}</td>
                    <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                    <td>
                      <PriorityBadge priority={job.priority} />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn btn-sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={pagination.page === totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default JobList;
