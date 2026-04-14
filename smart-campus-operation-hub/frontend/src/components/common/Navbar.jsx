import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'flex-end', position: 'sticky', top: 0, zIndex: 50, gap: '16px' }}>
      
      <NotificationBell />

      {/* Industrial Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 16px', border: '1px solid var(--border-main)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 8, height: 8, backgroundColor: 'var(--accent-base)' }}></div>
          <span style={{ color: 'var(--text-main)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{user?.name || 'User'}</span>
        </div>

        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
          title="Logout"
        >
          <LogOut size={16} strokeWidth={2} style={{ opacity: 0.7 }} />
        </button>
      </div>
    </header>
  );
}
