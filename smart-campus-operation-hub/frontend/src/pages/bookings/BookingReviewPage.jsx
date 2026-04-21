import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, XCircle, QrCode, X, Calendar, Search, Plus, RefreshCw } from 'lucide-react';
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

const STATUS_CHART_COLORS = { PENDING: '#ffaa00', APPROVED: '#10b981', REJECTED: '#e12a45', CANCELLED: '#7a7d81' };
const TYPE_CHART_COLORS   = ['#0ea5e9', '#2a14b4', '#ffaa00', '#7a7d81'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#ffffff', border: 'none', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' },
  labelStyle: { color: '#191c1e', fontWeight: 700 },
  itemStyle: { color: '#7a7d81' },
};
const AXIS_TICK = { fill: '#7a7d81', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' };
const AXIS_LINE = { stroke: '#e5e7eb' };

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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '380px', margin: '16px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ fontSize: '1rem', alignSelf: 'flex-start', marginBottom: '-8px' }}>Booking QR Code</h2>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
          {[
            ['Resource',     booking.resourceName],
            ['Location',     booking.resourceLocation],
            ['Date',         booking.date],
            ['Time',         `${booking.startTime?.slice(0, 5)} – ${booking.endTime?.slice(0, 5)}`],
            ['Booking ID',   `#${booking.id}`],
            ['Requested by', booking.userName],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '100px', flexShrink: 0 }}>{label}</span>
              <span style={{ color: 'var(--text-main)' }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#ffffff', padding: '16px', display: 'inline-block', borderRadius: '8px' }}>
          <QRCodeSVG value={booking.qrCode} size={200} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', textAlign: 'center', letterSpacing: '0.04em' }}>
          Scan at the entrance to verify check-in
        </p>
        <button className="btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Close</button>
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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
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
  const _now         = new Date();
  const today        = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;
  const currentMonth = today.slice(0, 7);

  const todayCount   = allBookings.filter(b => b.date === today).length;
  const monthCount   = allBookings.filter(b => b.date?.startsWith(currentMonth)).length;
  const pendingCount = allBookings.filter(b => b.status === 'PENDING').length;
  const approvedN    = allBookings.filter(b => b.status === 'APPROVED').length;
  const rejectedN    = allBookings.filter(b => b.status === 'REJECTED').length;
  const approvalRate = approvedN + rejectedN > 0
    ? Math.round((approvedN / (approvedN + rejectedN)) * 100)
    : 0;

  const statCards = [
    {
      label: 'Bookings Today',
      value: todayCount,
      suffix: '',
      color: '#0ea5e9',
      bg: 'rgba(14,165,233,0.08)',
      icon: '📅',
    },
    {
      label: 'Bookings This Month',
      value: monthCount,
      suffix: '',
      color: '#2a14b4',
      bg: 'rgba(42,20,180,0.08)',
      icon: '📊',
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      suffix: '',
      color: '#ffaa00',
      bg: 'rgba(255,170,0,0.08)',
      icon: '⏳',
    },
    {
      label: 'Approval Rate',
      value: approvalRate,
      suffix: '%',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      icon: '✅',
    },
  ];

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

  // Peak hours
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

  // Top 5 resources
  const resourceMap = {};
  allBookings.forEach(b => {
    if (b.resourceName) resourceMap[b.resourceName] = (resourceMap[b.resourceName] || 0) + 1;
  });
  const resourceData = Object.entries(resourceMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // By resource type
  const typeData = ['LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT']
    .map((t, i) => ({
      name: t.replace(/_/g, ' '),
      value: allBookings.filter(b => b.resourceType === t).length,
      color: TYPE_CHART_COLORS[i],
    }))
    .filter(d => d.value > 0);

  const chartTitle = {
    fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 700,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {statCards.map(card => (
          <div key={card.label} className="card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid ${card.color}22`, background: card.bg }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: card.color, fontWeight: 700 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1 }}>
              {card.value}<span style={{ fontSize: '1.2rem', color: card.color }}>{card.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts 2-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>

        {/* Status breakdown */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={chartTitle}>Booking Status Breakdown</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name] ?? '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by resource type */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={chartTitle}>Bookings by Resource Type</div>
          {typeData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Resource type data not available.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={40} paddingAngle={3}>
                  {typeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend iconType="circle" wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#7a7d81' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Peak booking hours */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={chartTitle}>Peak Booking Hours</div>
          {hourData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No time data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="hour" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Most booked resources */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={chartTitle}>Most Booked Resources (Top 5)</div>
          {resourceData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No resource data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={resourceData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ ...AXIS_TICK, textAnchor: 'end' }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Layout constants ──────────────────────────────────────────────────────────

const COLS = 'minmax(0,2fr) 140px 100px 150px minmax(0,1fr) 120px 170px';

const COL_HEADER = {
  color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-mono)',
};

const ACTION_BTN = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '4px 8px',
  borderRadius: '6px', transition: 'background 0.15s',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingReviewPage() {
  const navigate = useNavigate();

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionError, setActionError] = useState('');

  const [filters, setFilters]     = useState({ status: 'PENDING', resourceType: '', date: '', resourceName: '' });
  const [activeTab, setActiveTab] = useState('BOOKINGS');
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
  const [qrModal, setQrModal]         = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBookings({ page: 0, size: 500 });
      setAllBookings(res.data?.content ?? res.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter + sort: most recent first (date desc, then startTime desc)
  const displayed = allBookings
    .filter(b => {
      if (filters.status && filters.status !== 'ALL' && b.status !== filters.status) return false;
      if (filters.resourceType && b.resourceType !== filters.resourceType)             return false;
      if (filters.date && b.date !== filters.date)                                     return false;
      if (filters.resourceName && !b.resourceName?.toLowerCase().includes(filters.resourceName.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (b.date !== a.date) return b.date?.localeCompare(a.date);
      return (b.startTime ?? '').localeCompare(a.startTime ?? '');
    });

  const hasActiveFilters = filters.status !== 'PENDING' || filters.resourceType || filters.date || filters.resourceName;
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ status: 'PENDING', resourceType: '', date: '', resourceName: '' });

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .brp-data-row {
          display: grid;
          grid-template-columns: ${COLS};
          gap: 16px; padding: 16px 20px; align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          transition: background 0.15s;
        }
        .brp-data-row:hover { background: rgba(42, 20, 180, 0.02); }
        .brp-data-row:last-child { border-bottom: none; }
        .brp-date-input::-webkit-calendar-picker-indicator {
          opacity: 1;
          cursor: pointer;
          filter: invert(50%);
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', marginBottom: '48px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Central Administration
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, margin: 0 }}>
            Reservation <span style={{ color: 'var(--text-muted)' }}>Portal</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!loading && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              {allBookings.length} total records
            </span>
          )}
          <button onClick={fetchAll} className="btn-secondary" title="Refresh">
            <RefreshCw size={16} strokeWidth={1.8} /> Sync
          </button>
          <button
            onClick={() => navigate('/bookings/new')}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} strokeWidth={2.5} /> New Booking
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--bg-surface-elevated)', marginBottom: '32px' }}>
        {['BOOKINGS', 'ANALYTICS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 28px', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-base)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent-base)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              marginBottom: '-2px', transition: 'color 0.15s',
            }}
          >
            {tab}
            {tab === 'BOOKINGS' && !loading && (
              <span style={{ marginLeft: '8px', fontWeight: 400, opacity: 0.55 }}>({displayed.length})</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.06)', borderTopColor: 'var(--accent-base)', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
      {error && (
        <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>ERR:</strong> {error}
        </div>
      )}

      {/* ── BOOKINGS tab ── */}
      {!loading && !error && activeTab === 'BOOKINGS' && (
        <>
          {/* Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>

            {/* Resource name search */}
            <div>
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

            {/* Status */}
            <div>
              <label className="label-text">Status</label>
              <select
                className="input-field"
                value={filters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Resource Type */}
            <div>
              <label className="label-text">Resource Type</label>
              <select
                className="input-field"
                value={filters.resourceType || 'ALL'}
                onChange={(e) => handleFilterChange('resourceType', e.target.value === 'ALL' ? '' : e.target.value)}
              >
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            {/* Date — with visible calendar icon */}
            <div>
              <label className="label-text">Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                <input
                  type="date"
                  className="input-field brp-date-input"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  style={{ paddingLeft: '36px', colorScheme: 'light' }}
                />
              </div>
            </div>

            {/* Clear button */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {hasActiveFilters && (
                <button className="btn-secondary" onClick={clearFilters} style={{ width: '100%', justifyContent: 'center' }}>
                  <X size={14} strokeWidth={1.5} /> Clear
                </button>
              )}
            </div>
          </div>

          {actionError && (
            <div style={{ padding: '12px 20px', marginBottom: '16px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong>ERR:</strong> {actionError}
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="card" style={{ padding: '72px 32px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
                <Calendar size={28} strokeWidth={1.5} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                No bookings match the selected filters.
              </p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: '16px', padding: '14px 20px', background: 'var(--bg-surface-elevated)', ...COL_HEADER }}>
                <div>Resource</div>
                <div>Type</div>
                <div>Date</div>
                <div>Time</div>
                <div>Requested By</div>
                <div>Status</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayed.map((b) => (
                  <div key={b.id} className="brp-data-row">
                    <Link to={`/admin/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.resourceName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.resourceLocation}</span>
                    </Link>

                    <TypeBadge type={b.resourceType} />

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-main)' }}>{b.date}</span>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>{b.userName}</span>
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
                          <button
                            onClick={() => handleApprove(b.id)}
                            style={{ ...ACTION_BTN, color: '#10b981', background: 'rgba(16,185,129,0.08)' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.16)'}
                            onMouseOut={e  => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                          >
                            <Check size={13} strokeWidth={2} /> Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(b.id)}
                            style={{ ...ACTION_BTN, color: 'var(--danger)', background: 'var(--danger-muted)' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(225,42,69,0.16)'}
                            onMouseOut={e  => e.currentTarget.style.background = 'var(--danger-muted)'}
                          >
                            <XCircle size={13} strokeWidth={1.5} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
