import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Ticket, Box, CalendarCheck, TrendingUp, BarChart3, ShieldCheck, Clock, Zap } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1/admin/analytics';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    totalResources: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data && res.data.data) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for sparklines
  const sparklineData = [30, 45, 25, 60, 40, 70, 50, 85, 65, 90, 75, 100];

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 24px;
        }
        .dash-subtitle {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--accent-base);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dash-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-main);
          line-height: 1;
        }
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 32px;
          flex: 1;
        }
        .card-neo {
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--ambient-shadow);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .card-neo:hover {
          transform: translateY(-4px);
          box-shadow: var(--ambient-shadow-hover);
        }
        /* Hero Card specific */
        .hero-card {
          grid-column: span 12;
          background: var(--accent-gradient);
          color: var(--text-inverse);
          padding: 48px;
        }
        @media (min-width: 1024px) {
          .hero-card { grid-column: span 8; }
          .stat-card { grid-column: span 4; }
          .sub-card { grid-column: span 4; }
        }
        @media (max-width: 1023px) {
          .stat-card, .sub-card { grid-column: span 6; }
        }
        @media (max-width: 768px) {
          .stat-card, .sub-card { grid-column: span 12; }
        }

        .metric-huge {
          font-size: clamp(3rem, 6vw, 5rem);
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 16px 0;
        }
        .metric-large {
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
          color: var(--text-main);
          margin: 16px 0;
        }
        .label-neo {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
        }
        
        .sparkline-container {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 60px;
          margin-top: auto;
          padding-top: 32px;
          opacity: 0.8;
        }
        .sparkline-bar {
          flex: 1;
          background: var(--bg-surface-elevated);
          border-radius: 4px;
          transition: height 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--success-muted);
          color: var(--success);
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-neo .icon-box.accent { background: var(--accent-muted); color: var(--accent-base); }
        .card-neo .icon-box.info { background: rgba(14, 165, 233, 0.08); color: var(--info); }
        .card-neo .icon-box.success { background: var(--success-muted); color: var(--success); }
        .card-neo .icon-box.danger { background: var(--danger-muted); color: var(--danger); }

        .split-stats {
          display: flex;
          background: var(--bg-surface-elevated);
          border-radius: var(--radius);
          padding: 24px;
          margin-top: 24px;
        }
        .split-stat-item {
          flex: 1;
        }
      `}</style>

      <div className="dash-header">
        <div>
          <div className="dash-subtitle">
            <Activity size={16} /> Intelligence Hub
          </div>
          <h1 className="dash-title">
            System <span style={{ color: 'var(--text-muted)' }}>Telemetry</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="status-indicator">
            <div className="pulse-dot"></div>
            SYSTEM OPERATIONAL
          </div>
          <button className="btn-secondary" onClick={fetchMetrics} disabled={loading}>
            <Zap size={18} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--accent-muted)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="dash-grid">
          
          {/* Main Hero Card: Tickets Volume */}
          <div className="card-neo hero-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="label-neo" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Ticket Volume</span>
                <div className="metric-huge">{metrics.totalTickets}</div>
              </div>
              <div className="icon-box" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                <Ticket size={28} strokeWidth={2} />
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
              <div style={{ display: 'flex', gap: '48px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{metrics.resolvedTickets}</div>
                  <div className="label-neo" style={{ color: 'rgba(255,255,255,0.7)' }}>Resolved</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{metrics.openTickets}</div>
                  <div className="label-neo" style={{ color: 'rgba(255,255,255,0.7)' }}>Active</div>
                </div>
              </div>
              {/* Abstract decorative bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.totalTickets > 0 ? (metrics.resolvedTickets / metrics.totalTickets) * 100 : 0}%`, height: '100%', background: '#fff', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          {/* SLA / Performance */}
          <div className="card-neo stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="label-neo" style={{ color: 'var(--text-muted)' }}>Resolution Rate</span>
              <div className="icon-box success">
                <ShieldCheck size={24} strokeWidth={2} />
              </div>
            </div>
            <div className="metric-large">
              {metrics.totalTickets > 0 ? Math.round((metrics.resolvedTickets / metrics.totalTickets) * 100) : 0}%
            </div>
            
            <div className="sparkline-container">
              {sparklineData.map((val, i) => (
                <div key={i} className="sparkline-bar" style={{ height: `${val}%`, background: i === sparklineData.length - 1 ? 'var(--success)' : 'var(--bg-surface-elevated)' }} />
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="card-neo sub-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="label-neo" style={{ color: 'var(--text-muted)' }}>Asset Catalog</span>
              <div className="icon-box info">
                <Box size={24} strokeWidth={2} />
              </div>
            </div>
            <div className="metric-large">{metrics.totalResources}</div>
            
            <div className="split-stats">
              <div className="split-stat-item">
                <div className="label-neo" style={{ fontSize: '0.7rem' }}>Tracked Entities</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '4px', color: 'var(--info)' }}>ACTIVE</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <TrendingUp size={18} />
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="card-neo sub-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="label-neo" style={{ color: 'var(--text-muted)' }}>Reservations</span>
              <div className="icon-box accent">
                <CalendarCheck size={24} strokeWidth={2} />
              </div>
            </div>
            <div className="metric-large">{metrics.totalBookings}</div>

            <div className="split-stats">
              <div className="split-stat-item">
                <div className="label-neo" style={{ fontSize: '0.7rem' }}>Scheduling Volume</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '4px', color: 'var(--accent-base)' }}>PROCESSING</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Clock size={18} />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
