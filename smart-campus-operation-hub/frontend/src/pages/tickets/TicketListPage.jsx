import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, LayoutGrid, Rows3, Search, X, CalendarDays, Sparkles, Briefcase, User as UserIcon, Globe } from 'lucide-react';
import { getTickets } from '../../api/ticketApi';
import TicketCard from '../../components/tickets/TicketCard';
import { AuthContext } from '../../context/AuthContext';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CATEGORY_OPTIONS = ['IT_ISSUE', 'SAFETY', 'CLEANING', 'FACILITY_DAMAGE', 'EQUIPMENT_MALFUNCTION', 'OTHER'];
const ASSIGNEE_OPTIONS = ['ASSIGNED', 'UNASSIGNED', 'MINE'];
const SLA_OPTIONS = ['BREACHED', 'DUE_SOON', 'ON_TRACK'];

const EMPTY_FILTERS = {
  query: '',
  status: '',
  priority: '',
  category: '',
  assignee: '',
  reporter: '',
  slaState: '',
  createdFrom: '',
  createdTo: '',
};

function formatEnum(value) {
  if (!value) return 'All';
  return value.replace(/_/g, ' ');
}

function isSlaBreached(ticket) {
  if (!ticket?.slaDeadline) return false;
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'REJECTED') return false;
  const deadline = new Date(ticket.slaDeadline);
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now();
}

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null)
  );
}

