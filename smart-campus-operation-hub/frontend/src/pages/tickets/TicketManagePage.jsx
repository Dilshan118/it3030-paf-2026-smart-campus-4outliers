import React, { useContext, useEffect, useState } from 'react';
import { getTickets, assignTechnician, updateTicketStatus, deleteTicket } from '../../api/ticketApi';
import api from '../../api/axiosConfig';
import { Briefcase, Activity, CheckCircle, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function TicketManagePage() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    api.get('/users/technicians')
      .then(res => setTechnicians(res.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getTickets({ page: 0, size: 50 });
      setTickets(res.data?.content || []);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleAssign = async (ticketId, e) => {
    const techId = e.target.value;
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
    if (!window.confirm("Are you sure you want to completely delete this ticket?")) return;
    try {
      setActionError('');
      await deleteTicket(id);
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  }

  const handleResolve = async (ticketId) => {
    const notes = window.prompt("Resolution Notes:", "Resolved by admin operations");
    if (!notes) return;
    try {
      setActionError('');
      await updateTicketStatus(ticketId, 'RESOLVED', notes, '');
      await fetchTickets();
    } catch (err) {
      setActionError('Failed to resolve: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-header {
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px;
        }
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem); font-family: var(--font-display); font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); line-height: 1.1;
        }
        .data-row {
          display: grid; grid-template-columns: minmax(200px, 2fr) 150px 150px 200px 100px;
          gap: 16px; padding: 24px; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.03);
          transition: background 0.2s;
        }
        .data-row:hover { background: rgba(42, 20, 180, 0.02); }
        .data-row:last-child { border-bottom: none; }
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

        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary">
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>
      </div>

      {actionError && (
        <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <p style={{ color: 'var(--text-muted)' }}>No operations data found.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 150px 150px 200px 100px', gap: '16px', padding: '16px 24px', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div>Issue Details</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Assignment</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tickets.map(t => (
                <div key={t.id} className="data-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link to={`/tickets/${t.id}`} style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {t.category.replace('_', ' ')}
                    </Link>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>
                      #{t.id} • {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div><span className={`status-badge status-${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span></div>
                  
                  <div><span className={`priority-badge priority-${t.priority.toLowerCase()}`}>{t.priority}</span></div>
                  
                  <div>
                    {(() => {
                      const isAssignable = t.status === 'OPEN' || t.status === 'IN_PROGRESS';
                      return (
                     <select 
                       value={t.assignedToId || ''} 
                       onChange={(e) => handleAssign(t.id, e)}
                       disabled={!isAssignable}
                       style={{ 
                         width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
                         background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', 
                         fontSize: '0.8rem', color: 'var(--text-main)', outline: 'none', cursor: isAssignable ? 'pointer' : 'not-allowed',
                         opacity: isAssignable ? 1 : 0.6
                       }}
                     >
                       <option value="">Unassigned</option>
                       {technicians.map(tech => (
                         <option key={tech.id} value={tech.id}>{tech.name}</option>

                       ))}
                     </select>
                      );
                    })()}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Link to={`/tickets/${t.id}`} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(42, 20, 180, 0.05)', color: 'var(--accent-base)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      title="Edit Ticket"
                    >
                      <Briefcase size={16} strokeWidth={2} />
                    </Link>
                    {t.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleResolve(t.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="Quick Resolve"
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--success)'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = 'var(--success)'; }}
                      >
                        <CheckCircle size={18} strokeWidth={2} />
                      </button>
                    )}

                    {user?.role === 'ADMIN' && (
                      <button 
                        onClick={() => handleDeleteTicket(t.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(225, 42, 69, 0.1)', color: 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', marginLeft: '8px' }}
                        title="Delete Ticket"
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(225, 42, 69, 0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
