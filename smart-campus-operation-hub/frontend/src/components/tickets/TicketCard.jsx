import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, UserRound } from 'lucide-react';

function formatEnum(value) {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ');
}

export default function TicketCard({ ticket }) {
  const {
    id,
    category,
    priority,
    status,
    description,
    createdAt,
    title,
    assignedToName,
    assignedToId,
    slaDeadline
  } = ticket;

  const [slaCountdown, setSlaCountdown] = useState(null);
  const [slaState, setSlaState] = useState(null);

  useEffect(() => {
    if (!slaDeadline || status === 'RESOLVED' || status === 'CLOSED' || status === 'REJECTED') {
      setSlaState(null);
      setSlaCountdown(null);
      return;
    }

    const calculateSla = () => {
      const deadline = new Date(slaDeadline).getTime();
      if (Number.isNaN(deadline)) return;

      const diffMs = deadline - Date.now();
      
      if (diffMs < 0) {
        setSlaState('BREACHED');
        const absDiff = Math.abs(diffMs);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        setSlaCountdown(`Breached ${hours}h ${mins}m ago`);
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffMs <= 4 * 60 * 60 * 1000) {
          setSlaState('DUE_SOON');
        } else {
          setSlaState('ON_TRACK');
        }
        setSlaCountdown(`${hours}h ${mins}m left`);
      }
    };

    calculateSla();
    const intervalId = setInterval(calculateSla, 60000); // update every minute

    return () => clearInterval(intervalId);
  }, [slaDeadline, status]);

  return (
    <Link to={`/tickets/${id}`} className="card" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(0, 2fr) 1fr auto', 
      gap: '32px', 
      alignItems: 'center',
      textDecoration: 'none',
      padding: '24px 32px',
      cursor: 'pointer',
      borderRadius: 'var(--radius-lg)',
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(25, 28, 30, 0.02)',
      backgroundColor: 'var(--surface-container-lowest)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      e.currentTarget.style.boxShadow = 'var(--ambient-shadow)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      const icon = e.currentTarget.querySelector('.card-icon');
      if(icon) {
        icon.style.opacity = '1';
        icon.style.transform = 'translateX(0)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(25, 28, 30, 0.02)';
      e.currentTarget.style.transform = 'translateY(0)';
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
            {title || `${formatEnum(category)} Ticket`}
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' }}>
          {description || 'No description provided.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className={`status-badge status-${(status || 'open').toLowerCase()}`}>{formatEnum(status)}</span>
        <span className={`priority-badge priority-${(priority || 'low').toLowerCase()}`}>{formatEnum(priority)}</span>
        
        {slaState && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: slaState === 'BREACHED' ? 'var(--danger-muted)' : (slaState === 'DUE_SOON' ? 'rgba(234, 179, 8, 0.1)' : 'var(--success-muted)'),
              color: slaState === 'BREACHED' ? 'var(--danger)' : (slaState === 'DUE_SOON' ? 'var(--warning)' : 'var(--success)'),
            }}
          >
            {slaState !== 'ON_TRACK' && <AlertTriangle size={12} />} 
            {slaCountdown}
          </span>
        )}
        
        {(assignedToName || assignedToId) && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            borderRadius: '999px',
            padding: '6px 10px',
            background: 'var(--accent-muted)',
            color: 'var(--accent-base)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <UserRound size={12} />
            {assignedToName || `Tech #${assignedToId}`}
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

