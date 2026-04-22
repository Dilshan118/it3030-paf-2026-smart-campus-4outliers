import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, ChevronDown, Clock, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { createBooking } from '../../api/bookingApi';
import { getAllResources } from '../../api/resourceApi';

// ── Type badge colours ────────────────────────────────────────────────────

const TYPE_META = {
  LAB:          { label: 'LAB',          color: 'var(--info)',        bg: 'rgba(0,221,255,0.12)' },
  LECTURE_HALL: { label: 'LECTURE HALL', color: 'var(--accent-base)', bg: 'var(--accent-muted)' },
  MEETING_ROOM: { label: 'MEETING ROOM', color: 'var(--warning)',     bg: 'rgba(255,170,0,0.12)' },
  EQUIPMENT:    { label: 'EQUIPMENT',    color: 'var(--text-muted)',  bg: 'rgba(255,255,255,0.06)' },
};

function TypeBadge({ type }) {
  const m = TYPE_META[type] ?? TYPE_META.EQUIPMENT;
  return (
    <span style={{
      fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
      letterSpacing: '0.06em', padding: '2px 6px',
      border: `1px solid ${m.color}`, color: m.color, background: m.bg,
      flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

// ── Time slots: 07:00 – 22:00, every 30 min ──────────────────────────────

const TIME_SLOTS = [];
for (let h = 7; h <= 22; h++) {
  for (const m of [0, 30]) {
    if (h === 22 && m === 30) break;
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

// ── Availability parser ───────────────────────────────────────────────────

const DAY_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

function parseAvailability(windows) {
  if (!windows) return null;
  try {
    const parsed = typeof windows === 'string' ? JSON.parse(windows) : windows;
    return Object.entries(parsed).map(([day, range]) => ({
      day: DAY_LABEL[day] ?? day.toUpperCase(),
      range,
    }));
  } catch {
    return null;
  }
}

// ── Duration helper ───────────────────────────────────────────────────────

function formatDuration(start, end) {
  if (!start || !end || end <= start) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

// ═════════════════════════════════════════════════════════════════════════

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [resources, setResources]           = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState(null);
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });

  const selectedResource = resources.find(r => String(r.id) === String(formData.resourceId)) ?? null;
  const availability     = parseAvailability(selectedResource?.availabilityWindows);
  const todayISO         = new Date().toISOString().split('T')[0];
  const duration         = formatDuration(formData.startTime, formData.endTime);

  // ── Load active resources ───────────────────────────────────────────────
  useEffect(() => {
    getAllResources(0, 100)
      .then(res => {
        const all = res.data?.content ?? [];
        setResources(all.filter(r => r.status === 'ACTIVE'));
      })
      .catch(() => setError('Failed to load resources. Please refresh and try again.'))
      .finally(() => setResourcesLoading(false));
  }, []);

  // ── Close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        resourceId: Number(formData.resourceId),
        date: formData.date,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        purpose: formData.purpose.trim(),
        ...(formData.expectedAttendees
          ? { expectedAttendees: Number(formData.expectedAttendees) }
          : {}),
      };
      await createBooking(user?.id, payload);
      navigate('/bookings');
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message ??
        'An unexpected error occurred. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="page-container">

      {/* ── Back link + heading ── */}
      <Link
        to="/bookings"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          marginBottom: '28px', color: 'var(--text-muted)',
          textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px',
        }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Bookings
      </Link>

      <h1 className="h1" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginBottom: '32px' }}>New Booking</h1>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          padding: '14px 18px', marginBottom: '28px', borderRadius: 'var(--radius)',
          border: '1px solid var(--danger)', backgroundColor: 'var(--danger-muted)',
        }}>
          <AlertCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.6 }}>
            {error}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ═══ Two-column card grid ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ── LEFT CARD: Resource + Availability ── */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Resource Selection
            </div>

            <div>
              <label className="label-text">Resource</label>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => !resourcesLoading && setDropdownOpen(v => !v)}
                  disabled={resourcesLoading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '10px', padding: '10px 14px',
                    background: 'var(--bg-primary)', border: '1px solid var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius)', color: selectedResource ? 'var(--text-main)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)', fontSize: '14px',
                    cursor: resourcesLoading ? 'not-allowed' : 'pointer', textAlign: 'left',
                  }}
                >
                  {resourcesLoading ? (
                    <span>Loading resources…</span>
                  ) : selectedResource ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <TypeBadge type={selectedResource.type} />
                      <span style={{ fontWeight: 600 }}>{selectedResource.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>— {selectedResource.location}</span>
                    </span>
                  ) : (
                    <span>Select a resource…</span>
                  )}
                  <ChevronDown
                    size={14}
                    style={{ color: 'var(--text-muted)', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
                    background: 'var(--bg-surface)', borderRadius: 'var(--radius)',
                    maxHeight: '300px', overflowY: 'auto',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                    border: '1px solid var(--bg-surface-elevated)',
                  }}>
                    {resources.length === 0 ? (
                      <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        No active resources found
                      </div>
                    ) : resources.map((r, i) => {
                      const isSelected = String(r.id) === String(formData.resourceId);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, resourceId: String(r.id) })); setDropdownOpen(false); }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                            background: isSelected ? 'var(--accent-muted)' : 'transparent',
                            border: 'none',
                            borderBottom: i < resources.length - 1 ? '1px solid var(--bg-surface-elevated)' : 'none',
                            color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '14px',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <TypeBadge type={r.type} />
                          <span style={{ fontWeight: 500 }}>{r.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>— {r.location}</span>
                          {r.capacity != null && (
                            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>
                              {r.capacity} seats
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Availability windows */}
            {availability ? (
              <div style={{ padding: '14px 16px', background: 'rgba(14,165,233,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(14,165,233,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Clock size={11} style={{ color: 'var(--info)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--info)', letterSpacing: '0.1em', fontWeight: 700 }}>
                    AVAILABILITY HOURS
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {availability.map(({ day, range }) => (
                    <span key={day} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '11px',
                      padding: '3px 10px', borderRadius: '6px',
                      background: 'var(--bg-surface)', color: 'var(--text-muted)',
                      border: '1px solid var(--bg-surface-elevated)',
                    }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{day}</span>{' '}{range}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Select a resource to see availability hours.
              </div>
            )}

            {/* Expected Attendees — lives in left card */}
            <div>
              <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={12} style={{ color: 'var(--text-muted)' }} />
                Expected Attendees
                {selectedResource && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>
                    {selectedResource.type === 'EQUIPMENT'
                      ? '(not required for equipment)'
                      : selectedResource.capacity != null
                        ? `(max ${selectedResource.capacity})`
                        : '(required)'}
                  </span>
                )}
              </label>
              <input
                type="number"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleChange}
                min={1}
                max={selectedResource?.capacity ?? undefined}
                placeholder={selectedResource?.capacity != null ? `Max capacity: ${selectedResource.capacity}` : 'e.g. 12'}
                className="input-field"
              />
            </div>
          </div>

          {/* ── RIGHT CARD: Schedule + Purpose ── */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Schedule & Details
            </div>

            {/* Date */}
            <div>
              <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12} style={{ color: 'var(--text-muted)' }} /> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={todayISO}
                required
                className="input-field"
                style={{ colorScheme: 'light', cursor: 'pointer' }}
              />
            </div>

            {/* Start + End time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} style={{ color: 'var(--text-muted)' }} /> Start Time
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setFormData(prev => ({ ...prev, startTime: newStart, endTime: prev.endTime > newStart ? prev.endTime : '' }));
                  }}
                  required
                  className="input-field"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">— select —</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} style={{ color: 'var(--text-muted)' }} /> End Time
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="input-field"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                  disabled={!formData.startTime}
                >
                  <option value="">— select —</option>
                  {TIME_SLOTS.filter(t => !formData.startTime || t > formData.startTime).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration hint */}
            {duration && (
              <div style={{ marginTop: '-8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                Duration: <span style={{ color: 'var(--accent-base)', fontWeight: 600 }}>{duration}</span>
              </div>
            )}

            {/* Purpose */}
            <div style={{ flex: 1 }}>
              <label className="label-text">Purpose</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={500}
                rows={6}
                placeholder="Describe the purpose of this booking (10–500 characters)"
                className="input-field"
                style={{ resize: 'vertical' }}
              />
              <div style={{ textAlign: 'right', marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: formData.purpose.length > 450 ? 'var(--warning)' : 'var(--text-muted)' }}>
                {formData.purpose.length}/500
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit row ── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/bookings')}
            style={{ justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || resourcesLoading}
            style={{ justifyContent: 'center', minWidth: '160px' }}
          >
            {submitting ? 'Submitting…' : 'Submit Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}