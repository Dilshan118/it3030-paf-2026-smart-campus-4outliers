import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Ticket, CalendarDays, MessageSquare, Mail, Moon, Save, CheckCircle } from 'lucide-react';
import { getPreferences, updatePreferences } from '../../api/notificationApi';

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState({
    bookingEnabled: true,
    ticketEnabled: true,
    commentEnabled: true,
    emailEnabled: false,
    quietHoursStart: null,
    quietHoursEnd: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPreferences()
      .then(res => {
        const data = res.data;
        setPrefs({
          bookingEnabled: data.bookingEnabled ?? true,
          ticketEnabled: data.ticketEnabled ?? true,
          commentEnabled: data.commentEnabled ?? true,
          emailEnabled: data.emailEnabled ?? false,
          quietHoursStart: data.quietHoursStart ? data.quietHoursStart.substring(0, 5) : '',
          quietHoursEnd: data.quietHoursEnd ? data.quietHoursEnd.substring(0, 5) : '',
        });
      })
      .catch(() => setError('Failed to load preferences.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleTimeChange = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        bookingEnabled: prefs.bookingEnabled,
        ticketEnabled: prefs.ticketEnabled,
        commentEnabled: prefs.commentEnabled,
        emailEnabled: prefs.emailEnabled,
        quietHoursStart: prefs.quietHoursStart ? prefs.quietHoursStart + ':00' : null,
        quietHoursEnd: prefs.quietHoursEnd ? prefs.quietHoursEnd + ':00' : null,
      };
      await updatePreferences(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const toggleItems = [
    {
      key: 'bookingEnabled',
      icon: <CalendarDays size={20} strokeWidth={1.5} />,
      label: 'Booking Notifications',
      description: 'Approvals, rejections, reminders, and cancellations for your facility bookings',
    },
    {
      key: 'ticketEnabled',
      icon: <Ticket size={20} strokeWidth={1.5} />,
      label: 'Ticket Notifications',
      description: 'Status updates, assignments, and resolutions for your support tickets',
    },
    {
      key: 'commentEnabled',
      icon: <MessageSquare size={20} strokeWidth={1.5} />,
      label: 'Comment Notifications',
      description: 'New comments added to your tickets or resources',
    },
    {
      key: 'emailEnabled',
      icon: <Mail size={20} strokeWidth={1.5} />,
      label: 'Email Notifications',
      description: 'Receive critical alerts to your registered university email address',
    },
  ];

  return (
    <div className="page-container">
      <Link
        to="/notifications"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Notifications
      </Link>

      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
          Communication Center
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, margin: 0 }}>
          Alert <span style={{ color: 'var(--text-muted)' }}>Preferences</span>
        </h1>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '32px', maxWidth: '700px' }}>

          {error && (
            <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Channel Toggles */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(42, 20, 180, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-base)' }}>
                <Bell size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Notification Channels</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Control which events trigger alerts</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {toggleItems.map(({ key, icon, label, description }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderRadius: 'var(--radius)',
                    background: prefs[key] ? 'rgba(42, 20, 180, 0.03)' : 'transparent',
                    transition: 'background 0.2s', cursor: 'pointer',
                  }}
                  onClick={() => handleToggle(key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      background: prefs[key] ? 'rgba(42, 20, 180, 0.08)' : 'var(--bg-surface-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: prefs[key] ? 'var(--accent-base)' : 'var(--text-muted)',
                      transition: 'all 0.2s',
                    }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{label}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</p>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '48px', height: '26px', borderRadius: '13px', flexShrink: 0, marginLeft: '24px',
                      background: prefs[key] ? 'var(--accent-base)' : 'var(--bg-surface-elevated)',
                      position: 'relative', transition: 'background 0.25s', boxShadow: prefs[key] ? '0 4px 12px rgba(42, 20, 180, 0.3)' : 'none',
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                      position: 'absolute', top: '3px',
                      left: prefs[key] ? '25px' : '3px',
                      transition: 'left 0.25s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <Moon size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Quiet Hours</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Suppress non-critical alerts during these hours</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { key: 'quietHoursStart', label: 'Start Time', placeholder: '22:00' },
                { key: 'quietHoursEnd', label: 'End Time', placeholder: '07:00' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    {label}
                  </label>
                  <input
                    type="time"
                    value={prefs[key] || ''}
                    onChange={e => handleTimeChange(key, e.target.value)}
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)',
                      border: 'none', background: 'var(--bg-surface-elevated)',
                      fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-main)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <p style={{ margin: '20px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Leave both fields empty to disable quiet hours. Times are in your local timezone.
            </p>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <Save size={16} strokeWidth={2} />
              )}
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                <CheckCircle size={16} strokeWidth={2} />
                Saved successfully
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
