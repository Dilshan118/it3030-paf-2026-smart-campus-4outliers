import React from 'react';
import { Link } from 'react-router-dom';

export default function TicketCard({ ticket }) {
  const { id, category, priority, status, description, createdAt } = ticket;

  const statusColors = {
    OPEN: { bg: '#e0e7ff', text: '#312e81' },
    IN_PROGRESS: { bg: '#ffedd5', text: '#9a3412' },
    RESOLVED: { bg: '#dcfce7', text: '#166534' },
    CLOSED: { bg: '#f1f5f9', text: '#374151' },
    REJECTED: { bg: '#fee2e2', text: '#991b1b' }
  };
  const sc = statusColors[status] || statusColors.OPEN;

  const priorityColors = {
    LOW: { color: '#047857' },
    MEDIUM: { color: '#b45309' },
    HIGH: { color: '#be123c' },
    CRITICAL: { color: '#9f1239', fontWeight: 'bold' }
  };
  const pc = priorityColors[priority] || priorityColors.LOW;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Ticket #{id} - {category.replace('_', ' ')}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge" style={{ backgroundColor: sc.bg, color: sc.text }}>{status}</span>
          <span className="badge" style={{ backgroundColor: 'var(--surface-container-highest)', color: pc.color, ...pc }}>
            {priority}
          </span>
        </div>
      </div>
      <p style={{ margin: 0, color: 'var(--on-surface)', fontSize: '15px' }}>
        {description?.length > 120 ? description.substring(0, 120) + '...' : description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
        <Link to={`/tickets/${id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
}
