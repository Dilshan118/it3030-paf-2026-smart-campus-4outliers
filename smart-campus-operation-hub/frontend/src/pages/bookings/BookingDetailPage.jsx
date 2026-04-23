import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, ChevronDown, Clock, Edit2, FileWarning, Users, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getBookingById, updateBooking, cancelBooking } from '../../api/bookingApi';
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

// ── Cancel modal ──────────────────────────────────────────────────────────────

function CancelModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '440px', margin: '16px', padding: '28px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Cancel Booking</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          Please provide a reason for cancellation. This cannot be undone.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (reason.trim()) onConfirm(reason.trim()); }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div>
            <label className="label-text">Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              ref={textareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={3}
              rows={3}
              placeholder="e.g. Schedule conflict, event cancelled…"
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Back</button>
            <button type="submit" className="btn-danger" disabled={!reason.trim()} style={{ opacity: reason.trim() ? 1 : 0.4 }}>
              Confirm Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [actionError, setActionError]   = useState('');
  const [isEditing, setIsEditing]       = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [resources, setResources]     = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [editData, setEditData] = useState({
    resourceId: '', date: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '',
  });

  const _now     = new Date();
  const todayISO = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

  const selectedResource = resources.find(r => String(r.id) === String(editData.resourceId)) ?? null;
  const availability     = parseAvailability(selectedResource?.availabilityWindows);
  const duration         = formatDuration(editData.startTime, editData.endTime);

  const availableStartSlots = (() => {
    if (editData.date !== todayISO) return TIME_SLOTS;
    const nowMins = _now.getHours() * 60 + _now.getMinutes();
    return TIME_SLOTS.filter(t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m > nowMins;
    });
  })();

  const fetchBooking = useCallback(async () => {
    try {
      setBookingError('');
      const res = await getBookingById(id);
      setBooking(res.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const enterEditMode = async () => {
    if (resources.length === 0) {
      try {
        const res = await getAllResources(0, 100);
        const all = res.data?.content ?? [];
        setResources(all.filter(r => r.status === 'ACTIVE'));
      } catch {
        // non-critical — fallback option shown in select
      }
    }
    setEditData({
      resourceId: String(booking.resourceId),
      date: booking.date,
      startTime: booking.startTime?.slice(0, 5) || '',
      endTime: booking.endTime?.slice(0, 5) || '',
      purpose: booking.purpose || '',
      expectedAttendees: booking.expectedAttendees ? String(booking.expectedAttendees) : '',
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionError('');
      const payload = {
        resourceId: Number(editData.resourceId),
        date: editData.date,
        startTime: editData.startTime.length === 5 ? editData.startTime + ':00' : editData.startTime,
        endTime: editData.endTime.length === 5 ? editData.endTime + ':00' : editData.endTime,
        purpose: editData.purpose.trim(),
        ...(editData.expectedAttendees ? { expectedAttendees: Number(editData.expectedAttendees) } : {}),
      };
      await updateBooking(id, payload);
      setIsEditing(false);
      fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleCancel = async (reason) => {
    setShowCancelModal(false);
    try {
      setActionError('');
      await cancelBooking(id, reason);
      navigate('/bookings');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading...</p>
      </div>
    );
  }
  if (bookingError) {
    return (
      <div className="page-container">
        <div className="card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '24px' }}>
          Error: {bookingError}
        </div>
      </div>
    );
  }
  if (!booking) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)' }}>
          <FileWarning size={20} /> Booking not found
        </div>
      </div>
    );
  }

  const canEdit   = booking.status === 'PENDING';
  const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <Link
        to="/bookings"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to My Bookings
      </Link>

      {isEditing ? (
        /* ── Edit form ─────────────────────────────────────────────── */
        <>
          <h1 className="h1" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginBottom: '32px' }}>Edit Booking</h1>

          {actionError && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '14px 18px', marginBottom: '28px', borderRadius: 'var(--radius)',
              border: '1px solid var(--danger)', backgroundColor: 'var(--danger-muted)',
            }}>
              <AlertCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.6 }}>
                {actionError}
              </span>
            </div>
          )}

          <form onSubmit={handleEditSubmit}>
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
                      onClick={() => setDropdownOpen(v => !v)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', gap: '10px', padding: '10px 14px',
                        background: 'var(--bg-primary)', border: '1px solid var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius)', color: selectedResource ? 'var(--text-main)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-body)', fontSize: '14px',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {selectedResource ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <TypeBadge type={selectedResource.type} />
                          <span style={{ fontWeight: 600 }}>{selectedResource.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>— {selectedResource.location}</span>
                        </span>
                      ) : (
                        <span>{booking.resourceName} (current)</span>
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
                          const isSelected = String(r.id) === String(editData.resourceId);
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => { setEditData(prev => ({ ...prev, resourceId: String(r.id) })); setDropdownOpen(false); }}
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

                {/* Expected Attendees */}
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
                    value={editData.expectedAttendees}
                    onChange={handleEditChange}
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
                    value={editData.date}
                    onChange={handleEditChange}
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
                      value={editData.startTime}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setEditData(prev => ({ ...prev, startTime: newStart, endTime: prev.endTime > newStart ? prev.endTime : '' }));
                      }}
                      required
                      className="input-field"
                      style={{ appearance: 'none', cursor: 'pointer' }}
                    >
                      <option value="">— select —</option>
                      {availableStartSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} style={{ color: 'var(--text-muted)' }} /> End Time
                    </label>
                    <select
                      name="endTime"
                      value={editData.endTime}
                      onChange={handleEditChange}
                      required
                      className="input-field"
                      style={{ appearance: 'none', cursor: 'pointer' }}
                      disabled={!editData.startTime}
                    >
                      <option value="">— select —</option>
                      {TIME_SLOTS.filter(t => !editData.startTime || t > editData.startTime).map(t => (
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
                    value={editData.purpose}
                    onChange={handleEditChange}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={6}
                    placeholder="Describe the purpose of this booking (10–500 characters)"
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                  <div style={{ textAlign: 'right', marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: editData.purpose.length > 450 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {editData.purpose.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* ── Submit row ── */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
                style={{ justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ justifyContent: 'center', minWidth: '160px' }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </>
      ) : (
        /* ── Detail view ───────────────────────────────────────────── */
        <div className="card" style={{ maxWidth: '800px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 className="h1" style={{ borderBottom: 'none', marginBottom: 0 }}>{booking.resourceName}</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                Booking #{booking.id}
              </p>
            </div>
            <span className={`badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
          </div>

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-main)' }}>
            <div>
              <p className="label-text">Date</p>
              <p style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{booking.date}</p>
            </div>
            <div>
              <p className="label-text">Time</p>
              <p style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                {booking.startTime?.slice(0, 5)} – {booking.endTime?.slice(0, 5)}
              </p>
            </div>
            <div>
              <p className="label-text">Location</p>
              <p style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{booking.resourceLocation || '—'}</p>
            </div>
            {booking.expectedAttendees && (
              <div>
                <p className="label-text">Attendees</p>
                <p style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{booking.expectedAttendees}</p>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div style={{ padding: '20px', background: 'var(--bg-primary)', border: '1px solid var(--border-main)', marginBottom: '16px' }}>
            <h3 className="label-text" style={{ marginBottom: '12px' }}>Purpose</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{booking.purpose}</p>
          </div>

          {/* Rejection reason */}
          {booking.status === 'REJECTED' && booking.adminReason && (
            <div style={{ padding: '16px', border: '1px solid var(--danger)', backgroundColor: 'var(--danger-muted)', marginBottom: '16px' }}>
              <p className="label-text" style={{ color: 'var(--danger)', marginBottom: '8px' }}>Rejection Reason</p>
              <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '14px', margin: 0 }}>{booking.adminReason}</p>
            </div>
          )}

          {/* Cancellation reason */}
          {booking.status === 'CANCELLED' && booking.adminReason && (
            <div style={{ padding: '16px', border: '1px solid var(--border-main)', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
              <p className="label-text" style={{ marginBottom: '8px' }}>Cancellation Reason</p>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px', margin: 0 }}>{booking.adminReason}</p>
            </div>
          )}

          {/* QR code */}
          {booking.status === 'APPROVED' && booking.qrCode && (
            <div style={{ padding: '20px', background: 'var(--bg-primary)', border: '1px solid var(--border-main)', marginBottom: '16px' }}>
              <p className="label-text" style={{ marginBottom: '16px' }}>Check-in QR Code</p>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ background: '#ffffff', padding: '12px', display: 'inline-block', flexShrink: 0 }}>
                  <QRCodeSVG value={booking.qrCode} size={160} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.6, margin: 0, alignSelf: 'center' }}>
                  Present this QR code at the entrance to check in for your booking.
                </p>
              </div>
            </div>
          )}

          {/* Action error */}
          {actionError && (
            <div style={{ padding: '12px 16px', border: '1px solid var(--danger)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>
              {actionError}
            </div>
          )}

          {/* Actions */}
          {(canEdit || canCancel) && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {canEdit && (
                <button className="btn-secondary" onClick={enterEditMode} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Edit2 size={15} strokeWidth={1.5} /> Edit Booking
                </button>
              )}
              {canCancel && (
                <button className="btn-danger" onClick={() => setShowCancelModal(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <X size={15} strokeWidth={1.5} /> Cancel Booking
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showCancelModal && (
        <CancelModal onConfirm={handleCancel} onClose={() => setShowCancelModal(false)} />
      )}
    </div>
  );
}
