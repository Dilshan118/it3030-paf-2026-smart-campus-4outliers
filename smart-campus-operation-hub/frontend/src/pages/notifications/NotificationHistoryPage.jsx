import React, { useState, useEffect } from 'react';
import { Check, Trash2, Clock, Filter, Search, ChevronLeft, ChevronRight, Bell, Settings2 } from 'lucide-react';
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
      const response = await getNotifications(page, pageSize);
      const data = response.data;
      setNotifications(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
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
    setSelectedNotifications(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
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
    if (notification.referenceType === 'BOOKING') return `/bookings/${notification.referenceId}`;
    if (notification.referenceType === 'TICKET') return `/tickets/${notification.referenceId}`;
    return null;
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || (filter === 'READ' && n.isRead) || (filter === 'UNREAD' && !n.isRead);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-header {
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px;
        }
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem); font-family: var(--font-display); font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); line-height: 1.1;
        }
        .controls-bar {
          display: flex; gap: 16px; align-items: center;
        }
        .icon-btn {
          display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;
          border-radius: 12px; background: var(--bg-surface); color: var(--text-muted);
          transition: all 0.3s ease; border: none; cursor: pointer; box-shadow: var(--ambient-shadow);
        }
        .icon-btn:hover {
          color: var(--accent-base); transform: translateY(-2px); box-shadow: var(--ambient-shadow-hover);
        }
      `}</style>

      <div className="page-header">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Communication Center
          </div>
          <h1 className="page-title">
            System <span style={{ color: 'var(--text-muted)' }}>Alerts</span>
          </h1>
        </div>

        <div className="controls-bar">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '260px', padding: '12px 16px 12px 42px',
                background: 'var(--bg-surface)', border: 'none', borderRadius: '12px',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-main)',
                boxShadow: 'var(--ambient-shadow)', outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
             <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                appearance: 'none', padding: '12px 40px 12px 20px',
                background: 'var(--bg-surface)', border: 'none', borderRadius: '12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)',
                boxShadow: 'var(--ambient-shadow)', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="ALL">All Alerts</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>
            <Settings2 size={16} strokeWidth={2} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>

          {selectedNotifications.length > 0 && (
            <button onClick={handleBulkDelete} className="btn-danger" style={{ marginLeft: '12px' }}>
              <Trash2 size={18} strokeWidth={2} /> Delete ({selectedNotifications.length})
            </button>
          )}

          {notifications.some(n => !n.isRead) && (
            <button onClick={handleMarkAllAsRead} className="btn-primary" style={{ marginLeft: '12px' }}>
              <Check size={18} strokeWidth={2} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
               <Bell size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Inbox zero</h3>
            <p style={{ color: 'var(--text-muted)' }}>You're all caught up on system alerts.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
            
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="checkbox"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onChange={handleSelectAll}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-base)' }}
              />
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select All
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredNotifications.map((notification) => {
                const link = getNotificationLink(notification);
                return (
                  <div key={notification.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '24px', gap: '24px', borderBottom: '1px solid rgba(0,0,0,0.03)', background: notification.isRead ? 'transparent' : 'rgba(42, 20, 180, 0.02)', transition: 'background 0.2s' }}>
                    
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-base)', marginTop: '4px' }}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Link to={link || '#'} onClick={() => !notification.isRead && handleMarkAsRead(notification.id)} style={{ textDecoration: 'none' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: notification.isRead ? 600 : 700, color: notification.isRead ? 'var(--text-main)' : 'var(--accent-base)', letterSpacing: '-0.01em' }}>
                            {notification.title}
                          </h4>
                        </Link>
                        {!notification.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-base)' }} />}
                      </div>
                      
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>{notification.message}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={14} /> {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.referenceType && (
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: '100px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            {notification.referenceType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!notification.isRead && (
                        <button onClick={() => handleMarkAsRead(notification.id)} style={{ background: 'var(--bg-surface-elevated)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent-base)', transition: 'all 0.2s' }} title="Mark as read">
                          <Check size={16} strokeWidth={2} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(notification.id)} style={{ background: 'var(--danger-muted)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', transition: 'all 0.2s' }} title="Delete">
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'var(--bg-surface)' }}>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="icon-btn" style={{ background: 'var(--bg-surface-elevated)' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="icon-btn" style={{ background: 'var(--bg-surface-elevated)' }}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
