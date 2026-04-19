import React, { useContext, useState, useEffect } from 'react';
import { CalendarDays, Box, Activity, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .bento-main { grid-column: span 8; }
        .bento-side { grid-column: span 4; }
        .bento-half { grid-column: span 6; }
        
        @media (max-width: 1024px) {
          .bento-main, .bento-side, .bento-half { grid-column: span 12; }
        }
        
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: var(--success);
          box-shadow: 0 0 12px var(--success);
          animation: pulse-anim 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-anim {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        .dark-hero-card {
          background: var(--accent-base);
          background-image: radial-gradient(circle at 100% 0%, #4d3fcb 0%, transparent 60%);
          color: white;
          border-radius: var(--radius-lg);
          padding: clamp(32px, 4vw, 48px);
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dark-hero-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 40px 60px -15px rgba(42, 20, 180, 0.3);
        }
        .dark-hero-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.3;
          pointer-events: none;
        }

        .metric-value {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
        }
          
        .glass-btn {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 14px 28px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .glass-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateX(4px);
        }
      `}</style>

      {/* Editorial Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px' }}>
        <div style={{ maxWidth: '700px' }}>
          <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            System Overview
          </h1>
          <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '16px' }}>
            Domain status is <span style={{ color: 'var(--success)' }}>Nominal</span>.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
            Welcome to the Smart Campus Operation Hub, {user?.name}. Manage your facilities, review analytics, and monitor global SLA performance in real-time.
          </p>
        </div>

        {/* Live Status Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '16px 24px', borderRadius: '100px', boxShadow: 'var(--ambient-shadow)' }}>
            <div className="pulse-dot"></div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Connection
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', fontWeight: 600 }}>
            <Clock size={16} />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="bento-grid">
        
        {/* Main Hero - Active Operations */}
        <div className="bento-main">
          <div className="dark-hero-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
              <div>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                  Module C Pulse
                </span>
                <div className="metric-value">Active Tickets</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
                <Activity size={40} color="white" />
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, marginTop: '80px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  Queue is currently active.
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                  Technicians are monitoring incoming streams.
                </div>
              </div>
              
              <NavLink to="/tickets" className="glass-btn">
                Manage Queue <ArrowUpRight size={18} />
              </NavLink>
            </div>
          </div>
        </div>

        {/* SLA Health Side Card */}
        <div className="bento-side">
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span className="label-text" style={{ margin: 0 }}>Global SLA Score</span>
              <ShieldCheck size={28} color="var(--success)" />
            </div>
            
            <div className="metric-value" style={{ color: 'var(--text-main)', marginTop: 'auto', marginBottom: '8px' }}>
              100<span style={{ fontSize: '2.5rem', color: 'var(--success)' }}>%</span>
            </div>
            
            {/* Small decorative mini-graph */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px', marginTop: '32px', opacity: 0.6 }}>
              {[40, 70, 45, 90, 65, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, background: i === 5 ? 'var(--success)' : 'var(--bg-surface-elevated)', height: `${h}%`, borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Facility Bookings - Pending */}
        <div className="bento-half">
          <div className="card" style={{ border: '2px dashed var(--bg-surface-elevated)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '50%', boxShadow: 'var(--ambient-shadow)' }}>
              <CalendarDays size={32} color="var(--text-muted)" />
            </div>
            <div>
              <div className="label-text">Module A</div>
              <h3 style={{ fontSize: '1.5rem', margin: '4px 0 8px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Facility Bookings</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, fontStyle: 'italic' }}>Awaiting infrastructure deployment.</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className="badge" style={{ border: '1px solid var(--text-muted)', color: 'var(--text-muted)', background: 'transparent' }}>PENDING</span>
            </div>
          </div>
        </div>

        {/* Resource Sync - Pending */}
        <div className="bento-half">
          <div className="card" style={{ border: '2px dashed var(--bg-surface-elevated)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '50%', boxShadow: 'var(--ambient-shadow)' }}>
              <Box size={32} color="var(--text-muted)" />
            </div>
            <div>
              <div className="label-text">Module B</div>
              <h3 style={{ fontSize: '1.5rem', margin: '4px 0 8px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Resource Sync</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, fontStyle: 'italic' }}>Awaiting hardware node detection.</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className="badge" style={{ border: '1px solid var(--text-muted)', color: 'var(--text-muted)', background: 'transparent' }}>PENDING</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
