import React from 'react';
import { Link } from 'react-router-dom';

export default function TicketCard({ ticket }) {
  const { id, category, priority, status, description, createdAt } = ticket;

  const statusColor = {
    OPEN: 'blue',
    IN_PROGRESS: 'orange',
    RESOLVED: 'green',
    CLOSED: 'gray',
    REJECTED: 'red'
  }[status] || 'blue';

  const priorityColor = {
    LOW: 'green',
    MEDIUM: 'orange',
    HIGH: 'red',
    CRITICAL: 'darkred'
  }[priority] || 'gray';

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      textAlign: 'left',
      backgroundColor: 'var(--code-bg)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Ticket #{id} - {category}</h3>
        <div>
          <span style={{ 
            backgroundColor: statusColor, 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '12px',
            marginRight: '8px'
          }}>
            {status}
          </span>
          <span style={{ 
            border: `1px solid ${priorityColor}`, 
            color: priorityColor, 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '12px'
          }}>
            {priority}
          </span>
        </div>
      </div>
      <p style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>
        {description?.length > 100 ? description.substring(0, 100) + '...' : description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text)' }}>
        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
        <Link to={`/tickets/${id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
}
