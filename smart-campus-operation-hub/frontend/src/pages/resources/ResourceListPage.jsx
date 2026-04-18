import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Search, Filter, RotateCcw, Building } from 'lucide-react';
import { getAllResources, searchResources } from '../../api/resourceApi';

const TYPE_OPTIONS = ['ALL', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const typeLabel = (type) => type.replace('_', ' ');
const statusClass = (status) => status === 'ACTIVE' ? 'status-open' : 'status-closed';

export default function ResourceListPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: '', location: '', minCapacity: '' });

  const fetchResources = async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const hasFilters = currentFilters.type || currentFilters.location || currentFilters.minCapacity;
      const params = {};
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.location) params.location = currentFilters.location;
      if (currentFilters.minCapacity) params.minCapacity = currentFilters.minCapacity;

      const res = hasFilters ? await searchResources(params) : await getAllResources();
      setResources(res?.data?.content || []);
    } catch (err) {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(filters);
  };

  const handleReset = () => {
    const emptyFilters = { type: '', location: '', minCapacity: '' };
    setFilters(emptyFilters);
    fetchResources(emptyFilters);
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-header {
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px;
        }
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem); font-family: var(--font-display); font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); line-height: 1.1;
        }
        .filter-panel {
          background: var(--bg-surface); padding: 24px; border-radius: var(--radius-lg); 
          box-shadow: var(--ambient-shadow); margin-bottom: 32px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;
        }
        .resource-card {
          background: var(--bg-surface); border-radius: var(--radius-lg); overflow: hidden;
          box-shadow: var(--ambient-shadow); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer;
        }
        .resource-card:hover {
          transform: translateY(-8px); box-shadow: var(--ambient-shadow-hover);
        }
      `}</style>

      <div className="page-header">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Asset Management
          </div>
          <h1 className="page-title">
            Campus <span style={{ color: 'var(--text-muted)' }}>Resources</span>
          </h1>
        </div>
      </div>

      {/* Filter Panel */}
      <form onSubmit={handleSearch} className="filter-panel">
        <div style={{ flex: '1 1 200px' }}>
          <label className="label-text">Resource Type</label>
          <select className="input-field" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value === 'ALL' ? '' : e.target.value })}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t === 'ALL' ? '' : t}>{typeLabel(t)}</option>)}
          </select>
        </div>
        
        <div style={{ flex: '2 1 250px' }}>
          <label className="label-text">Location (Building/Room)</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input-field" style={{ paddingLeft: '44px' }} placeholder="e.g. Block A" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          </div>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <label className="label-text">Capacity (Min)</label>
          <input className="input-field" type="number" placeholder="Size" value={filters.minCapacity} onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary" style={{ padding: '16px 24px' }}>
            <Filter size={18} /> Apply 
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset} style={{ padding: '16px' }} title="Reset Filters">
            <RotateCcw size={18} />
          </button>
        </div>
      </form>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div className="card" style={{ background: 'var(--danger-muted)', color: 'var(--danger)', padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : resources.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
               <Box size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No resources found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Adjust your filters or add new inventory.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {resources.map((resource) => (
              <div key={resource.id} className="resource-card" onClick={() => navigate(`/resources/${resource.id}`)}>
                
                {/* Image Area */}
                <div style={{ height: '200px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {resource.imageUrls?.length > 0 || resource.imageUrl ? (
                    <img 
                      src={`http://localhost:8080${resource.imageUrls?.[0] || resource.imageUrl}`} 
                      alt={resource.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div style={{ display: (resource.imageUrls?.length > 0 || resource.imageUrl) ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                    <Building size={40} strokeWidth={1} style={{ marginBottom: '8px' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>NO IMAGE</span>
                  </div>
                  
                  {/* Floating Status */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: resource.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}/>
                      {resource.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', background: 'var(--info)', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '16px' }}>
                    {typeLabel(resource.type)}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {resource.name}
                  </h3>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📍 {resource.location}
                  </p>
                  
                  {resource.capacity && (
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>
                      👥 Capacity limit: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-base)' }}>{resource.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
