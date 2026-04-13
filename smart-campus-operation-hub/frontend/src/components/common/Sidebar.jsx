import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, CalendarDays, Box, Bell, Users, Settings } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

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

      <NavLink to="/notifications" className={navClassName}>
        <Bell size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
        Notifications
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

      {isAdmin && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', padding: '0 16px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Admin</h3>
          <NavLink to="/admin/users" className={navClassName}>
            <Users size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Users
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
