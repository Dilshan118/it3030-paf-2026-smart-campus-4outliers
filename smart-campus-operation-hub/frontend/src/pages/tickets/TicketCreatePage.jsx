import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../../api/ticketApi';
import TicketForm from '../../components/tickets/TicketForm';
import { ChevronLeft } from 'lucide-react';

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await createTicket(data);
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, marginBottom: '24px', fontWeight: 500 }}
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
        Back
      </button>

      <h1 style={{ marginBottom: '32px' }}>Raise a Request</h1>
      
      {error && <div className="card" style={{ color: '#be123c', backgroundColor: '#fee2e2' }}>{error}</div>}
      
      <TicketForm onSubmit={handleSubmit} onCancel={() => navigate('/tickets')} />
    </div>
  );
}
