import React from 'react';
import { Link } from 'react-router-dom';

export default function TicketCard({ ticket }) {
  const { id, category, priority, status, description, createdAt, title } = ticket;

  return (
    <Link to={`/tickets/${id}`} className="card" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(0, 1.5fr) 1fr auto', 
      gap: '24px', 
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit',
      padding: '24px',
      cursor: 'pointer'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--on-surface)', fontWeight: '600' }}>
          {title || `Ticket #${id} - ${category.replace('_', ' ')}`}
        </h3>
        <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
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
