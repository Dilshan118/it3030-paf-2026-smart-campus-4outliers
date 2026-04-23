import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { getTickets } from '../../api/ticketApi';
import { getBookings } from '../../api/bookingApi';
import { getResourceAnalytics } from '../../api/resourceApi';
import {
  Activity,
  AlertTriangle,
  Box,
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  ShieldCheck,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';

const TYPE_META = {
  LAB:          { label: 'Laboratory',   color: 'var(--accent-base)' },
  LECTURE_HALL: { label: 'Lecture Hall', color: '#38A169' },
  MEETING_ROOM: { label: 'Meeting Room', color: '#805AD5' },
  EQUIPMENT:    { label: 'Equipment',    color: '#D69E2E' },
};

class ChartSectionBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e) { console.error('Chart failed:', e); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--border-main)' }} />
    </div>
  );
}

const TABS = [
  { id: 'OVERVIEW', label: 'Overview' },
  { id: 'TICKETS', label: 'Tickets' },
  { id: 'BOOKINGS', label: 'Bookings' },
  { id: 'RESOURCES', label: 'Resources' },
];

const TICKET_STATUS_ORDER = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const TICKET_PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const BOOKING_STATUS_ORDER = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const BOOKING_TYPE_ORDER = ['LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT'];

const DEFAULT_METRICS = {
  totalTickets: 0,
  openTickets: 0,
  resolvedTickets: 0,
  totalResources: 0,
  totalBookings: 0,
};

const DEFAULT_RESOURCE_ANALYTICS = {
  totalResources: 0,
  activeResources: 0,
  outOfServiceResources: 0,
  resourcesByType: {},
  resourcesByLocation: {},
  addedThisMonth: 0,
  activePercentage: 0,
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatEnum(value) {
  if (!value) return 'Unknown';
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;

  if (payload.data && typeof payload.data === 'object') {
    if (Array.isArray(payload.data.content)) return payload.data.content;
    if (Array.isArray(payload.data.items)) return payload.data.items;
  }

  return [];
}

function normalizeMetricsPayload(payload) {
  const raw = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : payload)
    : null;

  if (!raw) {
    return DEFAULT_METRICS;
  }

  return {
    totalTickets: toNumber(raw.totalTickets),
    openTickets: toNumber(raw.openTickets),
    resolvedTickets: toNumber(raw.resolvedTickets),
    totalResources: toNumber(raw.totalResources),
    totalBookings: toNumber(raw.totalBookings),
  };
}

function normalizeResourceAnalyticsPayload(payload) {
  const raw = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : payload)
    : null;

  if (!raw) {
    return DEFAULT_RESOURCE_ANALYTICS;
  }

  return {
    totalResources: toNumber(raw.totalResources),
    activeResources: toNumber(raw.activeResources),
    outOfServiceResources: toNumber(raw.outOfServiceResources),
    resourcesByType: raw.resourcesByType && typeof raw.resourcesByType === 'object' ? raw.resourcesByType : {},
    resourcesByLocation: raw.resourcesByLocation && typeof raw.resourcesByLocation === 'object' ? raw.resourcesByLocation : {},
    addedThisMonth: toNumber(raw.addedThisMonth),
    activePercentage: toNumber(raw.activePercentage),
  };
}

