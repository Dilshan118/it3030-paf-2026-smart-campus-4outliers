import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Rocket, LogOut } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: '16px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(0,0,0,0.03)',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.04)',
      transform: 'translateZ(0)'
    }}>
      {/* Search Interactive Pill */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(42, 20, 180, 0.04)',
          padding: '10px 20px', borderRadius: '100px',
          width: 'max-width', minWidth: '320px',
          border: '1px solid rgba(42, 20, 180, 0.05)',
          transition: 'all 0.3s ease',
          cursor: 'text'
        }} className="search-pill">
          <Search size={18} color="var(--accent-base)" style={{ opacity: 0.7 }} />
          <input 
            type="text" 
            placeholder="Search tickets, assets, or users..." 
            style={{ 
              border: 'none', background: 'transparent', outline: 'none', width: '100%', 
              fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' 
            }}
          />
          <style>{`
            .search-pill:focus-within {
              background: rgba(255,255,255,1);
              box-shadow: 0 8px 24px rgba(42, 20, 180, 0.08);
              border-color: rgba(42, 20, 180, 0.2) !important;
            }
            .search-pill input::placeholder {
              color: var(--text-muted);
              font-weight: 400;
            }
          `}</style>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', 
          padding: '8px 16px', background: 'var(--success-muted)', borderRadius: '100px',
          color: 'var(--success)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800,
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 4px 12px -2px var(--success-muted)',
          letterSpacing: '0.05em'
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', opacity: 0.4, animation: 'pulse-dot 2s infinite' }} />
          </div>
          SYSTEM OPTIMAL
          <style>{`
            @keyframes pulse-dot {
              0% { transform: scale(1); opacity: 0.4; }
              70% { transform: scale(2.5); opacity: 0; }
              100% { transform: scale(1); opacity: 0; }
            }
          `}</style>
        </div>

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
        <div className="user-profile-pill" style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '6px 16px 6px 6px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '100px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(42, 20, 180, 0.3)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {user?.name || 'Authorized User'}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.role || 'Operator'}
            </span>
          </div>
          <style>{`
            .user-profile-pill:hover {
              background: var(--bg-surface);
              box-shadow: 0 10px 24px -8px rgba(42, 20, 180, 0.12);
            }
          `}</style>
        </div>
      </div>
    </header>
  );
}
