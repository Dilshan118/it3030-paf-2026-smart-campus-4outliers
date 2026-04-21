import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadCount, getNotifications } from '../../api/notificationApi';
import NotificationDropdown from './NotificationDropdown';
import { useToast } from '../../context/ToastContext';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const prevCountRef = useRef(0);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 15 seconds for responsiveness
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      const currentCount = response.data || 0;
      
      if (currentCount > prevCountRef.current) {
        // New notification arrived! Fetch the latest one to show in toast
        try {
          const listRes = await getNotifications(0, 1);
          const latest = listRes.data?.content?.[0];
          if (latest) {
            addToast(latest.title, 'info', 5000);
          } else {
            addToast('New notification received', 'info');
          }
        } catch (e) {
          addToast('New notification received', 'info');
        }
      }
      
      prevCountRef.current = currentCount;
      setUnreadCount(currentCount);
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
    // Re-fetch count immediately if a notification was read inside dropdown
    getUnreadCount().then(res => {
      const c = res.data || 0;
      prevCountRef.current = c;
      setUnreadCount(c);
    }).catch(console.error);
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
