import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="top-navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(255, 255, 255, 0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      minHeight: '74px',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
      boxShadow: '0 10px 34px -16px rgba(0,0,0,0.10)',
      transform: 'translateZ(0)'
    }}>
      <style>{`
        .top-navbar .user-profile-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 44px;
          padding: 4px 14px 4px 4px;
          background: var(--bg-surface-elevated);
          border-radius: 999px;
          transition: all 0.3s ease;
          min-width: 160px;
        }

        .top-navbar .user-profile-pill:hover {
          background: var(--bg-surface);
          box-shadow: 0 10px 24px -8px rgba(42, 20, 180, 0.12);
        }

        .top-navbar .user-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .top-navbar .user-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        .top-navbar .user-role {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 1240px) {
          .top-navbar {
            padding: 12px 22px !important;
            gap: 12px !important;
          }

          .top-navbar .user-name {
            max-width: 110px;
          }
        }
      `}</style>

      <div className="top-navbar-actions" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        marginLeft: 'auto',
        minWidth: 0
      }}>

        <NotificationBell />

        <button
          onClick={logout}
          title="Sign Out"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(225, 42, 69, 0.08)', border: 'none',
            color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(225, 42, 69, 0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
        >
          <LogOut size={18} strokeWidth={2} />
        </button>

        {/* User Profile Pill */}
        <div className="user-profile-pill" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate('/profile')}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(42, 20, 180, 0.3)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-meta">
            <span className="user-name">
              {user?.name || 'Authorized User'}
            </span>
            <span className="user-role">
              {user?.role || 'Operator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
