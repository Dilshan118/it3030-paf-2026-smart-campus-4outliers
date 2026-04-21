import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, QrCode, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../../context/AuthContext';
import { getBookings, cancelBooking } from '../../api/bookingApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const TYPE_OPTIONS   = ['ALL', 'LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT'];

const TYPE_META = {
  LAB:          { label: 'LAB',          color: 'var(--info)',        bg: 'rgba(0,221,255,0.08)' },
  LECTURE_HALL: { label: 'LECTURE HALL', color: 'var(--accent-base)', bg: 'var(--accent-muted)' },
  MEETING_ROOM: { label: 'MEETING ROOM', color: 'var(--warning)',     bg: 'rgba(255,170,0,0.08)' },
  EQUIPMENT:    { label: 'EQUIPMENT',    color: 'var(--text-muted)',  bg: 'rgba(255,255,255,0.04)' },
};

// ── Badges ────────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const m = TYPE_META[type] ?? TYPE_META.EQUIPMENT;
  return (
    <span className="badge" style={{ color: m.color, borderColor: m.color, background: m.bg, fontSize: '10px', letterSpacing: '0.06em' }}>
      {m.label}
    </span>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge status-${status?.toLowerCase()}`}>{status}</span>;
}

// ── QR modal ──────────────────────────────────────────────────────────────────

function QRModal({ booking, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '380px', margin: '16px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ fontSize: '1rem', alignSelf: 'flex-start', marginBottom: '-8px' }}>Booking QR Code</h2>

        {/* Booking details */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-main)' }}>
          {[
            ['Resource',   booking.resourceName],
            ['Location',   booking.resourceLocation],
            ['Date',       booking.date],
            ['Time',       `${booking.startTime?.slice(0, 5)} – ${booking.endTime?.slice(0, 5)}`],
            ['Booking ID', `#${booking.id}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>{label}</span>
              <span style={{ color: 'var(--text-main)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* QR code — white background required for scanners */}
        <div style={{ background: '#ffffff', padding: '16px', display: 'inline-block' }}>
          <QRCodeSVG value={booking.qrCode} size={200} />
        </div>

        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', textAlign: 'center', letterSpacing: '0.04em' }}>
          Scan at the entrance to check in
        </p>

        <button className="btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ── Cancel modal ──────────────────────────────────────────────────────────────

function CancelModal({ bookingId, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(bookingId, reason.trim());
  };

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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

// ── Layout ────────────────────────────────────────────────────────────────────

const COLS = 'minmax(0,2fr) 140px 100px 150px 120px 170px';

const COL_HEADER = {
  color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-mono)',
};

const ACTION_BTN = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '4px 8px',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingListPage() {
  const { user } = useContext(AuthContext);

  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [actionError, setActionError]   = useState('');
  const [filters, setFilters]           = useState({ status: '', resourceType: '', date: '', resourceName: '' });
  const [cancelModal, setCancelModal]   = useState({ open: false, bookingId: null });
  const [qrModal, setQrModal]           = useState(null);

  // Fetch user's bookings. Status is a backend param; resource type and date
  // are applied client-side so we don't need extra repository methods.
  // useCallback stabilises the reference so it can safely be called from
  // action handlers (cancel) without triggering the effect loop.
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { userId: user?.id, page: 0, size: 200 };
      // Pass status to backend for server-side filtering
      if (filters.status) params.status = filters.status;

      const res = await getBookings(params);
      setBookings(res.data?.content ?? res.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.status, user?.id]); // re-create only when these change

  // Re-fetch whenever the status filter or user changes
  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Client-side filters: resource type and date are applied against the fetched list.
  // This avoids adding more repository methods and keeps the API surface small.
  const displayed = bookings.filter(b => {
    if (filters.resourceType && b.resourceType !== filters.resourceType) return false;
    if (filters.date         && b.date         !== filters.date)         return false;
    if (filters.resourceName && !b.resourceName?.toLowerCase().includes(filters.resourceName.toLowerCase())) return false;
    return true;
  });

  const hasActiveFilters = filters.status || filters.resourceType || filters.date || filters.resourceName;

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ status: '', resourceType: '', date: '', resourceName: '' });

  const openCancelModal  = (id) => setCancelModal({ open: true, bookingId: id });
  const closeCancelModal = ()   => setCancelModal({ open: false, bookingId: null });

  const handleCancel = async (id, reason) => {
    closeCancelModal();
    try {
      setActionError('');
      await cancelBooking(id, reason);
      fetchBookings();
    } catch (err) {
      setActionError(err.response?.data?.message ?? err.message);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', marginBottom: '48px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Facility Management
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, margin: 0 }}>
            My <span style={{ color: 'var(--text-muted)' }}>Reservations</span>
          </h1>
        </div>
        <Link to="/bookings/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} strokeWidth={1.5} /> New Booking
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label className="label-text">Resource Name</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search resource…"
              value={filters.resourceName}
              onChange={(e) => handleFilterChange('resourceName', e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '140px' }}>
          <label className="label-text">Status</label>
          <select
            className="input-field"
            value={filters.status || 'ALL'}
            onChange={(e) => handleFilterChange('status', e.target.value === 'ALL' ? '' : e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <label className="label-text">Resource Type</label>
          <select
            className="input-field"
            value={filters.resourceType || 'ALL'}
            onChange={(e) => handleFilterChange('resourceType', e.target.value === 'ALL' ? '' : e.target.value)}
          >
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <label className="label-text">Date</label>
          <input
            type="date"
            className="input-field"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {hasActiveFilters && (
          <button className="btn-secondary" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
            <X size={14} strokeWidth={1.5} /> Clear
          </button>
        )}
      </div>

      {/* Action error */}
      {actionError && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', border: '1px solid var(--danger)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          {actionError}
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading bookings...</p>}
      {error   && <p style={{ color: 'var(--danger)',     fontFamily: 'var(--font-mono)' }}>Error: {error}</p>}

      {/* Table */}
      {!loading && !error && (
        displayed.length === 0 ? (
          <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {hasActiveFilters ? 'No bookings match the selected filters.' : 'No bookings yet. Reserve a resource to get started.'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: '16px', padding: '8px 16px', ...COL_HEADER }}>
              <div>Resource</div><div>Type</div><div>Date</div><div>Time</div><div>Status</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            {displayed.map((b, i) => (
              <div key={b.id} style={{
                display: 'grid', gridTemplateColumns: COLS, gap: '16px',
                padding: '14px 16px', alignItems: 'center',
                borderTop: '1px solid var(--border-main)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <Link to={`/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontWeight: 600 }}>{b.resourceName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.resourceLocation}</span>
                </Link>

                <TypeBadge type={b.resourceType} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{b.date}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}</span>
                <StatusBadge status={b.status} />

                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {b.status === 'APPROVED' && b.qrCode && (
                    <button onClick={() => setQrModal(b)} style={{ ...ACTION_BTN, color: 'var(--info)' }} title="View QR code">
                      <QrCode size={13} strokeWidth={1.5} /> QR
                    </button>
                  )}
                  {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                    <button onClick={() => openCancelModal(b.id)} style={{ ...ACTION_BTN, color: 'var(--danger)' }} title="Cancel booking">
                      <X size={13} strokeWidth={1.5} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {cancelModal.open && (
        <CancelModal bookingId={cancelModal.bookingId} onConfirm={handleCancel} onClose={closeCancelModal} />
      )}
      {qrModal && <QRModal booking={qrModal} onClose={() => setQrModal(null)} />}
    </div>
  );
}
