import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

export default function TicketCard({ ticket }) {
  const { id, category, priority, status, description, createdAt, title, assignedToId } = ticket;

  return (
    <Link to={`/tickets/${id}`} className="card" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(0, 2fr) 1fr auto', 
      gap: '32px', 
      alignItems: 'center',
      textDecoration: 'none',
      padding: '32px',
      cursor: 'pointer',
      borderRadius: 'var(--radius)',
      borderBottom: '1px solid rgba(0,0,0,0.03)',
      boxShadow: 'none',
      backgroundColor: 'transparent'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      e.currentTarget.style.boxShadow = 'var(--ambient-shadow)';
      e.currentTarget.style.transform = 'translateX(8px)';
      const icon = e.currentTarget.querySelector('.card-icon');
      if(icon) {
        icon.style.opacity = '1';
        icon.style.transform = 'translateX(0)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateX(0)';
      const icon = e.currentTarget.querySelector('.card-icon');
      if(icon) {
        icon.style.opacity = '0';
        icon.style.transform = 'translateX(-10px)';
      }
    }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{id}</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {title || `${category.replace('_', ' ')} Error`}
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span className={`status-badge status-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
        <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>
        {assignedToId && (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid var(--accent-base)', color: 'var(--accent-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
            {assignedToId.toString().substring(0,2)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <Clock size={14} />
          {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        
        <div className="card-icon" style={{ opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', color: 'var(--accent-base)' }}>
          <ArrowRight size={20} strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
