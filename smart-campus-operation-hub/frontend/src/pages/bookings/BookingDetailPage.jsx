import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, X, FileWarning } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getBookingById, updateBooking, cancelBooking } from '../../api/bookingApi';
import { getAllResources } from '../../api/resourceApi';

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

  const [resources, setResources] = useState([]);
  const [editData, setEditData] = useState({
    resourceId: '', date: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '',
  });

  const todayISO = new Date().toISOString().split('T')[0];

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
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <Link
        to="/bookings"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to My Bookings
      </Link>

      {isEditing ? (
        /* ── Edit form ─────────────────────────────────────────────── */
        <div className="card">
          <h2 className="h1" style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Edit Booking</h2>

          {actionError && (
            <div style={{ padding: '12px 16px', border: '1px solid var(--danger)', backgroundColor: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '20px' }}>
              {actionError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label-text">Resource</label>
              <select name="resourceId" value={editData.resourceId} onChange={handleEditChange} required className="input-field" style={{ appearance: 'none', cursor: 'pointer' }}>
                <option value="">Select a resource</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.location} ({r.type.replace(/_/g, ' ')})</option>
                ))}
                {resources.length === 0 && (
                  <option value={editData.resourceId}>{booking.resourceName} (current)</option>
                )}
              </select>
            </div>

            <div>
              <label className="label-text">Date</label>
              <input type="date" name="date" value={editData.date} onChange={handleEditChange} min={todayISO} required className="input-field" style={{ colorScheme: 'dark' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label-text">Start Time</label>
                <input type="time" name="startTime" value={editData.startTime} onChange={handleEditChange} required className="input-field" />
              </div>
              <div>
                <label className="label-text">End Time</label>
                <input type="time" name="endTime" value={editData.endTime} onChange={handleEditChange} required className="input-field" />
              </div>
            </div>

            <div>
              <label className="label-text">Purpose</label>
              <textarea name="purpose" value={editData.purpose} onChange={handleEditChange} required minLength={10} maxLength={500} rows={4} className="input-field" style={{ resize: 'vertical' }} />
            </div>

            <div>
              <label className="label-text">Expected Attendees <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input type="number" name="expectedAttendees" value={editData.expectedAttendees} onChange={handleEditChange} min={1} className="input-field" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)} style={{ justifyContent: 'center' }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        /* ── Detail view ───────────────────────────────────────────── */
        <div className="card">
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
