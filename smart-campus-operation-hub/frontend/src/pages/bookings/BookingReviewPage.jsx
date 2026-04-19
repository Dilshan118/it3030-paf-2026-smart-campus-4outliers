import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, XCircle, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getBookings, approveBooking, rejectBooking } from '../../api/bookingApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const TYPE_OPTIONS   = ['ALL', 'LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT'];

const TYPE_META = {
  LAB:          { label: 'LAB',          color: 'var(--info)',        bg: 'rgba(0,221,255,0.08)' },
  LECTURE_HALL: { label: 'LECTURE HALL', color: 'var(--accent-base)', bg: 'var(--accent-muted)' },
  MEETING_ROOM: { label: 'MEETING ROOM', color: 'var(--warning)',     bg: 'rgba(255,170,0,0.08)' },
  EQUIPMENT:    { label: 'EQUIPMENT',    color: 'var(--text-muted)',  bg: 'rgba(255,255,255,0.04)' },
};

// Colors for charts (hex — recharts can't read CSS vars)
const STATUS_CHART_COLORS = { PENDING: '#ffaa00', APPROVED: '#ccff00', REJECTED: '#ff3300', CANCELLED: '#555555' };
const TYPE_CHART_COLORS   = ['#00ddff', '#ccff00', '#ffaa00', '#888888'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1a1a', border: '1px solid #333', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' },
  labelStyle: { color: '#fcfcfc' },
  itemStyle: { color: '#888888' },
};
const AXIS_TICK = { fill: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' };
const AXIS_LINE = { stroke: '#333333' };

// ── Shared badges ─────────────────────────────────────────────────────────────

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
            ['Resource',      booking.resourceName],
            ['Location',      booking.resourceLocation],
            ['Date',          booking.date],
            ['Time',          `${booking.startTime?.slice(0, 5)} – ${booking.endTime?.slice(0, 5)}`],
            ['Booking ID',    `#${booking.id}`],
            ['Requested by',  booking.userName],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '100px', flexShrink: 0 }}>{label}</span>
              <span style={{ color: 'var(--text-main)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* White background required for scanners on dark card */}
        <div style={{ background: '#ffffff', padding: '16px', display: 'inline-block' }}>
          <QRCodeSVG value={booking.qrCode} size={200} />
        </div>

        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', textAlign: 'center', letterSpacing: '0.04em' }}>
          Scan at the entrance to verify check-in
        </p>

        <button className="btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({ bookingId, onConfirm, onClose }) {
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
        <h2 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Reject Booking</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          Provide a reason so the requester understands why their booking was rejected.
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
              placeholder="e.g. Time slot already allocated, resource under maintenance…"
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

// ── Analytics panel ───────────────────────────────────────────────────────────

function AnalyticsPanel({ allBookings }) {
  if (allBookings.length === 0) {
    return (
      <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No booking data to analyse yet.</p>
      </div>
    );
  }

  // Status breakdown
  const statusData = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
    .map(s => ({ name: s, count: allBookings.filter(b => b.status === s).length }))
    .filter(d => d.count > 0);

  // Peak booking hours by start time
  const hourMap = {};
  allBookings.forEach(b => {
    if (b.startTime) {
      const h = parseInt(b.startTime.slice(0, 2), 10);
      hourMap[h] = (hourMap[h] || 0) + 1;
    }
  });
  const hourData = Object.entries(hourMap)
    .map(([h, count]) => ({ hour: `${String(h).padStart(2, '0')}:00`, count }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // Most booked resources (top 5)
  const resourceMap = {};
  allBookings.forEach(b => {
    if (b.resourceName) resourceMap[b.resourceName] = (resourceMap[b.resourceName] || 0) + 1;
  });
  const resourceData = Object.entries(resourceMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Bookings by resource type — uses b.resourceType from the DTO
  const typeData = ['LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT']
    .map((t, i) => ({
      name: t.replace(/_/g, ' '),
      value: allBookings.filter(b => b.resourceType === t).length,
      color: TYPE_CHART_COLORS[i],
    }))
    .filter(d => d.value > 0);

  const cardStyle   = { padding: '20px 24px' };
  const chartTitle  = { fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px' }}>

      {/* Status breakdown */}
      <div className="card" style={cardStyle}>
        <div style={chartTitle}>Booking Status Breakdown</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="name" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {statusData.map(entry => (
                <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name] ?? '#888'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings by resource type */}
      <div className="card" style={cardStyle}>
        <div style={chartTitle}>Bookings by Resource Type</div>
        {typeData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            Resource type data not available. Ensure bookings have a resource type set.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {typeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend iconType="square" wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#888888' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Peak booking hours */}
      <div className="card" style={cardStyle}>
        <div style={chartTitle}>Peak Booking Hours</div>
        {hourData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No time data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="hour" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#00ddff" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Most booked resources (horizontal bar) */}
      <div className="card" style={cardStyle}>
        <div style={chartTitle}>Most Booked Resources (Top 5)</div>
        {resourceData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No resource data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resourceData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ ...AXIS_TICK, textAnchor: 'end' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#ccff00" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

const COLS = 'minmax(0,2fr) 140px 100px 150px minmax(0,1fr) 120px 170px';

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

export default function BookingReviewPage() {
  // Fetches ALL bookings (no userId param → admin view).
  // All three filters are applied client-side so the analytics tab always
  // has the full dataset regardless of what the BOOKINGS tab is showing.

  const [allBookings, setAllBookings]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [actionError, setActionError]   = useState('');

  const [filters, setFilters]     = useState({ status: 'PENDING', resourceType: '', date: '' });
  const [activeTab, setActiveTab] = useState('BOOKINGS');
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
  const [qrModal, setQrModal]         = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // No userId, no status → backend returns ALL bookings (admin view)
      const res = await getBookings({ page: 0, size: 500 });
      setAllBookings(res.data?.content ?? res.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  // All three filters are client-side
  const displayed = allBookings.filter(b => {
    if (filters.status && filters.status !== 'ALL' && b.status !== filters.status) return false;
    if (filters.resourceType && b.resourceType !== filters.resourceType)             return false;
    if (filters.date         && b.date          !== filters.date)                    return false;
    return true;
  });

  // "Clear" resets to the default PENDING view, not all-unfiltered
  const hasActiveFilters = filters.status !== 'PENDING' || filters.resourceType || filters.date;
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ status: 'PENDING', resourceType: '', date: '' });

  const openRejectModal  = (id) => setRejectModal({ open: true, bookingId: id });
  const closeRejectModal = ()   => setRejectModal({ open: false, bookingId: null });

  const handleApprove = async (id) => {
    try {
      setActionError('');
      await approveBooking(id);
      fetchAll();
    } catch (err) {
      setActionError(err.response?.data?.message ?? err.message);
    }
  };

  const handleReject = async (id, reason) => {
    closeRejectModal();
    try {
      setActionError('');
      await rejectBooking(id, reason);
      fetchAll();
    } catch (err) {
      setActionError(err.response?.data?.message ?? err.message);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h1 className="h1">Booking Review</h1>
        {!loading && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>
            {allBookings.length} total
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)', marginBottom: '28px' }}>
        {['BOOKINGS', 'ANALYTICS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-base)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent-base)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {tab}
            {tab === 'BOOKINGS' && !loading && (
              <span style={{ marginLeft: '6px', fontWeight: 400, opacity: 0.6 }}>({displayed.length})</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading bookings...</p>}
      {error   && <p style={{ color: 'var(--danger)',     fontFamily: 'var(--font-mono)' }}>Error: {error}</p>}

      {/* ── BOOKINGS tab ── */}
      {!loading && !error && activeTab === 'BOOKINGS' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label className="label-text">Status</label>
              <select
                className="input-field"
                value={filters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
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

          {actionError && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', border: '1px solid var(--danger)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              {actionError}
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                No bookings match the selected filters.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: '16px', padding: '8px 16px', ...COL_HEADER }}>
                <div>Resource</div><div>Type</div><div>Date</div><div>Time</div>
                <div>Requested By</div><div>Status</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {displayed.map((b, i) => (
                <div key={b.id} style={{
                  display: 'grid', gridTemplateColumns: COLS, gap: '16px',
                  padding: '14px 16px', alignItems: 'center',
                  borderTop: '1px solid var(--border-main)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <Link to={`/admin/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontWeight: 600 }}>{b.resourceName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.resourceLocation}</span>
                  </Link>

                  <TypeBadge type={b.resourceType} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{b.date}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}</span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{b.userName}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>#{b.id}</span>
                  </div>

                  <StatusBadge status={b.status} />

                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {b.status === 'APPROVED' && b.qrCode && (
                      <button onClick={() => setQrModal(b)} style={{ ...ACTION_BTN, color: 'var(--info)' }} title="View QR code">
                        <QrCode size={13} strokeWidth={1.5} /> QR
                      </button>
                    )}
                    {b.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(b.id)} style={{ ...ACTION_BTN, color: 'var(--accent-base)' }}>
                          <Check size={13} strokeWidth={1.5} /> Approve
                        </button>
                        <button onClick={() => openRejectModal(b.id)} style={{ ...ACTION_BTN, color: 'var(--danger)' }}>
                          <XCircle size={13} strokeWidth={1.5} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ANALYTICS tab ── */}
      {!loading && !error && activeTab === 'ANALYTICS' && (
        <AnalyticsPanel allBookings={allBookings} />
      )}

      {/* Modals */}
      {rejectModal.open && (
        <RejectModal bookingId={rejectModal.bookingId} onConfirm={handleReject} onClose={closeRejectModal} />
      )}
      {qrModal && <QRModal booking={qrModal} onClose={() => setQrModal(null)} />}
    </div>
  );
}
