import React, { useContext } from 'react';
import { Ticket, CalendarDays, Box, Activity, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="h1" style={{ marginBottom: '8px', fontSize: '3rem' }}>Welcome back, {user?.name || 'User'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
          Live metrics and pending integrations across your domain.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Live Ticket Metric */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>Active Tickets</span>
            <div style={{ color: 'var(--accent-base)' }}>
              <Ticket size={24} strokeWidth={2} />
            </div>
          </div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Live
          </div>
          <NavLink to="/tickets" style={{ textDecoration: 'none', color: 'var(--accent-base)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Manage Queue <span aria-hidden="true">&rarr;</span>
          </NavLink>
        </div>

        {/* Global SLA Health */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>SLA Health</span>
            <div style={{ color: 'var(--info)' }}>
              <Activity size={24} strokeWidth={2} />
            </div>
          </div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '12px', fontFamily: 'var(--font-display)' }}>
            100%
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Based on active resolution timers.
          </div>
        </div>

        {/* Pending Module: Bookings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', opacity: 0.5, borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>Facility Bookings</span>
            <div style={{ color: 'var(--text-muted)' }}>
              <CalendarDays size={24} strokeWidth={2} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            Awaiting Deployment
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
            Module configuration pending.
          </div>
        </div>

        {/* Pending Module: Resources */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', opacity: 0.5, borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>Resource Sync</span>
            <div style={{ color: 'var(--text-muted)' }}>
              <Box size={24} strokeWidth={2} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            Awaiting Deployment
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
            Hardware node detection pending.
          </div>
        </div>
      </div>
    </div>
  );
}
