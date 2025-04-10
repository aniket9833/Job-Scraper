import { useState, useEffect } from 'react';
import { getKeywords, addKeyword, updateKeywordPriority } from '../api/api';
import PriorityBadge from './common/PriorityBadge';

function KeywordManagement() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newKeyword, setNewKeyword] = useState({
    text: '',
    priority: 5,
  });
  const [editMode, setEditMode] = useState({
    id: null,
  });

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await getKeywords();
      setKeywords(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load keywords', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.text) return;

    try {
      await addKeyword(newKeyword);
      fetchKeywords();
      setNewKeyword({
        text: '',
        priority: 5,
      });
    } catch (err) {
      setError('Failed to add keyword', err);
    }
  };

  const handleEditPriority = (id, priority) => {
    setEditMode({ id: null });

    updateKeywordPriority(id, priority)
      .then(fetchKeywords)
      .catch(() => setError('Failed to update priority'));
  };

  const handleBatchAdd = () => {
    const batchText = prompt('Enter multiple keywords separated by commas:');
    if (!batchText) return;

    const keywordArray = batchText
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);

    Promise.all(
      keywordArray.map((text) =>
        addKeyword({
          text,
          priority: 5,
        })
      )
    )
      .then(fetchKeywords)
      .catch(() => setError('Failed to add some keywords'));
  };

  if (loading && keywords.length === 0)
    return <div className="loading">Loading keywords...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="keyword-management">
      <h1>Keyword Management</h1>

      <form className="keyword-form" onSubmit={handleAddKeyword}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="text">Keyword</label>
            <input
              type="text"
              id="text"
              value={newKeyword.text}
              onChange={(e) =>
                setNewKeyword({ ...newKeyword, text: e.target.value })
              }
              placeholder="javascript"
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
              value={newKeyword.priority}
              onChange={(e) =>
                setNewKeyword({
                  ...newKeyword,
                  priority: parseInt(e.target.value),
                })
              }
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Add Keyword
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBatchAdd}
          >
            Batch Add
          </button>
        </div>
      </form>

      {keywords.length === 0 ? (
        <div className="no-keywords">No keywords added yet</div>
      ) : (
        <div className="keywords-container">
          {keywords.map((keyword) => (
            <div key={keyword._id} className="keyword-tag">
              <span className="keyword-text">{keyword.text}</span>
              {editMode.id === keyword._id ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="priority-input"
                  defaultValue={keyword.priority}
                  onBlur={(e) =>
                    handleEditPriority(keyword._id, parseInt(e.target.value))
                  }
                  autoFocus
                />
              ) : (
                <div
                  className="priority-container"
                  onClick={() => setEditMode({ id: keyword._id })}
                >
                  <PriorityBadge priority={keyword.priority} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KeywordManagement;