export default function TicketListPage() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, totalElements: 0 });

  const currentTab = useMemo(() => {
    if (filters.assignee === 'MINE') return 'workbench';
    if (filters.reporter === 'MINE') return 'reports';
    return 'all';
  }, [filters]);

  const hasActiveFilters = useMemo(
    () => Object.entries(filters).some(([k, v]) => v !== '' && v != null && k !== 'assignee' && k !== 'reporter'),
    [filters]
  );

  const queueInsights = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === 'OPEN').length;
    const inProgress = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
    const critical = tickets.filter((ticket) => ticket.priority === 'CRITICAL').length;
    const breached = tickets.filter((ticket) => isSlaBreached(ticket)).length;
    return { open, inProgress, critical, breached };
  }, [tickets]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size,
        sort,
        ...cleanFilters(filters),
      };

      const res = await getTickets(params);
      const payload = res?.data || {};
      const content = Array.isArray(payload.content) ? payload.content : [];

      setTickets(content);
      setPageInfo({
        totalPages: Math.max(1, Number(payload.totalPages || 1)),
        totalElements: Number(payload.totalElements || content.length),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setTickets([]);
      setPageInfo({ totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, page, size, sort]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateDraft = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setPage(0);
    setFilters({ ...draftFilters });
  };

  useEffect(() => {
    // Handle query params (e.g. from Dashboard)
    const params = new URLSearchParams(window.location.search);
    if (params.get('reporter') === 'MINE') {
      applyQuickPreset('MY_REPORTS');
    }
  }, []);

  const resetFilters = () => {
    setPage(0);
    setDraftFilters({ ...EMPTY_FILTERS });
    setFilters({ ...EMPTY_FILTERS });
  };

  const applyQuickPreset = (preset) => {
    const presets = {
      MY_QUEUE: { ...EMPTY_FILTERS, assignee: 'MINE', status: 'IN_PROGRESS' },
      MY_REPORTS: { ...EMPTY_FILTERS, reporter: 'MINE' },
      CRITICAL: { ...EMPTY_FILTERS, priority: 'CRITICAL' },
      SLA_RISK: { ...EMPTY_FILTERS, slaState: 'BREACHED' },
      UNASSIGNED: { ...EMPTY_FILTERS, assignee: 'UNASSIGNED', status: 'OPEN' },
    };

    const selected = presets[preset] || EMPTY_FILTERS;
    setPage(0);
    setDraftFilters(selected);
    setFilters(selected);
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .operations-tabs {
          display: flex; gap: 4px; background: var(--bg-surface); padding: 6px; border-radius: 100px;
          margin-bottom: 32px; width: 100%; box-shadow: var(--ambient-shadow);
        }
        .op-tab {
          flex: 1; justify-content: center;
          padding: 12px 16px; border-radius: 100px; font-size: 0.9rem; font-weight: 700;
          color: var(--text-muted); cursor: pointer; transition: all 0.3s ease;
          display: flex; align-items: center; gap: 8px; border: none; background: transparent;
        }
        .op-tab.active {
          background: var(--accent-base); color: white; box-shadow: 0 4px 12px rgba(42, 20, 180, 0.3);
        }
        .op-tab:hover:not(.active) {
          background: var(--bg-surface-elevated); color: var(--text-main);
        }

        .page-header {
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px;
        }
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem); font-family: var(--font-display); font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); line-height: 1.1;
        }
        .controls-bar {
          display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
        }
        .icon-btn {
          display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;
          border-radius: 12px; background: var(--bg-surface); color: var(--text-muted);
          transition: all 0.3s ease; border: none; cursor: pointer; box-shadow: var(--ambient-shadow);
        }
        .icon-btn:hover {
          color: var(--accent-base); transform: translateY(-2px); box-shadow: var(--ambient-shadow-hover);
        }
        .quick-chip {
          border: none;
          border-radius: 999px;
          padding: 8px 14px;
          background: var(--bg-surface);
          color: var(--text-main);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .quick-chip:hover {
          background: var(--accent-muted);
          color: var(--accent-base);
        }
      `}</style>

      <div className="page-header">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Incident Management
          </div>
          <h1 className="page-title">
            Service <span style={{ color: 'var(--text-muted)' }}>Tickets</span>
          </h1>
        </div>

        <div className="controls-bar">
          <button className="icon-btn" title="Toggle Filters" onClick={() => setShowFilters((open) => !open)}>
            <Filter size={20} strokeWidth={2} />
          </button>
          <button
            className="icon-btn"
            title="Grid View"
            onClick={() => setViewMode('grid')}
            style={{ color: viewMode === 'grid' ? 'var(--accent-base)' : undefined }}
          >
            <LayoutGrid size={20} strokeWidth={2} />
          </button>
          <button
            className="icon-btn"
            title="List View"
            onClick={() => setViewMode('list')}
            style={{ color: viewMode === 'list' ? 'var(--accent-base)' : undefined }}
          >
            <Rows3 size={20} strokeWidth={2} />
          </button>
          <select
            value={sort}
            onChange={(event) => {
              setPage(0);
              setSort(event.target.value);
            }}
            style={{
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              padding: '0 14px',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              boxShadow: 'var(--ambient-shadow)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
            }}
          >
            <option value="createdAt,desc">Newest First</option>
            <option value="createdAt,asc">Oldest First</option>
            <option value="priority,desc">Priority Desc</option>
            <option value="priority,asc">Priority Asc</option>
            <option value="slaDeadline,asc">Closest SLA</option>
          </select>

          <Link to="/tickets/new" className="btn-primary" style={{ textDecoration: 'none', marginLeft: '12px' }}>
            <Plus size={20} strokeWidth={2} /> Create Ticket
          </Link>
        </div>
      </div>

      {user?.role === 'TECHNICIAN' && (
        <div className="operations-tabs">
          <button 
            className={`op-tab ${currentTab === 'all' ? 'active' : ''}`}
            onClick={() => { setPage(0); setFilters(EMPTY_FILTERS); setDraftFilters(EMPTY_FILTERS); }}
          >
            <Globe size={16} /> All Items
          </button>
          <button 
            className={`op-tab ${currentTab === 'workbench' ? 'active' : ''}`}
            onClick={() => applyQuickPreset('MY_QUEUE')}
          >
            <Briefcase size={16} /> My Workbench
          </button>
          <button 
            className={`op-tab ${currentTab === 'reports' ? 'active' : ''}`}
            onClick={() => applyQuickPreset('MY_REPORTS')}
          >
            <UserIcon size={16} /> My Requests
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
        <button className="quick-chip" onClick={() => applyQuickPreset('MY_QUEUE')}>My Queue</button>
        <button className="quick-chip" onClick={() => applyQuickPreset('CRITICAL')}>Critical Queue</button>
        <button className="quick-chip" onClick={() => applyQuickPreset('SLA_RISK')}>SLA Risk</button>
        <button className="quick-chip" onClick={() => applyQuickPreset('UNASSIGNED')}>Unassigned</button>
      </div>

      {showFilters && (
        <div style={{ 
          marginBottom: '28px', 
          background: 'var(--bg-surface)', 
          padding: '16px', 
          borderRadius: '20px', 
          boxShadow: '0 8px 32px rgba(42, 20, 180, 0.04), 0 2px 8px rgba(0,0,0,0.02)',
          border: '1px solid rgba(42, 20, 180, 0.05)',
          animation: 'pageReveal 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Main Search Row */}
          <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-base)' }}>
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={draftFilters.query}
              onChange={(event) => updateDraft('query', event.target.value)}
              placeholder="Search description, exact reporter ID, or resource..."
              style={{ 
                flex: 1, 
                padding: '16px 20px 16px 48px', 
                background: 'var(--bg-primary)', 
                border: '1px solid transparent', 
                borderRadius: '14px', 
                fontSize: '1.05rem',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px var(--accent-muted)'; e.target.style.background = 'var(--bg-surface)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--bg-primary)'; }}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
            <button className="btn-primary" onClick={applyFilters} style={{ padding: '0 28px', borderRadius: '14px', whiteSpace: 'nowrap' }}>
              Search
            </button>
          </div>

          {/* Inline Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
              <Filter size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              Filters
            </div>
            
            <select 
              value={draftFilters.status} 
              onChange={(event) => updateDraft('status', event.target.value)} 
              style={{ padding: '8px 32px 8px 16px', background: 'var(--bg-primary)', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: draftFilters.status ? 'var(--accent-base)' : 'var(--text-main)', cursor: 'pointer', appearance: 'none', position: 'relative' }}
            >
              <option value="">Status: All</option>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
            </select>

            <select 
              value={draftFilters.priority} 
              onChange={(event) => updateDraft('priority', event.target.value)} 
              style={{ padding: '8px 32px 8px 16px', background: 'var(--bg-primary)', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: draftFilters.priority ? 'var(--accent-base)' : 'var(--text-main)', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">Priority: All</option>
              {PRIORITY_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
            </select>

            <select 
              value={draftFilters.category} 
              onChange={(event) => updateDraft('category', event.target.value)} 
              style={{ padding: '8px 32px 8px 16px', background: 'var(--bg-primary)', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: draftFilters.category ? 'var(--accent-base)' : 'var(--text-main)', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">Category: All</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
            </select>

            <select 
              value={draftFilters.assignee} 
              onChange={(event) => updateDraft('assignee', event.target.value)} 
              style={{ padding: '8px 32px 8px 16px', background: 'var(--bg-primary)', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: draftFilters.assignee ? 'var(--accent-base)' : 'var(--text-main)', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">Assignee: Any</option>
              {ASSIGNEE_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
            </select>

            <select 
              value={draftFilters.slaState} 
              onChange={(event) => updateDraft('slaState', event.target.value)} 
              style={{ padding: '8px 32px 8px 16px', background: 'var(--bg-primary)', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: draftFilters.slaState ? 'var(--accent-base)' : 'var(--text-main)', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">SLA: Any State</option>
              {SLA_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
            </select>

            <div style={{ flex: 1 }} />

            {(draftFilters.query || draftFilters.status || draftFilters.priority || draftFilters.category || draftFilters.assignee || draftFilters.slaState) && (
              <button onClick={resetFilters} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '100px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-muted)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X size={14} strokeWidth={2.5} /> Clear Active
              </button>
            )}
          </div>
          
          <style>{`
            select {
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-position: right 12px center;
            }
          `}</style>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Active Open</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{queueInsights.open}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{queueInsights.inProgress}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Critical Queue</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: queueInsights.critical > 0 ? 'var(--danger)' : 'var(--text-main)', lineHeight: 1 }}>{queueInsights.critical}</div>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>SLA Breaches</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: queueInsights.breached > 0 ? 'var(--danger)' : 'var(--success)', lineHeight: 1 }}>{queueInsights.breached}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
          {pageInfo.totalElements} Tickets Found {hasActiveFilters && <span style={{ color: 'var(--accent-base)' }}>• Filtered</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={14} color="var(--text-muted)" />
          <select
            value={size}
            onChange={(event) => {
              setPage(0);
              setSize(Number(event.target.value));
            }}
            style={{ border: 'none', borderRadius: '10px', padding: '8px 10px', background: 'var(--bg-surface)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', boxShadow: 'var(--ambient-shadow)' }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        
        {error && (
          <div className="card" style={{ background: 'var(--danger-muted)', color: 'var(--danger)', display: 'flex', alignItems: 'center', padding: '24px' }}>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>ERR_SYNC:</strong>&nbsp; {error}
          </div>
        )}
        
        {!loading && !error && tickets.length === 0 && (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
               <Filter size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Queue is empty</h3>
            <p style={{ color: 'var(--text-muted)' }}>No active service tickets found in the system.</p>
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div style={{ 
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(360px, 1fr))' : undefined,
            flexDirection: viewMode === 'grid' ? undefined : 'column',
            gap: '16px'
          }}>
            {tickets.map(t => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </div>

      {!loading && !error && tickets.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Page {page + 1} of {pageInfo.totalPages}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page <= 0}
            >
              Previous
            </button>
            <button
              className="btn-secondary"
              onClick={() => setPage((current) => Math.min(pageInfo.totalPages - 1, current + 1))}
              disabled={page + 1 >= pageInfo.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && !error && tickets.length === 0 && hasActiveFilters && (
        <div style={{ marginTop: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} /> Try broadening your filters or using a quick preset.
        </div>
      )}
    </div>
  );
}
