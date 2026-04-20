import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, LayoutGrid } from 'lucide-react';
import { getTickets } from '../../api/ticketApi';
import TicketCard from '../../components/tickets/TicketCard';

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getTickets({ page: 0, size: 20 });
      setTickets(res.data.content);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
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
        .controls-bar {
          display: flex; gap: 16px; align-items: center;
        }
        .icon-btn {
          display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;
          border-radius: 12px; background: var(--bg-surface); color: var(--text-muted);
          transition: all 0.3s ease; border: none; cursor: pointer; box-shadow: var(--ambient-shadow);
        }
        .icon-btn:hover {
          color: var(--accent-base); transform: translateY(-2px); box-shadow: var(--ambient-shadow-hover);
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
          <button className="icon-btn" title="Filter Tickets">
            <Filter size={20} strokeWidth={2} />
          </button>
          <button className="icon-btn" title="Grid View">
            <LayoutGrid size={20} strokeWidth={2} />
          </button>
          <Link to="/tickets/new" className="btn-primary" style={{ textDecoration: 'none', marginLeft: '12px' }}>
            <Plus size={20} strokeWidth={2} /> Create Ticket
          </Link>
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
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px'
          }}>
            {tickets.map(t => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
