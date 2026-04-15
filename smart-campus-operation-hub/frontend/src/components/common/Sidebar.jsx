import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, CalendarDays, Box, Bell, Users, Settings, Briefcase } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const navClassName = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <nav className="sidebar">
      <h2>Smart Campus</h2>

      <NavLink to="/" end className={navClassName}>
        <LayoutDashboard size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Dashboard
      </NavLink>

      <NavLink to="/tickets" className={navClassName}>
        <Ticket size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Tickets
      </NavLink>

      <NavLink to="/notifications" className={navClassName}>
        <Bell size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Notifications
      </NavLink>

      <div style={{ opacity: 0.5, padding: '14px 24px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'not-allowed' }}>
        <CalendarDays size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Bookings
        <span className="badge" style={{ marginLeft: 'auto' }}>Soon</span>
      </div>

      <NavLink to="/resources" className={navClassName}>
        <Box size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Resources
      </NavLink>

      {isAdmin && (
        <div style={{ marginTop: '24px' }}>
          <h3 className="label-text" style={{ padding: '0 24px', marginBottom: '16px' }}>Admin</h3>
          <NavLink to="/admin/users" className={navClassName}>
            <Users size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Users
          </NavLink>
          <NavLink to="/tickets/manage" className={navClassName}>
            <Briefcase size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Operations Log
          </NavLink>
          <NavLink to="/admin/analytics" className={navClassName}>
            <Settings size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Analytics
          </NavLink>
        </div>
      )}
    </nav>
  );
}
