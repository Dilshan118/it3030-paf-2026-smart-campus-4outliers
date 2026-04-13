import React from 'react';
import { Link } from 'react-router-dom';

export default function TicketCard({ ticket }) {
  const { id, category, priority, status, description, createdAt, title } = ticket;

  return (
    <Link to={`/tickets/${id}`} className="data-row ticket-row" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(0, 1.5fr) 1fr 120px', 
      gap: '24px', 
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit',
      padding: '24px 20px',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--on-surface-variant)', fontWeight: '600' }}>
          Ticket #{id} - {title || category.replaceAll('_', ' ')}
        </h3>
        <p style={{ margin: 0, color: 'var(--on-surface)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
        <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', textAlign: 'right' }}>
        {new Date(createdAt).toLocaleDateString()}
      </div>
    </Link>
  );
}
