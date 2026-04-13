import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, CalendarDays, Box } from 'lucide-react';

export default function Sidebar() {
  const navClassName = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <nav className="sidebar">
      <h2>The Curator</h2>

      <NavLink to="/" end className={navClassName}>
        <LayoutDashboard size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Dashboard
      </NavLink>

      <NavLink to="/tickets" className={navClassName}>
        <Ticket size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Tickets
      </NavLink>

      <div style={{ opacity: 0.5, padding: '12px 16px', display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 500, cursor: 'not-allowed', marginBottom: '8px' }}>
        <CalendarDays size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Bookings 
        <span className="badge" style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.1)' }}>Soon</span>
      </div>

      <div style={{ opacity: 0.5, padding: '12px 16px', display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 500, cursor: 'not-allowed', marginBottom: '8px' }}>
        <Box size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Resources
        <span className="badge" style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.1)' }}>Soon</span>
      </div>
    </nav>
  );
}
