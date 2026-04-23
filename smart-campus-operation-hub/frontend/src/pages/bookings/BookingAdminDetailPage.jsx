import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, XCircle, FileWarning } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getBookingById, approveBooking, rejectBooking } from '../../api/bookingApi';

// ── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '440px', margin: '16px', padding: '28px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Reject Booking</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          Provide a reason so the requester understands why their booking was rejected.
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
              placeholder="e.g. Resource already allocated, under maintenance…"
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Back</button>
            <button type="submit" className="btn-danger" disabled={!reason.trim()} style={{ opacity: reason.trim() ? 1 : 0.4 }}>
              Confirm Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Info row helper ───────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <p className="label-text">{label}</p>
      <p style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', margin: 0 }}>{value || '—'}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingAdminDetailPage() {
  const { id } = useParams();

  const [booking, setBooking]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [actionError, setActionError]   = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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

  const handleApprove = async () => {
    try {
      setActionError('');
      await approveBooking(id);
      fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (reason) => {
    setShowRejectModal(false);
    try {
      setActionError('');
      await rejectBooking(id, reason);
      fetchBooking();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject booking');
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

  const isFinal  = booking.status === 'REJECTED' || booking.status === 'CANCELLED';
  const isPending = booking.status === 'PENDING';
  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <Link
        to="/admin/bookings"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Booking Review
      </Link>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(280px, 1fr)' }}>

        {/* ── Main column ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 className="h1" style={{ borderBottom: 'none', marginBottom: 0 }}>{booking.resourceName}</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  #{booking.id} • Requested by {booking.userName || `User ${booking.userId}`}{booking.userStudentId && ` (${booking.userStudentId})`}
                </p>
              </div>
              <span className={`badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
            </div>

            {/* Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-main)' }}>
              <InfoRow label="Date" value={booking.date} />
              <InfoRow label="Time" value={`${booking.startTime?.slice(0, 5)} – ${booking.endTime?.slice(0, 5)}`} />
              <InfoRow label="Location" value={booking.resourceLocation} />
              {booking.expectedAttendees && <InfoRow label="Attendees" value={booking.expectedAttendees} />}
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
              <div style={{ padding: '20px', background: 'var(--bg-primary)', border: '1px solid var(--border-main)' }}>
                <p className="label-text" style={{ marginBottom: '16px' }}>Check-in QR Code</p>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ background: '#ffffff', padding: '12px', display: 'inline-block', flexShrink: 0 }}>
                    <QRCodeSVG value={booking.qrCode} size={160} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.6, margin: 0, alignSelf: 'center' }}>
                    User presents this code at the entrance to verify their booking.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Admin sidebar ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Admin actions */}
          {isPending && (
            <div className="card">
              <h3 className="label-text" style={{ marginBottom: '20px' }}>Admin Actions</h3>

              {actionError && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', border: '1px solid var(--danger)', backgroundColor: 'var(--danger-muted)', color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {actionError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isPending && (
                  <>
                    <button className="btn-primary" onClick={handleApprove} style={{ width: '100%', justifyContent: 'center' }}>
                      <Check size={15} strokeWidth={1.5} /> Approve Booking
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowRejectModal(true)}
                      style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      <XCircle size={15} strokeWidth={1.5} /> Reject Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Booking metadata */}
          <div className="card">
            <h3 className="label-text" style={{ marginBottom: '16px' }}>Booking Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p className="label-text">Created</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', margin: 0 }}>
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '—'}
                </p>
              </div>
              <div>
                <p className="label-text">Last Updated</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', margin: 0 }}>
                  {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : '—'}
                </p>
              </div>
              {booking.checkedInAt && (
                <div>
                  <p className="label-text">Checked In</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-base)', margin: 0 }}>
                    {new Date(booking.checkedInAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <RejectModal onConfirm={handleReject} onClose={() => setShowRejectModal(false)} />
      )}
    </div>
  );
}
