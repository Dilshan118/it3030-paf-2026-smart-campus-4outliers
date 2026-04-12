import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../../api/ticketApi';
import TicketForm from '../../components/tickets/TicketForm';

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create New Ticket</h2>
      {error && <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>Error: {error}</div>}
      <TicketForm onSubmit={handleSubmit} onCancel={() => navigate('/tickets')} />
    </div>
  );
}
