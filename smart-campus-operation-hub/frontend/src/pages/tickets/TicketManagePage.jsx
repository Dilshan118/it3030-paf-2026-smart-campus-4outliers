import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getTickets, assignTechnician, updateTicketStatus, deleteTicket, reopenTicket } from '../../api/ticketApi';
import api from '../../api/axiosConfig';
import {
  Briefcase,
  Activity,
  CheckCircle,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
  FolderCheck,
  Search,
  X,
  AlertTriangle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  slaState: '',
  createdFrom: '',
  createdTo: '',
};

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null)
  );
}

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

function toCsvValue(value) {
  const normalized = value == null ? '' : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

export default function TicketManagePage() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, totalElements: 0 });

  useEffect(() => {
    api.get('/users/technicians')
      .then((res) => setTechnicians(res.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setActionError('');

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
      setActionError(err.response?.data?.message || err.message);
      setTickets([]);
      setPageInfo({ totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, page, size, sort]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== '' && value != null),
    [filters]
  );

  const queueInsights = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === 'OPEN').length;
    const active = tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;
    const unassigned = tickets.filter((ticket) => !ticket.assignedToId).length;
    const breached = tickets.filter((ticket) => isSlaBreached(ticket)).length;
    return { open, active, unassigned, breached };
  }, [tickets]);

  const updateDraft = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setPage(0);
    setFilters({ ...draftFilters });
  };

  const clearFilters = () => {
    setPage(0);
    setDraftFilters({ ...EMPTY_FILTERS });
    setFilters({ ...EMPTY_FILTERS });
  };

  const applyPreset = (preset) => {
    const presets = {
      OPEN_UNASSIGNED: { ...EMPTY_FILTERS, status: 'OPEN', assignee: 'UNASSIGNED' },
      CRITICAL: { ...EMPTY_FILTERS, priority: 'CRITICAL' },
      SLA_BREACHED: { ...EMPTY_FILTERS, slaState: 'BREACHED' },
      MY_ASSIGNMENTS: { ...EMPTY_FILTERS, assignee: 'MINE' },
    };

    const selected = presets[preset] || EMPTY_FILTERS;
    setPage(0);
    setDraftFilters(selected);
    setFilters(selected);
  };

  const exportVisibleTicketsCsv = () => {
    if (!tickets.length) return;

    const headers = [
      'Ticket ID',
      'Category',
      'Priority',
      'Status',
      'Reporter',
      'Assigned Technician',
      'SLA Deadline',
      'Created At',
      'Description',
    ];

    const rows = tickets.map((ticket) => [
      ticket.id,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.userStudentId ? `${ticket.userName} (${ticket.userStudentId})` : ticket.userName,
      ticket.assignedToName || '',
      ticket.slaDeadline || '',
      ticket.createdAt || '',
      ticket.description || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-page-${page + 1}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAssign = async (ticketId, event) => {
    const techId = Number(event.target.value);
    if (!techId) return;

    try {
      setActionError('');
      await assignTechnician(ticketId, techId);
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to assign technician: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this ticket?')) return;

    try {
      setActionError('');
      await deleteTicket(id);
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResolve = async (ticket) => {
    if (!ticket.assignedToId) {
      setActionError('Assign a technician before resolving this ticket.');
      return;
    }

    const notes = window.prompt('Resolution Notes:', 'Resolved by admin operations');
    if (!notes || notes.trim().length < 10) {
      setActionError('Resolution notes must be at least 10 characters.');
      return;
    }

    try {
      setActionError('');
      await updateTicketStatus(ticket.id, 'RESOLVED', notes.trim(), '');
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to resolve: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Close this resolved ticket?')) return;

    try {
      setActionError('');
      await updateTicketStatus(ticketId, 'CLOSED', '', '');
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to close: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReopenTicket = async (ticketId) => {
    const reason = window.prompt('Reason for reopening (minimum 10 characters):', '') || '';
    if (reason.trim().length < 10) {
      setActionError('Reopen reason must be at least 10 characters.');
      return;
    }

    try {
      setActionError('');
      await reopenTicket(ticketId, reason.trim());
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to reopen: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-end;
          gap: 32px;
          margin-bottom: 30px;
        }
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-main);
          line-height: 1.1;
        }
        .data-row {
          display: grid;
          grid-template-columns: minmax(210px, 2.1fr) 150px 130px 130px minmax(220px, 2fr) 120px;
          gap: 16px;
          padding: 24px;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          transition: background 0.2s;
        }
        .data-row:hover { background: rgba(42, 20, 180, 0.02); }
        .data-row:last-child { border-bottom: none; }
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
            Central Administration
          </div>
          <h1 className="page-title">
            Operations <span style={{ color: 'var(--text-muted)' }}>Log</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => setShowFilters((open) => !open)}>
            <SlidersHorizontal size={18} /> Filters
          </button>
          <button className="btn-secondary" onClick={fetchTickets}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="btn-secondary" onClick={exportVisibleTicketsCsv} disabled={!tickets.length}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
        <button className="quick-chip" onClick={() => applyPreset('OPEN_UNASSIGNED')}>Open + Unassigned</button>
        <button className="quick-chip" onClick={() => applyPreset('CRITICAL')}>Critical Queue</button>
        <button className="quick-chip" onClick={() => applyPreset('SLA_BREACHED')}>SLA Breached</button>
        <button className="quick-chip" onClick={() => applyPreset('MY_ASSIGNMENTS')}>My Assignments</button>
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={draftFilters.query}
                  onChange={(event) => updateDraft('query', event.target.value)}
                  placeholder="Search description, reporter, assignee, resource"
                  className="input-field"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Status</label>
              <select className="input-field" value={draftFilters.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="">All</option>
                {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
              </select>
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Priority</label>
              <select className="input-field" value={draftFilters.priority} onChange={(event) => updateDraft('priority', event.target.value)}>
                <option value="">All</option>
                {PRIORITY_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
              </select>
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Category</label>
              <select className="input-field" value={draftFilters.category} onChange={(event) => updateDraft('category', event.target.value)}>
                <option value="">All</option>
                {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
              </select>
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Assignee</label>
              <select className="input-field" value={draftFilters.assignee} onChange={(event) => updateDraft('assignee', event.target.value)}>
                <option value="">All</option>
                {ASSIGNEE_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
              </select>
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>SLA State</label>
              <select className="input-field" value={draftFilters.slaState} onChange={(event) => updateDraft('slaState', event.target.value)}>
                <option value="">All</option>
                {SLA_OPTIONS.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
              </select>
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Created From</label>
              <input type="date" className="input-field" value={draftFilters.createdFrom} onChange={(event) => updateDraft('createdFrom', event.target.value)} />
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Created To</label>
              <input type="date" className="input-field" value={draftFilters.createdTo} onChange={(event) => updateDraft('createdTo', event.target.value)} />
            </div>

            <div>
              <label className="label-text" style={{ marginBottom: '6px', display: 'inline-block' }}>Sort</label>
              <select className="input-field" value={sort} onChange={(event) => { setPage(0); setSort(event.target.value); }}>
                <option value="createdAt,desc">Newest First</option>
                <option value="createdAt,asc">Oldest First</option>
                <option value="priority,desc">Priority Desc</option>
                <option value="priority,asc">Priority Asc</option>
                <option value="slaDeadline,asc">Closest SLA</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={clearFilters}><X size={16} /> Clear</button>
            <button className="btn-primary" onClick={applyFilters}><Search size={16} /> Apply Filters</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Open</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{queueInsights.open}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Work</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{queueInsights.active}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unassigned</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{queueInsights.unassigned}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SLA Breached</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: queueInsights.breached > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{queueInsights.breached}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
          {pageInfo.totalElements} Tickets Found {hasActiveFilters && <span style={{ color: 'var(--accent-base)' }}>• Filtered</span>}
        </div>

        <select
          value={size}
          onChange={(event) => {
            setPage(0);
            setSize(Number(event.target.value));
          }}
          style={{ border: 'none', borderRadius: '10px', padding: '8px 10px', background: 'var(--bg-surface)', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', boxShadow: 'var(--ambient-shadow)' }}
        >
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {actionError && (
        <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>SYS_ERR:</strong> {actionError}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
              <Activity size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Log is clear</h3>
            <p style={{ color: 'var(--text-muted)' }}>No operations data found for the current filters.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(210px, 2.1fr) 150px 130px 130px minmax(220px, 2fr) 120px', gap: '16px', padding: '16px 24px', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div>Issue Details</div>
              <div>Status</div>
              <div>Priority</div>
              <div>SLA</div>
              <div>Assignment</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tickets.map((ticket) => {
                const canAssign = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';
                const breached = isSlaBreached(ticket);

                return (
                  <div key={ticket.id} className="data-row" style={{ background: breached ? 'rgba(225, 42, 69, 0.04)' : undefined }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Link to={`/tickets/${ticket.id}`} style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {ticket.category.replace('_', ' ')}
                      </Link>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>
                        #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className={`status-badge status-${ticket.status.toLowerCase()}`}>{ticket.status.replace('_', ' ')}</span>
                    </div>

                    <div>
                      <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                    </div>

                    <div>
                      {breached ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '999px', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          <AlertTriangle size={12} /> Breached
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : 'N/A'}
                        </span>
                      )}
                    </div>

                    <div>
                      <select
                        value={ticket.assignedToId || ''}
                        onChange={(event) => handleAssign(ticket.id, event)}
                        disabled={!canAssign}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-surface-elevated)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          color: 'var(--text-main)',
                          outline: 'none',
                          cursor: canAssign ? 'pointer' : 'not-allowed',
                          opacity: canAssign ? 1 : 0.6,
                        }}
                      >
                        <option value="">Unassigned</option>
                        {technicians.map((technician) => (
                          <option key={technician.id} value={technician.id}>{technician.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(42, 20, 180, 0.05)', color: 'var(--accent-base)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Edit Ticket"
                      >
                        <Briefcase size={16} strokeWidth={2} />
                      </Link>

                      {ticket.status === 'IN_PROGRESS' && ticket.assignedToId && (
                        <button
                          onClick={() => handleResolve(ticket)}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Quick Resolve"
                        >
                          <CheckCircle size={18} strokeWidth={2} />
                        </button>
                      )}

                      {ticket.status === 'RESOLVED' && (
                        <button
                          onClick={() => handleCloseTicket(ticket.id)}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(42, 20, 180, 0.08)', color: 'var(--accent-base)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Close Ticket"
                        >
                          <FolderCheck size={17} strokeWidth={2} />
                        </button>
                      )}

                      {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                        <button
                          onClick={() => handleReopenTicket(ticket.id)}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Reopen Ticket"
                        >
                          <RotateCcw size={16} strokeWidth={2} />
                        </button>
                      )}

                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(225, 42, 69, 0.1)', color: 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Delete Ticket"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!loading && !actionError && tickets.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Page {page + 1} of {pageInfo.totalPages}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page <= 0}>
              Previous
            </button>
            <button className="btn-secondary" onClick={() => setPage((current) => Math.min(pageInfo.totalPages - 1, current + 1))} disabled={page + 1 >= pageInfo.totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
