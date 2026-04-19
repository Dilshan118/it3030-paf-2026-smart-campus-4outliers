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
        marginTop: '8px',
        width: '360px',
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: '0',
        border: '1px solid var(--border-main)',
        boxShadow: 'var(--block-shadow)',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'var(--surface-container-low)',
      }}>
        <h3 className="label-text" style={{ margin: 0 }}>Notifications</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 500, padding: 0 }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', padding: 0, opacity: 0.6 }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }} />
            <p style={{ marginTop: '12px', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <Bell size={32} strokeWidth={1} style={{ color: 'var(--on-surface-variant)', opacity: 0.2, margin: '0 auto 12px' }} />
            <p className="label-text">No notifications yet</p>
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
                    padding: '14px 20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.15s',
                    cursor: 'pointer',
                    ...(
                      !notification.isRead
                        ? { backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--accent-base)' }
                        : {}
                    ),
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.isRead ? '' : 'var(--bg-surface-elevated)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.85rem',
                      fontWeight: notification.isRead ? 500 : 600,
                      color: 'var(--on-surface)',
                      margin: '0 0 4px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {notification.title}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', margin: '0 0 6px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
                      <Clock size={11} />
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px', flexShrink: 0 }}>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(notification.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px', display: 'flex' }}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notification.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px', display: 'flex', opacity: 0.5 }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
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
        <div style={{ padding: '12px 20px', backgroundColor: 'var(--surface-container-low)', textAlign: 'center' }}>
          <Link
            to="/notifications"
            onClick={onClose}
            style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
