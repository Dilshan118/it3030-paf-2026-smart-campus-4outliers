import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, CalendarDays, Box, Bell, Users, Settings, Briefcase, Command, TrendingUp, Zap, SlidersHorizontal, Building2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrManager = isAdmin || user?.role === 'MANAGER';

  // Add the custom floating dark-theme styling directly via an internal <style> or utilizing index.css class names
  const navClassName = ({ isActive }) => (isActive ? 'active sidebar-link' : 'sidebar-link');

  return (
    <nav className="sidebar">
      <div className="sidebar-brand" style={{ marginBottom: '40px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '16px 16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2)' }}>
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, var(--accent-base) 0%, #7c3aed 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
            <Building2 color="#fff" size={20} strokeWidth={2} />
          </div>
          <div className="sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', fontSize: '1.25rem', lineHeight: '1.1' }}>SMART</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.22em', fontSize: '0.62rem', color: '#8b95a5', textTransform: 'uppercase' }}>Campus</span>
          </div>
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

        <NavLink to="/notifications/preferences" className={navClassName} style={{ marginLeft: '12px', marginTop: '-2px', fontSize: '0.85rem' }}>
          <SlidersHorizontal size={16} strokeWidth={1.8} className="sidebar-icon" style={{ marginRight: '8px' }} />
          Alert Preferences
        </NavLink>

        <NavLink to="/bookings" className={navClassName}>
          <CalendarDays size={20} strokeWidth={1.5} className="sidebar-icon" />
          Bookings
        </NavLink>

        <NavLink to="/resources" end className={navClassName}>
          <Box size={20} strokeWidth={1.5} className="sidebar-icon" />
          Resources
        </NavLink>

        <NavLink to="/resources/finder" className={navClassName}>
          <Zap size={20} strokeWidth={1.5} className="sidebar-icon" />
          Smart Finder
        </NavLink>
      </div>

      {isAdminOrManager && (
        <div className="sidebar-nav-group" style={{ marginTop: 'auto' }}>
          <div className="sidebar-divider"></div>

          <span className="sidebar-label">Admin Environment</span>

          {isAdmin && (
            <NavLink to="/admin/users" className={navClassName}>
              <Users size={20} strokeWidth={1.5} className="sidebar-icon" />
              Users & Roles
            </NavLink>
          )}

          <NavLink to="/admin/resources" className={navClassName}>
            <Settings size={20} strokeWidth={1.5} className="sidebar-icon" />
            Manage Resources
          </NavLink>

          <NavLink to="/admin/bookings" className={navClassName}>
            <CalendarDays size={20} strokeWidth={1.5} className="sidebar-icon" />
            Booking Review
          </NavLink>

          <NavLink to="/admin/analytics" className={navClassName}>
            <TrendingUp size={20} strokeWidth={1.5} className="sidebar-icon" />
            Analytics Dashboard
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
