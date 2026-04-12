import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tickets</h2>
        <Link to="/tickets/new" style={{ 
          backgroundColor: 'var(--accent)', 
          color: 'white', 
          padding: '8px 16px', 
          textDecoration: 'none', 
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          + New Ticket
        </Link>
      </div>

      {loading && <p>Loading tickets...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && tickets.length === 0 && <p>No tickets found. Create one!</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {tickets.map(t => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
