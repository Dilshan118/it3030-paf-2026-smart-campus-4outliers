import { useState, useEffect, useRef } from 'react';
import { X, Check, Trash2, Clock, Bell } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notificationApi';
import { Link } from 'react-router-dom';

export default function NotificationDropdown({ onClose, onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(0, 5);
      setNotifications(response.data?.content || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      onNotificationRead();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationLink = (notification) => {
    if (notification.referenceType === 'BOOKING') {
      return `/bookings/${notification.referenceId}`;
    } else if (notification.referenceType === 'TICKET') {
      return `/tickets/${notification.referenceId}`;
    } else if (notification.referenceType === 'RESOURCE') {
      return `/resources/${notification.referenceId}`;
    }
    return null;
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        right: 0,
        marginTop: '12px',
        width: '380px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        zIndex: 50,
        overflow: 'hidden',
        animation: 'pageReveal 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        background: 'rgba(242, 244, 246, 0.5)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}>
        <h3 className="label-text" style={{ margin: 0, color: 'var(--text-main)', fontWeight: 800, fontSize: '0.8rem' }}>Notifications</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-base)', fontSize: '0.75rem', fontWeight: 700, padding: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'var(--bg-surface)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: '420px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 28, height: 28, border: '3px solid rgba(42, 20, 180, 0.1)', borderTopColor: 'var(--accent-base)', borderRadius: '50%', margin: '0 auto' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>Syncing updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '30px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
              <Bell size={36} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '3px solid white' }} />
            </div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: '0 0 8px 0' }}>All Caught Up</h4>
            <p className="label-text" style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: '0', fontSize: '0.9rem' }}>
              No new notifications to show right now.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const NotificationWrapper = link ? Link : 'div';

              return (
                <NotificationWrapper
                  key={notification.id}
                  to={link}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    ...(
                      !notification.isRead
                        ? { backgroundColor: 'var(--accent-muted)' }
                        : { backgroundColor: 'var(--bg-surface)' }
                    ),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.isRead ? 'var(--bg-surface)' : 'var(--accent-muted)';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.9rem',
                      fontWeight: notification.isRead ? 500 : 700,
                      color: 'var(--text-main)',
                      margin: '0 0 4px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {notification.title}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <Clock size={12} strokeWidth={1.5} />
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px', flexShrink: 0 }}>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(notification.id); }}
                        style={{ background: 'var(--bg-surface)', border: 'none', cursor: 'pointer', color: 'var(--accent-base)', padding: '6px', borderRadius: '50%', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                        title="Mark as read"
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notification.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '6px', display: 'flex', opacity: 0.6, transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                      title="Delete"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </NotificationWrapper>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'center' }}>
          <Link
            to="/notifications"
            onClick={onClose}
            style={{ color: 'var(--accent-base)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-body)' }}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
