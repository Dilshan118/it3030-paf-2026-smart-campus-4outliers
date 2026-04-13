import React from 'react';
import { Ticket, CalendarDays, Box, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="page-container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="h1" style={{ marginBottom: '8px' }}>Operation Scope</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem' }}>
          Live metrics and pending integrations across your domain.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Live Ticket Metric */}
        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>Active Tickets</span>
            <div style={{ padding: '8px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: 'var(--primary)' }}>
              <Ticket size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Live
          </div>
          <NavLink to="/tickets" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Manage Queue <span aria-hidden="true">&rarr;</span>
          </NavLink>
        </div>

        {/* Global SLA Health */}
        <div className="metric-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>SLA Health</span>
            <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#059669' }}>
              <Activity size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            Active <span style={{ fontSize: '1rem', color: '#059669', fontWeight: 500 }}>Targeting 100%</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
            Based on active resolution timers.
          </div>
        </div>

        {/* Pending Module: Bookings */}
        <div className="metric-card-muted" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>Facility Bookings</span>
            <div style={{ padding: '8px', backgroundColor: 'var(--surface-container-high)', borderRadius: '8px', color: 'var(--on-surface-variant)' }}>
              <CalendarDays size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '16px', opacity: 0.7 }}>
            Awaiting Deployment
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
            Module configuration pending.
          </div>
        </div>

        {/* Pending Module: Resources */}
        <div className="metric-card-muted" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span className="label-text" style={{ margin: 0 }}>Resource Sync</span>
            <div style={{ padding: '8px', backgroundColor: 'var(--surface-container-high)', borderRadius: '8px', color: 'var(--on-surface-variant)' }}>
              <Box size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '16px', opacity: 0.7 }}>
            Awaiting Deployment
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
            Hardware node detection pending.
          </div>
        </div>
      </div>
    </div>
  );
}
