import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources, searchResources } from '../../api/resourceApi';

const TYPE_OPTIONS = ['ALL', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const typeLabel = (type) => type.replace('_', ' ');

const statusClass = (status) =>
  status === 'ACTIVE' ? 'status-open' : 'status-closed';

export default function ResourceListPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: '', location: '', minCapacity: '' });

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const hasFilters = filters.type || filters.location || filters.minCapacity;
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;

      const res = hasFilters
        ? await searchResources(params)
        : await getAllResources();

      setResources(res.data.content || []);
    } catch (err) {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleReset = () => {
    setFilters({ type: '', location: '', minCapacity: '' });
    setTimeout(fetchResources, 0);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 className="h1">Campus Resources</h2>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Browse and book available facilities and equipment
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label className="label-text">Type</label>
          <select
            className="input-field"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value === 'ALL' ? '' : e.target.value })}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t === 'ALL' ? '' : t}>{typeLabel(t)}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label className="label-text">Location</label>
          <input
            className="input-field"
            placeholder="e.g. Block A"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label className="label-text">Min Capacity</label>
          <input
            className="input-field"
            type="number"
            placeholder="e.g. 30"
            value={filters.minCapacity}
            onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {/* States */}
      {loading && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading resources...</p>
      )}
      {error && (
        <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{error}</p>
      )}

      {/* Resource Grid */}
      {!loading && !error && resources.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            No resources found. Try adjusting your filters.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/resources/${resource.id}`)}
          >
            {/* Image placeholder */}
            <div style={{
              width: '100%', height: '140px', background: 'var(--bg-primary)',
              border: '1px solid var(--border-main)', marginBottom: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', borderRadius: '4px'
            }}>
              {resource.imageUrl
                ? <img src={`http://localhost:8080${resource.imageUrl}`} alt={resource.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.parentNode.innerHTML = '<span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem;">NO IMAGE</span>'; }} />
                : <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>NO IMAGE</span>
              }
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ color: 'var(--info)', borderColor: 'var(--info)' }}>
                {typeLabel(resource.type)}
              </span>
              <span className={`badge ${statusClass(resource.status)}`}>
                {resource.status}
              </span>
            </div>

            {/* Info */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '8px', textTransform: 'uppercase' }}>
              {resource.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>
              📍 {resource.location}
            </p>
            {resource.capacity && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                👥 Capacity: {resource.capacity}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}