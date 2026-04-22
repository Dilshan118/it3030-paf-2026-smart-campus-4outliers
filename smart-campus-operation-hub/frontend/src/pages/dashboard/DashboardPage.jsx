import React, { useContext, useState, useEffect } from 'react';
import { CalendarDays, Box, Activity, ArrowUpRight, Clock, ShieldCheck, TicketPlus, PlusCircle, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getTickets } from '../../api/ticketApi';
import { getBookings } from '../../api/bookingApi';

function computeSlaState(ticket) {
  if (!ticket?.slaDeadline) return null;
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'REJECTED') return null;
  const deadline = new Date(ticket.slaDeadline).getTime();
  if (Number.isNaN(deadline)) return null;
  const diffMs = deadline - Date.now();
  if (diffMs < 0) return 'BREACHED';
  return 'OK';
}

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [time, setTime] = useState(new Date());
  
  const [metrics, setMetrics] = useState({
    activeTickets: 0,
    slaScore: 100,
    activeBookings: 0,
    myAssigned: 0,
    myReported: 0,
    loading: true
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const isTech = user?.role === 'TECHNICIAN';
        const isStandard = user?.role === 'USER';
        
        let ticketsRes, bookingsRes, myReportedRes;

        if (isTech) {
          [ticketsRes, myReportedRes, bookingsRes] = await Promise.all([
            getTickets({ assignee: 'MINE', status: 'OPEN,IN_PROGRESS' }),
            getTickets({ reporter: 'MINE', status: 'OPEN,IN_PROGRESS' }),
            getBookings({ userId: user?.id, size: 50, status: 'APPROVED' })
          ]);
        } else if (isStandard) {
          [myReportedRes, bookingsRes] = await Promise.all([
            getTickets({ reporter: 'MINE', status: 'OPEN,IN_PROGRESS' }),
            getBookings({ userId: user?.id, size: 50, status: 'APPROVED' })
          ]);
          ticketsRes = { data: [] }; // Don't fetch global queue for standard users
        } else {
          // Admin/Manager
          [ticketsRes, bookingsRes] = await Promise.all([
            getTickets({ size: 100, status: 'OPEN,IN_PROGRESS' }),
            getBookings({ userId: user?.id, size: 50, status: 'APPROVED' })
          ]);
        }

        const tickets = ticketsRes?.data?.content || ticketsRes?.data || [];
        const reported = myReportedRes?.data?.content || myReportedRes?.data || [];
        const bookings = bookingsRes?.data?.content || bookingsRes?.data || [];
        
        let breached = 0;
        tickets.forEach(t => {
          if (computeSlaState(t) === 'BREACHED') breached++;
        });

        const activeTicketsCount = tickets.length;
        const slaScore = activeTicketsCount === 0 && !isStandard ? 100 : Math.round(((activeTicketsCount - breached) / Math.max(activeTicketsCount, 1)) * 100);

        setMetrics({
          activeTickets: activeTicketsCount,
          slaScore: slaScore,
          activeBookings: bookings.length,
          myAssigned: isTech ? activeTicketsCount : 0,
          myReported: isTech || isStandard ? reported.length : 0,
          loading: false
        });
      } catch (err) {
        setMetrics(m => ({ ...m, loading: false }));
      }
    }
    fetchMetrics();
    // Refresh every 30s
    const refreshTimer = setInterval(fetchMetrics, 30000);
    return () => clearInterval(refreshTimer);
  }, [user]);

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
        .bento-third { grid-column: span 4; }
        
        @media (max-width: 1024px) {
          .bento-main, .bento-side, .bento-half, .bento-third { grid-column: span 12; }
        }
        
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: var(--success);
          position: relative;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: var(--success);
          opacity: 0.4;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
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
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.05em;
          text-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
          
        .glass-btn {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.25);
          color: white;
          padding: 14px 28px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 700;
          letter-spacing: 0.08em;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .glass-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        
        .quick-action-card {
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-decoration: none;
          color: var(--text-main);
          box-shadow: var(--ambient-shadow);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          border: 1px solid transparent;
        }
        .quick-action-card:hover {
          box-shadow: var(--ambient-shadow-hover);
          transform: translateY(-6px);
          border-color: var(--accent-muted);
        }
        .quick-action-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface-elevated);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .quick-action-card:hover .quick-action-icon {
          transform: scale(1.1) rotate(-8deg);
          background: var(--bg-surface);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
      `}</style>

      {/* Editorial Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontWeight: 700 }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <div className="pulse-dot" style={{ transform: 'scale(0.8)' }}></div>
              LIVE UPDATE 
            </div>
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '20px' }}>
            {user?.role === 'ADMIN' || user?.role === 'MANAGER' ? (
              <>Operations are <span style={{ color: metrics.slaScore >= 90 ? 'var(--success)' : (metrics.slaScore >= 70 ? 'var(--warning)' : 'var(--danger)') }}>{metrics.slaScore >= 90 ? 'running smoothly' : (metrics.slaScore >= 70 ? 'active' : 'needing attention')}</span>.</>
            ) : user?.role === 'TECHNICIAN' ? (
              <>Your workbench is <span style={{ color: 'var(--accent-base)' }}>ready</span>.</>
            ) : (
              <>Your requests are <span style={{ color: 'var(--success)' }}>in good hands</span>.</>
            )}
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500, maxWidth: '600px' }}>
            {user?.role === 'ADMIN' || user?.role === 'MANAGER' 
              ? 'Track daily facility requests, reserve campus spaces, and keep an eye on overall health in one convenient hub.'
              : user?.role === 'TECHNICIAN'
              ? 'Access prioritized assigned jobs, manage active maintenance, and reserve necessary facilities.'
              : 'Keep track of your reported issues, reserve campus facilities seamlessly, and monitor your scheduled bookings.'}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, background: 'var(--bg-surface)', padding: '16px 24px', borderRadius: 'var(--radius)', boxShadow: 'var(--ambient-shadow)' }}>
          <Clock size={18} color="var(--accent-base)" />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  {user?.role === 'TECHNICIAN' ? 'Your Task List' : (user?.role === 'USER' ? 'Your Support Requests' : 'Open Support Requests')}
                </span>
                <div className="metric-value">
                  {metrics.loading ? '-' : (user?.role === 'TECHNICIAN' || user?.role === 'USER' ? (user?.role === 'TECHNICIAN' ? metrics.myAssigned : metrics.myReported) : metrics.activeTickets)}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
                <Activity size={40} color="white" />
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, marginTop: '80px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  {user?.role === 'TECHNICIAN' ? 'Assigned Jobs' : (user?.role === 'USER' ? 'Active Reported Issues' : 'Active Facility Requests')}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                  {user?.role === 'TECHNICIAN' ? 'Access your assigned jobs to keep the campus running.' : (user?.role === 'USER' ? 'Track the progress of your submitted tickets.' : 'Our teams are currently reviewing these requests.')}
                </div>
              </div>
              
              <NavLink to="/tickets" className="glass-btn">
                {user?.role === 'TECHNICIAN' ? 'View My Tasks' : (user?.role === 'USER' ? 'Track Progress' : 'Manage Requests')} <ArrowUpRight size={18} />
              </NavLink>
            </div>
          </div>
        </div>

        {/* SLA / Personal Reports Side Card */}
        <div className="bento-side">
          {user?.role === 'TECHNICIAN' ? (
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <span className="label-text" style={{ margin: 0 }}>My Reported Issues</span>
                <Box size={28} color="var(--accent-base)" />
              </div>
              
              <div className="metric-value" style={{ color: 'var(--text-main)', marginTop: 'auto', marginBottom: '8px' }}>
                {metrics.loading ? '...' : metrics.myReported}
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
                Self-reported incidents currently being tracked.
              </div>
              
              <NavLink to="/tickets?reporter=MINE" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                View My reports
              </NavLink>
            </div>
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <span className="label-text" style={{ margin: 0 }}>Global SLA Score</span>
                <ShieldCheck size={28} color={metrics.slaScore >= 95 ? 'var(--success)' : (metrics.slaScore >= 80 ? 'var(--warning)' : 'var(--danger)')} />
              </div>
              
              <div className="metric-value" style={{ color: 'var(--text-main)', marginTop: 'auto', marginBottom: '8px' }}>
                {metrics.loading ? '...' : metrics.slaScore}<span style={{ fontSize: '2.5rem', color: metrics.slaScore >= 95 ? 'var(--success)' : 'var(--text-muted)' }}>%</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px', marginTop: '32px', opacity: 0.6 }}>
                {[40, 70, 45, 90, 65, metrics.slaScore].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i === 5 ? (metrics.slaScore >= 95 ? 'var(--success)' : 'var(--accent-base)') : 'var(--bg-surface-elevated)', height: `${h}%`, borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Title */}
        <div style={{ gridColumn: 'span 12', marginTop: '16px', marginBottom: '-8px' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Actions</h3>
        </div>

        {/* Action 1: Create Ticket */}
        <NavLink to="/tickets/new" className="bento-third quick-action-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="quick-action-icon" style={{ color: 'var(--danger)' }}>
              <TicketPlus size={24} />
            </div>
            <ArrowUpRight size={20} color="var(--text-muted)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-body)' }}>Report Incident</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>Create a new service ticket for immediate support.</p>
          </div>
        </NavLink>

        {/* Action 2: Book Facility */}
        <NavLink to="/bookings/new" className="bento-third quick-action-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="quick-action-icon" style={{ color: 'var(--accent-base)' }}>
              <PlusCircle size={24} />
            </div>
            <ArrowUpRight size={20} color="var(--text-muted)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-body)' }}>Reserve Facility</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>Book labs, halls, or equipment.</p>
          </div>
          <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'var(--surface-container)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            {metrics.loading ? '...' : metrics.activeBookings} Active
          </div>
        </NavLink>

        {/* Action 3: Smart Finder */}
        <NavLink to="/resources/finder" className="bento-third quick-action-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="quick-action-icon" style={{ color: 'var(--info)' }}>
              <Search size={24} />
            </div>
            <ArrowUpRight size={20} color="var(--text-muted)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-body)' }}>Smart Finder</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>Locate resources & review schedules.</p>
          </div>
        </NavLink>

      </div>
    </div>
  );
}