function countBy(items, selector) {
  return items.reduce((accumulator, item) => {
    const key = selector(item);
    if (!key) return accumulator;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSlaState(ticket, nowTime) {
  const terminalStatuses = ['RESOLVED', 'CLOSED', 'REJECTED'];
  if (terminalStatuses.includes(ticket?.status)) return 'COMPLETED';

  if (!ticket?.slaDeadline) return 'UNTRACKED';
  const deadline = new Date(ticket.slaDeadline).getTime();
  if (!Number.isFinite(deadline)) return 'UNTRACKED';

  const remaining = deadline - nowTime;
  if (remaining < 0) return 'BREACHED';
  if (remaining <= 24 * 60 * 60 * 1000) return 'DUE_SOON';
  return 'ON_TRACK';
}

function DistributionRow({ label, value, total, color }) {
  const normalizedTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.round((value / normalizedTotal) * 100));

  return (
    <div className="analytics-distribution-row">
      <div className="analytics-distribution-head">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="analytics-distribution-track">
        <div className="analytics-distribution-fill" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [ticketRecords, setTicketRecords] = useState([]);
  const [bookingRecords, setBookingRecords] = useState([]);
  const [resourceAnalytics, setResourceAnalytics] = useState(DEFAULT_RESOURCE_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async ({ soft = false } = {}) => {
    if (soft) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [metricsResult, ticketsResult, bookingsResult, resourcesResult] = await Promise.allSettled([
        api.get('/admin/analytics'),
        getTickets({ page: 0, size: 400, sort: 'createdAt,desc' }),
        getBookings({ page: 0, size: 500 }),
        getResourceAnalytics(),
      ]);

      const unavailable = [];

      if (metricsResult.status === 'fulfilled') {
        setMetrics(normalizeMetricsPayload(metricsResult.value.data));
      } else {
        setMetrics(DEFAULT_METRICS);
        unavailable.push('system metrics');
      }

      if (ticketsResult.status === 'fulfilled') {
        setTicketRecords(extractCollection(ticketsResult.value));
      } else {
        setTicketRecords([]);
        unavailable.push('tickets feed');
      }

      if (bookingsResult.status === 'fulfilled') {
        setBookingRecords(extractCollection(bookingsResult.value));
      } else {
        setBookingRecords([]);
        unavailable.push('bookings feed');
      }

      if (resourcesResult.status === 'fulfilled') {
        setResourceAnalytics(normalizeResourceAnalyticsPayload(resourcesResult.value.data));
      } else {
        setResourceAnalytics(DEFAULT_RESOURCE_ANALYTICS);
        unavailable.push('resources feed');
      }

      if (unavailable.length) {
        setError(`Some data sources are temporarily unavailable: ${unavailable.join(', ')}.`);
      }
    } catch (fetchError) {
      setMetrics(DEFAULT_METRICS);
      setTicketRecords([]);
      setBookingRecords([]);
      setResourceAnalytics(DEFAULT_RESOURCE_ANALYTICS);
      setError('Unable to load analytics data at the moment.');
     } finally {
       if (soft) {
         setRefreshing(false);
       } else {
         setLoading(false);
       }
     }
   };

   useEffect(() => {
     fetchDashboardData();
   }, []);

   const ticketStatusCounts = useMemo(
     () => countBy(ticketRecords, (ticket) => ticket?.status || 'OPEN'),
     [ticketRecords]
   );

   const ticketPriorityCounts = useMemo(
     () => countBy(ticketRecords, (ticket) => ticket?.priority || 'UNSPECIFIED'),
     [ticketRecords]
   );

   const ticketCategoryCounts = useMemo(() => {
     return Object.entries(countBy(ticketRecords, (ticket) => ticket?.category || 'OTHER'))
       .map(([name, value]) => ({ name, value }))
       .sort((a, b) => b.value - a.value)
       .slice(0, 5);
   }, [ticketRecords]);

   const ticketSlaCounts = useMemo(() => {
     const nowTime = Date.now();
     return ticketRecords.reduce((accumulator, ticket) => {
       const state = getSlaState(ticket, nowTime);
       accumulator[state] = (accumulator[state] || 0) + 1;
       return accumulator;
     }, {
       ON_TRACK: 0,
       DUE_SOON: 0,
       BREACHED: 0,
       UNTRACKED: 0,
       COMPLETED: 0,
     });
   }, [ticketRecords]);

   const bookingStatusCounts = useMemo(
     () => countBy(bookingRecords, (booking) => booking?.status || 'UNKNOWN'),
     [bookingRecords]
   );

   const bookingTypeCounts = useMemo(
     () => countBy(bookingRecords, (booking) => booking?.resourceType || 'UNKNOWN'),
     [bookingRecords]
   );

   const bookingTimeline = useMemo(() => {
     const now = new Date();
     const today = getLocalDateKey(now);
     const weekLater = new Date(now);
     weekLater.setDate(weekLater.getDate() + 7);
     const weekLaterKey = getLocalDateKey(weekLater);

     let todayCount = 0;
     let nextSevenDays = 0;

     bookingRecords.forEach((booking) => {
       if (!booking?.date) return;
       if (booking.date === today) todayCount += 1;
       if (booking.date >= today && booking.date <= weekLaterKey) nextSevenDays += 1;
     });

     return { todayCount, nextSevenDays };
   }, [bookingRecords]);

   const resourceTypeBreakdown = useMemo(() => {
     return Object.entries(resourceAnalytics.resourcesByType || {})
       .map(([name, value]) => ({ name, value: toNumber(value) }))
       .sort((a, b) => b.value - a.value);
   }, [resourceAnalytics.resourcesByType]);

   const resourceLocationBreakdown = useMemo(() => {
     return Object.entries(resourceAnalytics.resourcesByLocation || {})
       .map(([name, value]) => ({ name, value: toNumber(value) }))
       .sort((a, b) => b.value - a.value)
       .slice(0, 6);
   }, [resourceAnalytics.resourcesByLocation]);

   const resourcePieData = useMemo(() => {
     return resourceTypeBreakdown.map(entry => {
       const meta = TYPE_META[entry.name] || { label: entry.name, color: 'var(--accent-base)' };
       return { name: meta.label, value: entry.value, color: meta.color };
     });
   }, [resourceTypeBreakdown]);

   const totalTickets = ticketRecords.length || metrics.totalTickets;
   const activeTickets = ticketRecords.length
     ? (ticketStatusCounts.OPEN || 0) + (ticketStatusCounts.IN_PROGRESS || 0)
     : metrics.openTickets;
   const resolvedTickets = ticketRecords.length
     ? (ticketStatusCounts.RESOLVED || 0) + (ticketStatusCounts.CLOSED || 0)
     : metrics.resolvedTickets;
   const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

   const totalBookings = bookingRecords.length || metrics.totalBookings;
   const approvedBookings = bookingStatusCounts.APPROVED || 0;
   const rejectedBookings = bookingStatusCounts.REJECTED || 0;
   const decisionCount = approvedBookings + rejectedBookings;
   const bookingApprovalRate = decisionCount > 0 ? Math.round((approvedBookings / decisionCount) * 100) : 0;

   const totalResources = resourceAnalytics.totalResources || metrics.totalResources;
   const operationalResources = resourceAnalytics.activeResources;
   const resourceHealth = totalResources > 0
     ? Math.round((operationalResources / totalResources) * 100)
     : Math.round(resourceAnalytics.activePercentage || 0);

   const summaryCards = [
     {
       label: 'Tickets In System',
       value: totalTickets,
       hint: `${activeTickets} active workload`,
       icon: <Ticket size={18} strokeWidth={2} />,
       tone: 'var(--accent-base)',
     },
     {
       label: 'Bookings In Scope',
       value: totalBookings,
       hint: `${bookingTimeline.nextSevenDays} in next 7 days`,
       icon: <CalendarCheck size={18} strokeWidth={2} />,
       tone: 'var(--info)',
     },
     {
       label: 'Resources Indexed',
       value: totalResources,
       hint: `${operationalResources} currently active`,
       icon: <Box size={18} strokeWidth={2} />,
       tone: 'var(--success)',
     },
     {
       label: 'Resolution Rate',
       value: `${resolutionRate}%`,
       hint: 'based on current ticket backlog',
       icon: <ShieldCheck size={18} strokeWidth={2} />,
       tone: 'var(--warning)',
     },
   ];

   const unassignedTickets = ticketRecords.filter((ticket) => !ticket?.assignedToId).length;
   const inProgressTickets = ticketStatusCounts.IN_PROGRESS || 0;
   const pendingBookings = bookingStatusCounts.PENDING || 0;
   const dominantResourceType = resourceTypeBreakdown[0]?.name || 'N/A';
   const dominantResourceLocation = resourceLocationBreakdown[0]?.name || 'N/A';

   const renderSummaryGrid = () => (
     <div className="analytics-grid-4 analytics-grid-4-main">
       {summaryCards.map((card) => (
         <div key={card.label} className="analytics-card analytics-card-kpi">
           <div className="analytics-kpi-label" style={{ color: card.tone }}>
             {card.icon}
             {card.label}
           </div>
           <div className="analytics-kpi-value">{card.value}</div>
           <div className="analytics-kpi-hint">{card.hint}</div>
         </div>
       ))}
     </div>
   );

   return (
     <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
       <style>{`
         .analytics-header {
           display: flex;
           justify-content: space-between;
           align-items: flex-end;
           flex-wrap: wrap;
           gap: 18px;
           margin-bottom: 26px;
         }

         .analytics-subtitle {
           display: inline-flex;
           align-items: center;
           gap: 8px;
           font-family: var(--font-mono);
           font-size: 0.74rem;
           letter-spacing: 0.14em;
           text-transform: uppercase;
           color: var(--accent-base);
           font-weight: 700;
           margin-bottom: 12px;
         }

         .analytics-title {
           font-family: var(--font-display);
           font-size: clamp(2rem, 4vw, 3.2rem);
           letter-spacing: -0.03em;
           line-height: 1.05;
           color: var(--text-main);
           margin: 0;
         }

         .analytics-caption {
           margin-top: 10px;
           color: var(--text-muted);
           font-family: var(--font-mono);
           font-size: 0.74rem;
           letter-spacing: 0.04em;
         }

         .analytics-tabs {
           display: flex;
           flex-wrap: wrap;
           gap: 10px;
           margin-bottom: 24px;
         }

         .analytics-tab {
           border: none;
           border-radius: 999px;
           padding: 10px 16px;
           background: var(--bg-surface);
           color: var(--text-muted);
           font-family: var(--font-mono);
           font-size: 0.72rem;
           letter-spacing: 0.08em;
           text-transform: uppercase;
           font-weight: 700;
           cursor: pointer;
           transition: all 0.25s ease;
         }

         .analytics-tab.active {
           background: var(--accent-base);
           color: #ffffff;
         }

         .analytics-grid-4 {
           display: grid;
           grid-template-columns: repeat(4, minmax(0, 1fr));
           gap: 16px;
           margin-bottom: 18px;
         }

         .analytics-grid-2 {
           display: grid;
           grid-template-columns: repeat(2, minmax(0, 1fr));
           gap: 16px;
         }

         .analytics-tab-frame {
           display: flex;
           flex-direction: column;
           gap: 16px;
         }

         .analytics-card {
           background: var(--bg-surface);
           border-radius: var(--radius-lg);
           padding: 24px;
           box-shadow: var(--ambient-shadow);
         }

         .analytics-grid-4-main .analytics-card {
           min-height: 170px;
         }

         .analytics-grid-2-main .analytics-card {
           min-height: 420px;
         }

         .analytics-card-wide {
           min-height: 250px;
         }

         .analytics-card-kpi {
           display: flex;
           flex-direction: column;
           gap: 12px;
         }

         .analytics-kpi-label {
           display: inline-flex;
           align-items: center;
           gap: 8px;
           color: var(--text-muted);
           font-family: var(--font-mono);
           font-size: 0.68rem;
           text-transform: uppercase;
           letter-spacing: 0.12em;
           font-weight: 700;
         }

         .analytics-kpi-value {
           font-size: clamp(2rem, 3.5vw, 2.9rem);
           line-height: 1;
           letter-spacing: -0.03em;
           color: var(--text-main);
           font-family: var(--font-display);
           font-weight: 800;
         }

         .analytics-kpi-hint {
           color: var(--text-muted);
           font-family: var(--font-mono);
           font-size: 0.7rem;
           letter-spacing: 0.04em;
         }

         .analytics-section-title {
           font-family: var(--font-display);
           font-size: 1.4rem;
           letter-spacing: -0.02em;
           color: var(--text-main);
           margin: 0 0 8px;
         }

         .analytics-section-subtitle {
           font-family: var(--font-mono);
           font-size: 0.7rem;
           text-transform: uppercase;
           letter-spacing: 0.12em;
           color: var(--text-muted);
           margin-bottom: 16px;
         }

         .analytics-distribution {
           display: flex;
           flex-direction: column;
           gap: 10px;
         }

         .analytics-distribution-row {
           display: flex;
           flex-direction: column;
           gap: 6px;
         }

         .analytics-distribution-head {
           display: flex;
           justify-content: space-between;
           align-items: center;
           font-family: var(--font-mono);
           font-size: 0.74rem;
           color: var(--text-main);
         }

         .analytics-distribution-track {
           width: 100%;
           height: 7px;
           background: var(--bg-surface-elevated);
           border-radius: 999px;
           overflow: hidden;
         }

         .analytics-distribution-fill {
           height: 100%;
           border-radius: inherit;
           transition: width 0.4s ease;
         }

         .analytics-list {
           display: flex;
           flex-direction: column;
           gap: 8px;
           margin: 0;
           padding: 0;
           list-style: none;
         }

         .analytics-list li {
           display: flex;
           justify-content: space-between;
           gap: 10px;
           color: var(--text-main);
           font-size: 0.85rem;
         }

         .analytics-list-label {
           color: var(--text-muted);
           font-family: var(--font-mono);
           font-size: 0.72rem;
           text-transform: uppercase;
           letter-spacing: 0.08em;
         }

         .analytics-actions {
           display: flex;
           flex-wrap: wrap;
           gap: 10px;
           margin-top: 16px;
         }

         .analytics-link {
           text-decoration: none;
           border-radius: 999px;
           padding: 10px 14px;
           font-family: var(--font-mono);
           font-size: 0.7rem;
           text-transform: uppercase;
           letter-spacing: 0.08em;
           font-weight: 700;
           transition: all 0.2s ease;
         }

         .analytics-link-primary {
           background: var(--accent-base);
           color: #ffffff;
         }

         .analytics-link-secondary {
           background: var(--bg-surface-elevated);
           color: var(--text-main);
         }

         .analytics-link:hover {
           transform: translateY(-1px);
         }

         .analytics-alert {
           margin-bottom: 16px;
           padding: 12px 16px;
           border-radius: var(--radius);
           background: var(--danger-muted);
           color: var(--danger);
           font-family: var(--font-mono);
           font-size: 0.75rem;
           display: inline-flex;
           gap: 8px;
           align-items: center;
         }

         @keyframes analyticsSpin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }

         @media (max-width: 1180px) {
           .analytics-grid-4 {
             grid-template-columns: repeat(2, minmax(0, 1fr));
           }
         }

         @media (max-width: 900px) {
           .analytics-grid-2 {
             grid-template-columns: 1fr;
           }

           .analytics-grid-2-main .analytics-card {
             min-height: auto;
           }
         }

         @media (max-width: 640px) {
           .analytics-grid-4 {
             grid-template-columns: 1fr;
           }

           .analytics-card {
             padding: 20px;
           }

           .analytics-grid-4-main .analytics-card,
           .analytics-card-wide {
             min-height: auto;
           }
         }
       `}</style>

       <div className="analytics-header">
         <div>
           <div className="analytics-subtitle">
             <Activity size={15} strokeWidth={2} /> Central Administration
           </div>
           <h1 className="analytics-title">
             Operations <span style={{ color: 'var(--text-muted)' }}>Analytics Hub</span>
           </h1>
           <p className="analytics-caption">
             Unified telemetry for tickets, bookings, and resources using current platform modules.
           </p>
         </div>

         <button className="btn-secondary" onClick={() => fetchDashboardData({ soft: true })} disabled={refreshing || loading}>
           <RefreshCw size={16} style={{ animation: refreshing ? 'analyticsSpin 1s linear infinite' : 'none' }} />
           {refreshing ? 'Syncing...' : 'Refresh'}
         </button>
       </div>

       {error && (
         <div className="analytics-alert">
           <AlertTriangle size={14} />
           {error}
         </div>
       )}

       <div className="analytics-tabs">
         {TABS.map((tab) => (
           <button
             key={tab.id}
             className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
             onClick={() => setActiveTab(tab.id)}
           >
             {tab.label}
           </button>
         ))}
       </div>

       {loading ? (
         <div style={{ minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div
             style={{
               width: '44px',
               height: '44px',
               borderRadius: '50%',
               border: '4px solid rgba(42, 20, 180, 0.12)',
               borderTopColor: 'var(--accent-base)',
               animation: 'analyticsSpin 1s linear infinite',
             }}
           />
         </div>
       ) : (
         <>
           {activeTab === 'OVERVIEW' && (
             <>
               <div className="analytics-grid-4">
                 {summaryCards.map((card) => (
                   <div key={card.label} className="analytics-card analytics-card-kpi">
                     <div className="analytics-kpi-label" style={{ color: card.tone }}>
                       {card.icon}
                       {card.label}
                     </div>
                     <div className="analytics-kpi-value">{card.value}</div>
                     <div className="analytics-kpi-hint">{card.hint}</div>
                   </div>
                 ))}
               </div>

               <div className="analytics-grid-2">
                 <div className="analytics-card">
                   <h2 className="analytics-section-title">Tickets Section</h2>
                   <div className="analytics-section-subtitle">Operational queue breakdown</div>
                   <div className="analytics-distribution">
                     {TICKET_STATUS_ORDER.map((status) => (
                       <DistributionRow
                         key={status}
                         label={formatEnum(status)}
                         value={ticketStatusCounts[status] || 0}
                         total={Math.max(totalTickets, 1)}
                         color={status === 'OPEN' || status === 'IN_PROGRESS' ? 'var(--warning)' : 'var(--success)'}
                       />
                     ))}
                   </div>
                   <div className="analytics-actions">
                     <Link className="analytics-link analytics-link-primary" to="/tickets/manage">Open Operations Log</Link>
                     <Link className="analytics-link analytics-link-secondary" to="/tickets/new">Create Ticket</Link>
                   </div>
                 </div>

                 <div className="analytics-card">
                   <h2 className="analytics-section-title">Bookings Section</h2>
                   <div className="analytics-section-subtitle">Reservation workflow status</div>
                   <div className="analytics-distribution">
                     {BOOKING_STATUS_ORDER.map((status) => (
                       <DistributionRow
                         key={status}
                         label={formatEnum(status)}
                         value={bookingStatusCounts[status] || 0}
                         total={Math.max(totalBookings, 1)}
                         color={status === 'APPROVED' ? 'var(--success)' : status === 'PENDING' ? 'var(--warning)' : 'var(--text-muted)'}
                       />
                     ))}
                   </div>
                   <div className="analytics-actions">
                     <Link className="analytics-link analytics-link-primary" to="/admin/bookings">Open Booking Review</Link>
                     <Link className="analytics-link analytics-link-secondary" to="/bookings/new">Create Booking</Link>
                   </div>
                 </div>
               </div>

               <div className="analytics-card" style={{ marginTop: '16px' }}>
                 <h2 className="analytics-section-title">Resources Bridge</h2>
                 <div className="analytics-section-subtitle">Mapped from this dashboard into dedicated analytics</div>
                 <div className="analytics-grid-2" style={{ gap: '12px' }}>
                   <div className="analytics-card" style={{ boxShadow: 'none', background: 'var(--bg-primary)', padding: '16px' }}>
                     <div className="analytics-list-label">Resource Health</div>
                     <div className="analytics-kpi-value" style={{ fontSize: '2.1rem', marginTop: '10px' }}>{resourceHealth}%</div>
                     <div className="analytics-kpi-hint">{operationalResources} active of {totalResources} resources</div>
                   </div>
                   <div className="analytics-card" style={{ boxShadow: 'none', background: 'var(--bg-primary)', padding: '16px' }}>
                     <div className="analytics-list-label">Monthly Growth</div>
                     <div className="analytics-kpi-value" style={{ fontSize: '2.1rem', marginTop: '10px' }}>+{resourceAnalytics.addedThisMonth}</div>
                     <div className="analytics-kpi-hint">Resources added in the current month</div>
                   </div>
                 </div>
                 <div className="analytics-actions" style={{ marginTop: '14px' }}>
                   <button className="analytics-link analytics-link-primary" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('RESOURCES')}>Open Resource Analytics</button>
                   <Link className="analytics-link analytics-link-secondary" to="/admin/resources">Manage Resources</Link>
                 </div>
               </div>
             </>
           )}

           {activeTab === 'TICKETS' && (() => {
             const statusChartData = TICKET_STATUS_ORDER.map((s) => ({
               name: formatEnum(s),
               value: ticketStatusCounts[s] || 0,
               fill: s === 'OPEN' ? '#f59e0b' : s === 'IN_PROGRESS' ? '#6366f1' : s === 'RESOLVED' ? '#22c55e' : s === 'CLOSED' ? '#64748b' : '#ef4444',
             }));

             const priorityPieData = [
               { name: 'Critical', value: ticketPriorityCounts.CRITICAL || 0, color: '#ef4444' },
               { name: 'High',     value: ticketPriorityCounts.HIGH || 0,     color: '#f59e0b' },
               { name: 'Medium',   value: ticketPriorityCounts.MEDIUM || 0,   color: '#6366f1' },
               { name: 'Low',      value: ticketPriorityCounts.LOW || 0,      color: '#22c55e' },
             ].filter((d) => d.value > 0);

             const categoryChartData = ticketCategoryCounts.map((e) => ({
               name: formatEnum(e.name),
               value: e.value,
             }));

             const slaStates = [
               { key: 'ON_TRACK',  label: 'On Track',  color: '#22c55e', icon: <CheckCircle size={14} /> },
               { key: 'DUE_SOON',  label: 'Due Soon',  color: '#f59e0b', icon: <Clock size={14} /> },
               { key: 'BREACHED',  label: 'Breached',  color: '#ef4444', icon: <AlertTriangle size={14} /> },
               { key: 'COMPLETED', label: 'Completed', color: '#64748b', icon: <CheckCircle size={14} /> },
               { key: 'UNTRACKED', label: 'Untracked', color: '#94a3b8', icon: <Clock size={14} /> },
             ];

             return (
               <div className="analytics-tab-frame">
                 {/* KPI hero row */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border-main)' }}>
                   {[
                     { label: 'Total Tickets',   value: totalTickets,                        color: 'var(--text-main)', icon: <Ticket size={16} /> },
                     { label: 'Active Workload', value: activeTickets,                       color: '#f59e0b',           icon: <Activity size={16} /> },
                     { label: 'Resolved',        value: resolvedTickets,                     color: '#22c55e',           icon: <CheckCircle size={16} /> },
                     { label: 'SLA Breached',    value: ticketSlaCounts.BREACHED || 0,       color: '#ef4444',           icon: <AlertTriangle size={16} /> },
                   ].map(({ label, value, color, icon }) => (
                     <div key={label} style={{ background: 'var(--bg-surface)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                         {icon} {label}
                       </div>
                       <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 4vw, 3.8rem)', fontWeight: 900, color, lineHeight: 1 }}>
                         {value}
                       </div>
                     </div>
                   ))}
                 </div>

                 {/* Status BarChart + Priority Donut */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1px', background: 'var(--border-main)' }}>
                   <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                     <SectionLabel>Workflow State</SectionLabel>
                     <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '28px' }}>
                       Status Distribution
                     </h2>
                     <div style={{ height: '280px', width: '100%' }}>
                       <ChartSectionBoundary fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Chart unavailable.</div>}>
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={statusChartData} margin={{ top: 16, right: 20, left: 0, bottom: 0 }} barSize={32}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} allowDecimals={false} />
                             <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ background: '#11141b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }} itemStyle={{ color: '#fff' }} />
                             <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                               {statusChartData.map((entry, idx) => (
                                 <Cell key={`sc-${idx}`} fill={entry.fill} />
                               ))}
                               <LabelList dataKey="value" position="top" style={{ fill: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }} />
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </ChartSectionBoundary>
                     </div>
                   </div>

                   <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                     <SectionLabel>Urgency Profile</SectionLabel>
                     <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                       Priority Breakdown
                     </h2>
                     <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) auto', gap: '20px', alignItems: 'center' }}>
                       <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                         <ChartSectionBoundary fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Chart unavailable.</div>}>
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie
                                 data={priorityPieData.length > 0 ? priorityPieData : [{ name: 'No data', value: 1, color: 'var(--border-main)' }]}
                                 cx="50%" cy="50%"
                                 innerRadius={60} outerRadius={90}
                                 paddingAngle={priorityPieData.length > 0 ? 4 : 0}
                                 dataKey="value" stroke="none"
                               >
                                 {(priorityPieData.length > 0 ? priorityPieData : [{ color: 'var(--border-main)' }]).map((entry, idx) => (
                                   <Cell key={`pc-${idx}`} fill={entry.color} />
                                 ))}
                               </Pie>
                               <Tooltip contentStyle={{ background: '#11141b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', padding: '10px 16px' }} itemStyle={{ color: '#fff' }} />
                             </PieChart>
                           </ResponsiveContainer>
                         </ChartSectionBoundary>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                         {[
                           { key: 'CRITICAL', label: 'Critical', color: '#ef4444' },
                           { key: 'HIGH',     label: 'High',     color: '#f59e0b' },
                           { key: 'MEDIUM',   label: 'Medium',   color: '#6366f1' },
                           { key: 'LOW',      label: 'Low',      color: '#22c55e' },
                         ].map(({ key, label, color }) => (
                           <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                               <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase' }}>{label}</span>
                             </div>
                             <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ticketPriorityCounts[key] || 0}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* SLA health panel */}
                 <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                   <SectionLabel>SLA Compliance</SectionLabel>
                   <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '24px' }}>
                     Service Level Agreement Status
                   </h2>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                     {slaStates.map(({ key, label, color, icon }) => {
                       const count = ticketSlaCounts[key] || 0;
                       const pct = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
                       return (
                         <div key={key} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: `3px solid ${color}` }}>
                           <div style={{ color, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                             {icon} {label}
                           </div>
                           <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-main)' }}>
                             {count}
                           </div>
                           <div style={{ height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                             <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)' }} />
                           </div>
                           <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                             {pct}% of total
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>

                 {/* Category BarChart + Operational Metrics */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1px', background: 'var(--border-main)' }}>
                   <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                     <SectionLabel>Issue Taxonomy</SectionLabel>
                     <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '28px' }}>
                       Top Issue Categories
                     </h2>
                     {categoryChartData.length === 0 ? (
                       <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No category data yet.</p>
                     ) : (
                       <div style={{ height: '260px', width: '100%' }}>
                         <ChartSectionBoundary fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Chart unavailable.</div>}>
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={categoryChartData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-main)" />
                               <XAxis type="number" hide allowDecimals={false} />
                               <YAxis type="category" dataKey="name" width={130} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                               <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ background: '#11141b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }} itemStyle={{ color: '#fff' }} />
                               <Bar dataKey="value" fill="var(--accent-base)" radius={[0, 4, 4, 0]} barSize={20}>
                                 <LabelList dataKey="value" position="right" style={{ fill: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }} />
                               </Bar>
                             </BarChart>
                           </ResponsiveContainer>
                         </ChartSectionBoundary>
                       </div>
                     )}
                   </div>

                   <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                     <SectionLabel>Quick Stats</SectionLabel>
                     <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '24px' }}>
                       Operational Metrics
                     </h2>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                       {[
                         { label: 'Resolution Rate',    value: `${resolutionRate}%`,                    color: resolutionRate >= 70 ? '#22c55e' : resolutionRate >= 40 ? '#f59e0b' : '#ef4444' },
                         { label: 'Unassigned Tickets', value: unassignedTickets,                       color: unassignedTickets > 0 ? '#f59e0b' : '#22c55e' },
                         { label: 'In Progress',        value: inProgressTickets,                       color: '#6366f1' },
                         { label: 'SLA Due Soon',       value: ticketSlaCounts.DUE_SOON || 0,           color: '#f59e0b' },
                         { label: 'Open Queue',         value: ticketStatusCounts.OPEN || 0,            color: 'var(--text-main)' },
                       ].map(({ label, value, color }) => (
                         <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px dashed var(--border-main)' }}>
                           <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                           <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
                         </div>
                       ))}
                     </div>
                     <div className="analytics-actions" style={{ marginTop: '20px' }}>
                       <Link className="analytics-link analytics-link-primary" to="/tickets/manage">Review Ticket Queue</Link>
                       <Link className="analytics-link analytics-link-secondary" to="/tickets">Open Ticket Center</Link>
                     </div>
                   </div>
                 </div>
               </div>
             );
           })()}

           {activeTab === 'BOOKINGS' && (
             <div className="analytics-grid-2">
               <div className="analytics-card">
                 <h2 className="analytics-section-title">Booking Pipeline</h2>
                 <div className="analytics-section-subtitle">Approval and scheduling flow</div>
                 <div className="analytics-distribution" style={{ marginBottom: '16px' }}>
                   {BOOKING_STATUS_ORDER.map((status) => (
                     <DistributionRow
                       key={status}
                       label={formatEnum(status)}
                       value={bookingStatusCounts[status] || 0}
                       total={Math.max(totalBookings, 1)}
                       color={status === 'APPROVED' ? 'var(--success)' : status === 'PENDING' ? 'var(--warning)' : 'var(--text-muted)'}
                     />
                   ))}
                 </div>

                 <ul className="analytics-list">
                   <li>
                     <span className="analytics-list-label">Approval rate</span>
                     <span style={{ color: 'var(--success)' }}>{bookingApprovalRate}%</span>
                   </li>
                   <li>
                     <span className="analytics-list-label">Bookings today</span>
                     <span>{bookingTimeline.todayCount}</span>
                   </li>
                   <li>
                     <span className="analytics-list-label">Next 7 days</span>
                     <span>{bookingTimeline.nextSevenDays}</span>
                   </li>
                 </ul>
               </div>

               <div className="analytics-card">
                 <h2 className="analytics-section-title">Resource Demand Mix</h2>
                 <div className="analytics-section-subtitle">Bookings by resource type</div>
                 <div className="analytics-distribution" style={{ marginBottom: '16px' }}>
                   {BOOKING_TYPE_ORDER.map((type) => (
                     <DistributionRow
                       key={type}
                       label={formatEnum(type)}
                       value={bookingTypeCounts[type] || 0}
                       total={Math.max(totalBookings, 1)}
                       color={type === 'LAB' ? 'var(--info)' : type === 'LECTURE_HALL' ? 'var(--accent-base)' : 'var(--warning)'}
                     />
                   ))}
                 </div>

                 <div className="analytics-actions">
                   <Link className="analytics-link analytics-link-primary" to="/admin/bookings">Open Booking Review</Link>
                   <Link className="analytics-link analytics-link-secondary" to="/bookings">Open Booking List</Link>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'RESOURCES' && (() => {
             const activeRate = Math.max(0, Math.min(resourceAnalytics.activePercentage || resourceHealth, 100));
             const rateColor = activeRate >= 70 ? 'var(--success)' : activeRate >= 40 ? 'var(--warning)' : 'var(--danger)';
             return (
               <div className="analytics-tab-frame">
                 {/* Stat Cards */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border-main)' }}>
                   {[
                     { label: 'Total Resources',  value: resourceAnalytics.totalResources,        icon: <Database size={16} />,      color: 'var(--text-main)' },
                     { label: 'Active',            value: resourceAnalytics.activeResources,       icon: <Activity size={16} />,      color: 'var(--success)' },
                     { label: 'Out of Service',    value: resourceAnalytics.outOfServiceResources, icon: <AlertTriangle size={16} />, color: 'var(--danger)' },
                     { label: 'Added This Month',  value: resourceAnalytics.addedThisMonth,        icon: <CalendarPlus size={16} />,  color: 'var(--info)' },
                   ].map(({ label, value, icon, color }) => (
                     <div key={label} style={{ background: 'var(--bg-surface)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                         {icon} {label}
                       </div>
                       <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 4vw, 3.8rem)', fontWeight: 900, color, lineHeight: 1 }}>
                         {value}
                       </div>
                     </div>
                   ))}
                 </div>

                 {/* Charts Row */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1px', background: 'var(--border-main)' }}>
                   {/* Location BarChart */}
                   <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                     <SectionLabel>Spatial Analytics</SectionLabel>
                     <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '28px' }}>
                       Location Utilization
                     </h2>
                     {resourceLocationBreakdown.length === 0 ? (
                       <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No location data yet.</p>
                     ) : (
                       <div style={{ height: '300px', width: '100%', marginTop: '24px' }}>
                         <ChartSectionBoundary fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Chart unavailable for this browser session.</div>}>
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={resourceLocationBreakdown.map(e => ({ name: e.name, count: e.value }))} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-main)" />
                               <XAxis type="number" hide />
                               <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                               <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ background: '#11141b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }} itemStyle={{ color: '#fff' }} />
                               <Bar dataKey="count" fill="var(--info)" radius={[0, 4, 4, 0]} barSize={20} />
                             </BarChart>
                           </ResponsiveContainer>
                         </ChartSectionBoundary>
                       </div>
                     )}
                   </div>

                   {/* Type PieChart + legend + active rate */}
                   <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
                     <SectionLabel>Class Telemetry</SectionLabel>
                     <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                       Systems Overview
                     </h2>
                     <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(180px, auto)', gap: '20px', alignItems: 'center' }}>
                       <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                         <ChartSectionBoundary fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Chart unavailable for this browser session.</div>}>
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie data={resourcePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                                 {resourcePieData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                               </Pie>
                               <Tooltip contentStyle={{ background: '#11141b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', padding: '10px 16px' }} itemStyle={{ color: '#fff' }} />
                             </PieChart>
                           </ResponsiveContainer>
                         </ChartSectionBoundary>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                         {resourcePieData.map(entry => (
                           <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
                               <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase' }}>{entry.name}</span>
                             </div>
                             <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entry.value}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border-main)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                         <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                           Infrastructure Health Status
                         </span>
                         <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: rateColor }}>
                           {activeRate.toFixed(1)}% Operational
                         </span>
                       </div>
                       <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
                         <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${activeRate}%`, background: rateColor, transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)', borderRadius: '10px' }} />
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="analytics-actions">
                   <Link className="analytics-link analytics-link-secondary" to="/admin/resources">Manage Resource Inventory</Link>
                 </div>
               </div>
             );
           })()}
         </>
       )}

       {!loading && (
         <div className="analytics-grid-4" style={{ marginTop: '16px' }}>
           <div className="analytics-card" style={{ padding: '16px' }}>
             <div className="analytics-kpi-label" style={{ color: 'var(--danger)' }}>
               <AlertTriangle size={14} />
               Breached SLA
             </div>
             <div className="analytics-kpi-value" style={{ fontSize: '1.9rem' }}>{ticketSlaCounts.BREACHED || 0}</div>
           </div>

           <div className="analytics-card" style={{ padding: '16px' }}>
             <div className="analytics-kpi-label" style={{ color: 'var(--warning)' }}>
               <Clock size={14} />
               Pending Bookings
             </div>
             <div className="analytics-kpi-value" style={{ fontSize: '1.9rem' }}>{bookingStatusCounts.PENDING || 0}</div>
           </div>

           <div className="analytics-card" style={{ padding: '16px' }}>
             <div className="analytics-kpi-label" style={{ color: 'var(--success)' }}>
               <CheckCircle size={14} />
               Approved Bookings
             </div>
             <div className="analytics-kpi-value" style={{ fontSize: '1.9rem' }}>{approvedBookings}</div>
           </div>

           <div className="analytics-card" style={{ padding: '16px' }}>
             <div className="analytics-kpi-label" style={{ color: 'var(--accent-base)' }}>
               <TrendingUp size={14} />
               Resource Health
             </div>
             <div className="analytics-kpi-value" style={{ fontSize: '1.9rem' }}>{resourceHealth}%</div>
           </div>
         </div>
       )}
     </div>
   );
 }
