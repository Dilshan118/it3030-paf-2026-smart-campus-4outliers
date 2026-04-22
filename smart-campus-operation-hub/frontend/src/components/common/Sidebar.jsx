import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, CalendarDays, Box, Bell, Users, Settings, Briefcase, TrendingUp, Zap, SlidersHorizontal, Building2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrManager = isAdmin || user?.role === 'MANAGER';

  const navClassName = ({ isActive }) => (isActive ? 'active sidebar-link' : 'sidebar-link');
  const compactNavClassName = ({ isActive }) => `${isActive ? 'active sidebar-link' : 'sidebar-link'} sidebar-link-compact`;
  const compactMutedNavClassName = ({ isActive }) => `${isActive ? 'active sidebar-link' : 'sidebar-link'} sidebar-link-compact sidebar-link-muted`;

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Building2 color="var(--accent-base)" size={20} strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">SMART</span>
          <span className="sidebar-brand-subtitle">Campus</span>
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

        <NavLink to="/notifications/preferences" className={compactNavClassName}>
          <SlidersHorizontal size={16} strokeWidth={1.8} className="sidebar-icon" />
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

          <NavLink to="/admin/resources/analytics" className={compactMutedNavClassName}>
            <TrendingUp size={16} strokeWidth={1.8} className="sidebar-icon" />
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
