import { useState, useEffect } from 'react';
import {
  getDomains,
  addDomain,
  updateDomainPriority,
  updateDomainSchedule,
} from '../api/api';
import PriorityBadge from './common/PriorityBadge';

function DomainManagement() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDomain, setNewDomain] = useState({
    url: '',
    priority: 5,
    schedule: '0 0 * * *', // Daily at midnight by default
  });
  const [editMode, setEditMode] = useState({
    id: null,
    field: null,
  });

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

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.url) return;

    try {
      await addDomain(newDomain);
      fetchDomains();
      setNewDomain({
        url: '',
        priority: 5,
        schedule: '0 0 * * *',
      });
    } catch (err) {
      setError('Failed to add domain', err);
    }
  };

  const handleEditField = (id, field, value) => {
    setEditMode({
      id: null,
      field: null,
    });

    if (field === 'priority') {
      updateDomainPriority(id, value)
        .then(fetchDomains)
        .catch(() => setError('Failed to update priority'));
    } else if (field === 'schedule') {
      updateDomainSchedule(id, value)
        .then(fetchDomains)
        .catch(() => setError('Failed to update schedule'));
    }
  };

  if (loading && domains.length === 0)
    return <div className="loading">Loading domains...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="domain-management">
      <h1>Domain Management</h1>

      <form className="domain-form" onSubmit={handleAddDomain}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="url">Domain URL</label>
            <input
              type="text"
              id="url"
              value={newDomain.url}
              onChange={(e) =>
                setNewDomain({ ...newDomain, url: e.target.value })
              }
              placeholder="https://example.com/jobs"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority (1-10)</label>
            <input
              type="number"
              id="priority"
              min="1"
              max="10"
              value={newDomain.priority}
              onChange={(e) =>
                setNewDomain({
                  ...newDomain,
                  priority: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="schedule">Schedule (CRON)</label>
            <input
              type="text"
              id="schedule"
              value={newDomain.schedule}
              onChange={(e) =>
                setNewDomain({ ...newDomain, schedule: e.target.value })
              }
              placeholder="0 0 * * *"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Add Domain
          </button>
        </div>
      </form>

      {domains.length === 0 ? (
        <div className="no-domains">No domains added yet</div>
      ) : (
        <div className="domains-table-container">
          <table className="domains-table">
            <thead>
              <tr>
                <th>Domain URL</th>
                <th>Priority</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={domain._id}>
                  <td>{domain.url}</td>
                  <td>
                    {editMode.id === domain._id &&
                    editMode.field === 'priority' ? (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        defaultValue={domain.priority}
                        onBlur={(e) =>
                          handleEditField(
                            domain._id,
                            'priority',
                            parseInt(e.target.value)
                          )
                        }
                        autoFocus
                      />
                    ) : (
                      <div
                        className="editable"
                        onClick={() =>
                          setEditMode({ id: domain._id, field: 'priority' })
                        }
                      >
                        <PriorityBadge priority={domain.priority} />
                      </div>
                    )}
                  </td>
                  <td>
                    {editMode.id === domain._id &&
                    editMode.field === 'schedule' ? (
                      <input
                        type="text"
                        defaultValue={domain.schedule}
                        onBlur={(e) =>
                          handleEditField(
                            domain._id,
                            'schedule',
                            e.target.value
                          )
                        }
                        autoFocus
                      />
                    ) : (
                      <div
                        className="editable"
                        onClick={() =>
                          setEditMode({ id: domain._id, field: 'schedule' })
                        }
                      >
                        {domain.schedule}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DomainManagement;
