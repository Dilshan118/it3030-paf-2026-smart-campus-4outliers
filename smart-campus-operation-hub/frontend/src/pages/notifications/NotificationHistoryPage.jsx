import { useState, useEffect } from 'react';
import { Check, Trash2, Clock, Filter, Search, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notificationApi';
import { Link } from 'react-router-dom';

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const pageSize = 10;

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(page, pageSize, filter === 'READ', filter === 'UNREAD');
      const data = response.data.data;
      setNotifications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
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
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
      setSelectedNotifications([]);
      setTotalElements(prev => prev - selectedNotifications.length);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
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
    }
    return null;
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <h1 className="h1" style={{ marginBottom: '4px' }}>Notification History</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
          View and manage all your notifications
        </p>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '16px 24px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px', margin: 0 }}
          />
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--on-surface-variant)', opacity: 0.5 }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '160px', margin: 0 }}
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Read Only</option>
          </select>
        </div>

        {/* Spacer */}
        <div style={{ flex: '1 1 0' }} />

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <button onClick={handleBulkDelete} className="btn-danger">
            <Trash2 size={14} />
            Delete ({selectedNotifications.length})
          </button>
        )}

        {/* Mark All Read */}
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllAsRead} className="btn-primary">
            <Check size={14} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }} />
            <p style={{ marginTop: '16px', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Bell size={40} strokeWidth={1} style={{ color: 'var(--on-surface-variant)', opacity: 0.25, margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>No notifications found</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div style={{ padding: '12px 24px', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onChange={handleSelectAll}
                style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                Select all ({notifications.length} notifications)
              </span>
            </div>

            {/* Notification Items */}
            <div>
              {filteredNotifications.map((notification) => {
                const link = getNotificationLink(notification);
                const NotificationWrapper = link ? Link : 'div';

                return (
                  <div
                    key={notification.id}
                    className="notification-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '16px 24px',
                      ...(
                        !notification.isRead
                          ? { backgroundColor: 'rgba(42, 20, 180, 0.04)', borderLeft: '3px solid var(--primary)' }
                          : {}
                      ),
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      style={{ accentColor: 'var(--primary)', width: 16, height: 16, marginTop: '3px', flexShrink: 0 }}
                    />

                    {/* Content */}
                    <NotificationWrapper
                      to={link}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      style={{ flex: 1, textDecoration: 'none', color: 'inherit', minWidth: 0 }}
                    >
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: notification.isRead ? 500 : 600,
                        color: 'var(--on-surface)',
                        margin: '0 0 4px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                        {notification.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
                        <Clock size={12} />
                        {formatTimeAgo(notification.createdAt)}
                        {notification.referenceType && (
                          <span className="badge" style={{ backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface-variant)', marginLeft: '4px' }}>
                            {notification.referenceType}
                          </span>
                        )}
                      </div>
                    </NotificationWrapper>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px', display: 'flex' }}
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px', display: 'flex', opacity: 0.6 }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 24px', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={page === totalPages - 1}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', opacity: page === totalPages - 1 ? 0.4 : 1, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
