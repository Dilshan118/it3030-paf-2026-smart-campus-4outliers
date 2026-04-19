import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, CalendarDays, Box, Bell, Users, Settings, Briefcase, Command, TrendingUp, Zap } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  // Add the custom floating dark-theme styling directly via an internal <style> or utilizing index.css class names
  const navClassName = ({ isActive }) => (isActive ? 'active sidebar-link' : 'sidebar-link');

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Command color="#fff" size={20} strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          <span style={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Smart</span>
          <span style={{ fontWeight: 400, letterSpacing: '0.1em', fontSize: '0.7em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block', marginTop: '-2px' }}>Campus</span>
        </div>
      </div>

      <div className="sidebar-nav-group">
        <span className="sidebar-label">Main System</span>
        
        <NavLink to="/" end className={navClassName}>
          <LayoutDashboard size={20} strokeWidth={1.5} className="sidebar-icon" />
          Dashboard
        </NavLink>

        <NavLink to="/tickets" className={navClassName}>
          <Ticket size={20} strokeWidth={1.5} className="sidebar-icon" />
          Tickets
        </NavLink>

        <NavLink to="/notifications" className={navClassName}>
          <Bell size={20} strokeWidth={1.5} className="sidebar-icon" />
          Notifications
        </NavLink>

        <div className="sidebar-link disabled">
          <CalendarDays size={20} strokeWidth={1.5} className="sidebar-icon" />
          Bookings
          <span className="sidebar-badge">SOON</span>
        </div>

        <NavLink to="/resources" end className={navClassName}>
          <Box size={20} strokeWidth={1.5} className="sidebar-icon" />
          Resources
        </NavLink>

        <NavLink to="/resources/finder" className={navClassName}>
          <Zap size={20} strokeWidth={1.5} className="sidebar-icon" />
          Smart Finder
        </NavLink>
      </div>

      {isAdmin && (
        <div className="sidebar-nav-group" style={{ marginTop: 'auto' }}>
          <div className="sidebar-divider"></div>
          
          <span className="sidebar-label">Admin Environment</span>

          <NavLink to="/admin/users" className={navClassName}>
            <Users size={20} strokeWidth={1.5} className="sidebar-icon" />
            Users & Roles
          </NavLink>
          
          <NavLink to="/admin/resources" className={navClassName}>
            <Settings size={20} strokeWidth={1.5} className="sidebar-icon" />
            Manage Resources
          </NavLink>

          <NavLink to="/admin/resources/analytics" className={navClassName} style={{ marginLeft: '12px', marginTop: '-2px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <TrendingUp size={16} strokeWidth={1.8} className="sidebar-icon" style={{ marginRight: '8px' }} />
            Analytics
          </NavLink>

          <NavLink to="/tickets/manage" className={navClassName}>
            <Briefcase size={20} strokeWidth={1.5} className="sidebar-icon" />
            Operations Log
          </NavLink>
        </div>
      )}
    </nav>
  );
}
