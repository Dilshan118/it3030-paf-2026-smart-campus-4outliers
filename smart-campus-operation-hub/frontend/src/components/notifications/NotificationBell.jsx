import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '../../api/notificationApi';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  const handleNotificationRead = () => {
    fetchUnreadCount();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleBellClick}
        style={{
          position: 'relative',
          padding: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--on-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          transition: 'background-color 0.2s',
        }}
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: 'var(--danger)',
            color: 'var(--text-inverse)',
            fontSize: '0.65rem',
            fontWeight: 700,
            borderRadius: '999px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 4px 8px -2px var(--danger-muted)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          onClose={handleCloseDropdown}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </div>
  );
}
