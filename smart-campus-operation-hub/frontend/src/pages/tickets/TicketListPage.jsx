import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Open Tickets</h1>
        <Link to="/tickets/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={20} strokeWidth={1.5} /> New Ticket
        </Link>
      </div>

      {loading && <p style={{ opacity: 0.6 }}>Syncing database...</p>}
      {error && <div className="card" style={{ color: 'red' }}>Error: {error}</div>}
      {!loading && !error && tickets.length === 0 && (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center', opacity: 0.6 }}>
          No tickets found. Raise a new request to get started.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tickets.map(t => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
