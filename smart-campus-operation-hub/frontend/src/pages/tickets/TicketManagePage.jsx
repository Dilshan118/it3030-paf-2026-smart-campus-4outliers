import React, { useEffect, useState } from 'react';
import { getTickets, assignTechnician, updateTicketStatus } from '../../api/ticketApi';
import { Settings, UserPlus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TicketManagePage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // Hardcoded for dummy frontend until user system is up
  const availableTechnicians = [
    { id: 2, name: 'Saman Kumara (Tech)' },
    { id: 3, name: 'Alice Silva (Tech)' }
  ];

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Example of getting all unpaginated or first page of high size for admin view
      const res = await getTickets({ page: 0, size: 50 });
      setTickets(res.data?.content || []);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="h1" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} /> Operations Log
        </h1>
      </div>

      {actionError && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          {actionError}
        </div>
      )}

      <div className="card" style={{ padding: '8px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px 0', opacity: 0.5 }}>Loading operations data...</p>
        ) : tickets.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', opacity: 0.5 }}>No operations logged.</p>
        ) : (
          <div className="no-border-list">
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px 150px 200px 100px', gap: '16px', padding: '8px 16px', borderBottom: 'none', color: 'var(--on-surface-variant)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
              <div>Issue Details</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Assignment</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            {/* List */}
            {tickets.map(t => (
              <div key={t.id} className="data-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px 150px 200px 100px', gap: '16px', padding: '16px', alignItems: 'center', borderRadius: '8px' }}>
                <Link to={`/tickets/${t.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--on-surface-variant)' }}>#{t.id} - {t.category}</span>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</span>
                </Link>
                
                <div><span className={`status-badge status-${t.status.toLowerCase()}`}>{t.status}</span></div>
                
                <div><span className={`priority-badge priority-${t.priority.toLowerCase()}`}>{t.priority}</span></div>
                
                {/* Tech Assignment */}
                <div>
                   <select 
                     value={t.assignedToId || ''} 
                     onChange={(e) => handleAssign(t.id, e)}
                     className="input-field"
                     style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--surface)', margin: 0, width: '100%' }}
                   >
                     <option value="">Unassigned</option>
                     {availableTechnicians.map(tech => (
                       <option key={tech.id} value={tech.id}>{tech.name}</option>
                     ))}
                   </select>
                </div>

                {/* Actions */}
                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                    <button 
                      onClick={() => handleResolve(t.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                      title="Quick Resolve"
                    >
                      <CheckCircle size={20} strokeWidth={1.5} />
                    </button>
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
