import { useState, useEffect, useRef } from 'react';
import { Check, Trash2, Clock, Search, ChevronLeft, ChevronRight, Bell, Settings2,
         CalendarDays, Ticket, MessageSquare, Mail, Moon, Save, CheckCircle } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification,
         getPreferences, updatePreferences } from '../../api/notificationApi';
import { Link } from 'react-router-dom';

// ─── Preferences Popover ──────────────────────────────────────────────────────

function PreferencesPopover({ onClose }) {
  const ref = useRef(null);
  const [prefs, setPrefs] = useState({
    bookingEnabled: true, ticketEnabled: true,
    commentEnabled: true, emailEnabled: false,
    quietHoursStart: '', quietHoursEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPreferences()
      .then(res => {
        const d = res.data;
        setPrefs({
          bookingEnabled: d.bookingEnabled ?? true,
          ticketEnabled:  d.ticketEnabled  ?? true,
          commentEnabled: d.commentEnabled ?? true,
          emailEnabled:   d.emailEnabled   ?? false,
          quietHoursStart: d.quietHoursStart ? d.quietHoursStart.substring(0, 5) : '',
          quietHoursEnd:   d.quietHoursEnd   ? d.quietHoursEnd.substring(0, 5)   : '',
        });
      })
      .finally(() => setLoading(false));

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const toggle = (key) => { setPrefs(p => ({ ...p, [key]: !p[key] })); setSaved(false); };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePreferences({
        bookingEnabled: prefs.bookingEnabled,
        ticketEnabled:  prefs.ticketEnabled,
        commentEnabled: prefs.commentEnabled,
        emailEnabled:   prefs.emailEnabled,
        quietHoursStart: prefs.quietHoursStart ? prefs.quietHoursStart + ':00' : null,
        quietHoursEnd:   prefs.quietHoursEnd   ? prefs.quietHoursEnd   + ':00' : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const channels = [
    {
      key: 'bookingEnabled',
      icon: <CalendarDays size={18} strokeWidth={1.5} />,
      label: 'Booking Notifications',
      description: 'Approvals, rejections, reminders and cancellations',
    },
    {
      key: 'ticketEnabled',
      icon: <Ticket size={18} strokeWidth={1.5} />,
      label: 'Ticket Notifications',
      description: 'Status updates, assignments and resolutions',
    },
    {
      key: 'commentEnabled',
      icon: <MessageSquare size={18} strokeWidth={1.5} />,
      label: 'Comment Notifications',
      description: 'New comments added to your tickets',
    },
    {
      key: 'emailEnabled',
      icon: <Mail size={18} strokeWidth={1.5} />,
      label: 'Email Notifications',
      description: 'Critical alerts sent to your university email',
    },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 100,
      width: '380px', background: 'var(--bg-surface)', borderRadius: '20px',
      boxShadow: '0 24px 64px -12px rgba(0,0,0,0.18)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 22px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(42,20,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-base)' }}>
          <Settings2 size={16} strokeWidth={2} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Alert Preferences</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Control what alerts you receive</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.06)', borderTopColor: 'var(--accent-base)', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Channel toggles */}
          <div style={{ padding: '12px 16px 8px' }}>
            <p style={{ margin: '0 0 10px 6px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Notification Channels
            </p>
            {channels.map(({ key, icon, label, description }) => (
              <div key={key} onClick={() => toggle(key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px',
                  background: prefs[key] ? 'rgba(42,20,180,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: prefs[key] ? 'rgba(42,20,180,0.1)' : 'var(--bg-surface-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: prefs[key] ? 'var(--accent-base)' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{description}</p>
                  </div>
                </div>
                {/* Toggle pill */}
                <div style={{
                  width: '42px', height: '23px', borderRadius: '12px', flexShrink: 0, marginLeft: '12px',
                  background: prefs[key] ? 'var(--accent-base)' : 'var(--bg-surface-elevated)',
                  position: 'relative', transition: 'background 0.22s',
                  boxShadow: prefs[key] ? '0 3px 10px rgba(42,20,180,0.3)' : 'none',
                }}>
                  <div style={{
                    width: '17px', height: '17px', borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '3px', left: prefs[key] ? '22px' : '3px',
                    transition: 'left 0.22s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quiet hours */}
          <div style={{ margin: '4px 16px 12px', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Moon size={15} strokeWidth={1.5} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quiet Hours
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto', fontStyle: 'italic' }}>
                Suppress non-critical alerts
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ key: 'quietHoursStart', label: 'Start Time' }, { key: 'quietHoursEnd', label: 'End Time' }].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    {label}
                  </label>
                  <input type="time" value={prefs[key] || ''}
                    onChange={e => { setPrefs(p => ({ ...p, [key]: e.target.value })); setSaved(false); }}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', border: 'none',
                      background: 'var(--bg-surface)', fontFamily: 'var(--font-mono)',
                      fontSize: '0.88rem', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Leave empty to disable quiet hours.
            </p>
          </div>

          {/* Save row */}
          <div style={{ padding: '12px 16px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '7px', padding: '11px', fontSize: '0.88rem', opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
                : <Save size={14} strokeWidth={2} />}
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                <CheckCircle size={14} strokeWidth={2} /> Saved!
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPrefs, setShowPrefs] = useState(false);

  const pageSize = 10;

  useEffect(() => { fetchNotifications(); }, [page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(page, pageSize);
      const data = response?.data;
      setNotifications(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleBulkDelete = async () => {
    if (!selectedNotifications.length) return;
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (err) { console.error(err); }
  };

  const formatTimeAgo = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getNotificationLink = (n) => {
    if (n.referenceType === 'BOOKING') return `/bookings/${n.referenceId}`;
    if (n.referenceType === 'TICKET')  return `/tickets/${n.referenceId}`;
    return null;
  };

  const filteredNotifications = notifications.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'ALL' || (filter === 'READ' && n.isRead) || (filter === 'UNREAD' && !n.isRead);
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .icon-btn { display:flex; align-items:center; justify-content:center; width:44px; height:44px;
          border-radius:12px; background:var(--bg-surface); color:var(--text-muted);
          transition:all 0.3s ease; border:none; cursor:pointer; box-shadow:var(--ambient-shadow); }
        .icon-btn:hover { color:var(--accent-base); transform:translateY(-2px); box-shadow:var(--ambient-shadow-hover); }
        .pref-btn-active { color:var(--accent-base) !important; background:rgba(42,20,180,0.08) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px', marginBottom: '48px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Communication Center
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, margin: 0 }}>
            System <span style={{ color: 'var(--text-muted)' }}>Alerts</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search notifications..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '240px', padding: '12px 14px 12px 38px', background: 'var(--bg-surface)',
                border: 'none', borderRadius: '12px', fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                color: 'var(--text-main)', boxShadow: 'var(--ambient-shadow)', outline: 'none' }} />
          </div>

          {/* Filter dropdown */}
          <div style={{ position: 'relative' }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ appearance: 'none', padding: '12px 36px 12px 18px', background: 'var(--bg-surface)',
                border: 'none', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--ambient-shadow)',
                outline: 'none', cursor: 'pointer' }}>
              <option value="ALL">All Alerts</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>
            <Bell size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>

          {selectedNotifications.length > 0 && (
            <button onClick={handleBulkDelete} className="btn-secondary"
              style={{ color: 'var(--danger)', background: 'var(--danger-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={16} strokeWidth={2} /> Delete ({selectedNotifications.length})
            </button>
          )}

          {notifications.some(n => !n.isRead) && (
            <button onClick={handleMarkAllAsRead} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} strokeWidth={2} /> Mark All Read
            </button>
          )}

          {/* Preferences icon button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPrefs(v => !v)}
              className={`icon-btn${showPrefs ? ' pref-btn-active' : ''}`}
              title="Alert Preferences"
            >
              <Settings2 size={18} strokeWidth={2} />
            </button>
            {showPrefs && <PreferencesPopover onClose={() => setShowPrefs(false)} />}
          </div>
        </div>
      </div>

      {/* Content */}
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
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input type="checkbox"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onChange={() => setSelectedNotifications(selectedNotifications.length === notifications.length ? [] : notifications.map(n => n.id))}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-base)' }} />
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select All
              </span>
            </div>

            {filteredNotifications.map(notification => {
              const link = getNotificationLink(notification);
              return (
                <div key={notification.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '20px 24px', gap: '20px', borderBottom: '1px solid rgba(0,0,0,0.03)', background: notification.isRead ? 'transparent' : 'rgba(42,20,180,0.02)', transition: 'background 0.2s' }}>
                  <input type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => setSelectedNotifications(prev =>
                      prev.includes(notification.id) ? prev.filter(id => id !== notification.id) : [...prev, notification.id])}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-base)', marginTop: '4px' }} />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <Link to={link || '#'} onClick={() => !notification.isRead && handleMarkAsRead(notification.id)} style={{ textDecoration: 'none' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: notification.isRead ? 600 : 700, color: notification.isRead ? 'var(--text-main)' : 'var(--accent-base)' }}>
                          {notification.title}
                        </h4>
                      </Link>
                      {!notification.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-base)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{notification.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <Clock size={13} /> {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.referenceType && (
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600, background: 'var(--bg-surface-elevated)', padding: '3px 8px', borderRadius: '100px', color: 'var(--text-muted)' }}>
                          {notification.referenceType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!notification.isRead && (
                      <button onClick={() => handleMarkAsRead(notification.id)}
                        style={{ background: 'var(--bg-surface-elevated)', border: 'none', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent-base)' }}
                        title="Mark as read">
                        <Check size={15} strokeWidth={2} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notification.id)}
                      style={{ background: 'var(--danger-muted)', border: 'none', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}
                      title="Delete">
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="icon-btn">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="icon-btn">
                    <ChevronRight size={18} />
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
