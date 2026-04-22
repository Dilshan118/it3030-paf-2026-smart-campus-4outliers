import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, UserRound, Sparkles } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

function formatEnum(value) {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ');
}

export default function TicketCard({ ticket }) {
  const { user: currentUser } = useContext(AuthContext);
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
    userId: reporterId,
    slaDeadline
  } = ticket;

  const isAssignedToMe = currentUser?.id === assignedToId;
  const isReportedByMe = currentUser?.id === reporterId;

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
      display: 'flex', 
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '24px', 
      justifyContent: 'space-between',
      alignItems: 'center',
      textDecoration: 'none',
      padding: '24px 32px',
      cursor: 'pointer',
      borderRadius: 'var(--radius-lg)',
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(25, 28, 30, 0.02)',
      backgroundColor: 'var(--surface-container-lowest)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      e.currentTarget.style.boxShadow = 'var(--ambient-shadow-hover)';
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.005)';
      const icon = e.currentTarget.querySelector('.card-icon');
      if(icon) {
        icon.style.opacity = '1';
        icon.style.transform = 'translateX(0)';
      }
      const bgGlow = e.currentTarget.querySelector('.bg-glow');
      if(bgGlow) bgGlow.style.opacity = '1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(25, 28, 30, 0.02)';
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      const icon = e.currentTarget.querySelector('.card-icon');
      if(icon) {
        icon.style.opacity = '0';
        icon.style.transform = 'translateX(-10px)';
      }
      const bgGlow = e.currentTarget.querySelector('.bg-glow');
      if(bgGlow) bgGlow.style.opacity = '0';
    }}
    >
      <div className="bg-glow" style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(circle at right, rgba(42, 20, 180, 0.03) 0%, transparent 70%)', opacity: 0, transition: 'opacity 0.6s ease', pointerEvents: 'none' }} />
      
      <div style={{ flex: '1 1 min(100%, 400px)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{id}</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {title || `${formatEnum(category)} Ticket`}
          </h3>
          {isAssignedToMe && (
            <span style={{ fontSize: '0.65rem', background: 'var(--accent-gradient)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Assigned to You
            </span>
          )}
          {isReportedByMe && !isAssignedToMe && (
            <span style={{ fontSize: '0.65rem', background: 'var(--bg-surface-elevated)', color: 'var(--accent-base)', border: '1px solid var(--accent-muted)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reported by You
            </span>
          )}
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' }}>
          {description || 'No description provided.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', position: 'relative', zIndex: 1 }}>
        <span className={`status-badge status-${(status || 'open').toLowerCase()}`}>{formatEnum(status)}</span>
        <span className={`priority-badge priority-${(priority || 'low').toLowerCase()}`}>{formatEnum(priority)}</span>
        
        {slaState && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: slaState === 'BREACHED' ? 'var(--danger-muted)' : (slaState === 'DUE_SOON' ? 'rgba(234, 179, 8, 0.1)' : 'var(--success-muted)'),
              color: slaState === 'BREACHED' ? 'var(--danger)' : (slaState === 'DUE_SOON' ? 'var(--warning)' : 'var(--success)'),
            }}
          >
            {slaState !== 'ON_TRACK' && <AlertTriangle size={12} strokeWidth={2.5} />} 
            {slaCountdown}
          </span>
        )}
        
        {(assignedToName || assignedToId) && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            borderRadius: '999px',
            padding: '6px 12px',
            background: 'var(--accent-muted)',
            color: 'var(--accent-base)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 600,
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <UserRound size={12} strokeWidth={2.5} />
            {assignedToName || `Tech #${assignedToId}`}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
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

