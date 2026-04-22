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
  CheckCircle,
  Clock,
  RefreshCw,
  ShieldCheck,
  Ticket,
  TrendingUp,
} from 'lucide-react';

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
                   <Link className="analytics-link analytics-link-primary" to="/admin/resources/analytics">Open Resource Analytics Dashboard</Link>
                   <Link className="analytics-link analytics-link-secondary" to="/admin/resources">Manage Resources</Link>
                 </div>
               </div>
             </>
           )}

           {activeTab === 'TICKETS' && (
             <div className="analytics-grid-2">
               <div className="analytics-card">
                 <h2 className="analytics-section-title">Ticket Throughput</h2>
                 <div className="analytics-section-subtitle">Status and SLA alignment</div>
                 <div className="analytics-distribution" style={{ marginBottom: '16px' }}>
                   {TICKET_STATUS_ORDER.map((status) => (
                     <DistributionRow
                       key={status}
                       label={formatEnum(status)}
                       value={ticketStatusCounts[status] || 0}
                       total={Math.max(totalTickets, 1)}
                       color={status === 'RESOLVED' || status === 'CLOSED' ? 'var(--success)' : 'var(--accent-base)'}
                     />
                   ))}
                 </div>

                 <div className="analytics-section-subtitle">SLA state (active and historical)</div>
                 <div className="analytics-distribution">
                   {['ON_TRACK', 'DUE_SOON', 'BREACHED', 'UNTRACKED', 'COMPLETED'].map((state) => (
                     <DistributionRow
                       key={state}
                       label={formatEnum(state)}
                       value={ticketSlaCounts[state] || 0}
                       total={Math.max(totalTickets, 1)}
                       color={
                         state === 'BREACHED'
                           ? 'var(--danger)'
                           : state === 'DUE_SOON'
                             ? 'var(--warning)'
                             : state === 'ON_TRACK'
                               ? 'var(--success)'
                               : 'var(--text-muted)'
                       }
                     />
                   ))}
                 </div>
               </div>

               <div className="analytics-card">
                 <h2 className="analytics-section-title">Ticket Quality Signals</h2>
                 <div className="analytics-section-subtitle">Priority load and top categories</div>

                 <div className="analytics-distribution" style={{ marginBottom: '16px' }}>
                   {TICKET_PRIORITY_ORDER.map((priority) => (
                     <DistributionRow
                       key={priority}
                       label={formatEnum(priority)}
                       value={ticketPriorityCounts[priority] || 0}
                       total={Math.max(totalTickets, 1)}
                       color={priority === 'CRITICAL' ? 'var(--danger)' : priority === 'HIGH' ? 'var(--warning)' : 'var(--accent-base)'}
                     />
                   ))}
                 </div>

                 <div className="analytics-section-subtitle">Top issue categories</div>
                 <ul className="analytics-list">
                   {ticketCategoryCounts.length === 0 && (
                     <li>
                       <span className="analytics-list-label">No category data</span>
                       <span>0</span>
                     </li>
                   )}
                   {ticketCategoryCounts.map((entry) => (
                     <li key={entry.name}>
                       <span className="analytics-list-label">{formatEnum(entry.name)}</span>
                       <span>{entry.value}</span>
                     </li>
                   ))}
                 </ul>

                 <div className="analytics-actions">
                   <Link className="analytics-link analytics-link-primary" to="/tickets/manage">Review Ticket Queue</Link>
                   <Link className="analytics-link analytics-link-secondary" to="/tickets">Open Ticket Center</Link>
                 </div>
               </div>
             </div>
           )}

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

           {activeTab === 'RESOURCES' && (
             <div className="analytics-grid-2">
               <div className="analytics-card">
                 <h2 className="analytics-section-title">Resource Operations</h2>
                 <div className="analytics-section-subtitle">Current fleet and serviceability</div>
                 <ul className="analytics-list" style={{ marginBottom: '16px' }}>
                   <li>
                     <span className="analytics-list-label">Total resources</span>
                     <span>{totalResources}</span>
                   </li>
                   <li>
                     <span className="analytics-list-label">Active resources</span>
                     <span style={{ color: 'var(--success)' }}>{operationalResources}</span>
                   </li>
                   <li>
                     <span className="analytics-list-label">Out of service</span>
                     <span style={{ color: 'var(--danger)' }}>{resourceAnalytics.outOfServiceResources}</span>
                   </li>
                   <li>
                     <span className="analytics-list-label">Added this month</span>
                     <span>{resourceAnalytics.addedThisMonth}</span>
                   </li>
                 </ul>

                 <DistributionRow
                   label="Operational health"
                   value={resourceHealth}
                   total={100}
                   color={resourceHealth >= 70 ? 'var(--success)' : resourceHealth >= 40 ? 'var(--warning)' : 'var(--danger)'}
                 />

                 <div className="analytics-actions">
                   <Link className="analytics-link analytics-link-primary" to="/admin/resources/analytics">Open Full Resource Analytics</Link>
                   <Link className="analytics-link analytics-link-secondary" to="/admin/resources">Manage Resource Inventory</Link>
                 </div>
               </div>

               <div className="analytics-card">
                 <h2 className="analytics-section-title">Resource Breakdown</h2>
                 <div className="analytics-section-subtitle">Top types and locations</div>

                 <div style={{ marginBottom: '16px' }}>
                   <div className="analytics-list-label" style={{ marginBottom: '8px' }}>By type</div>
                   <div className="analytics-distribution">
                     {resourceTypeBreakdown.length === 0 && (
                       <DistributionRow label="No data" value={0} total={1} color="var(--text-muted)" />
                     )}
                     {resourceTypeBreakdown.map((entry) => (
                       <DistributionRow
                         key={entry.name}
                         label={formatEnum(entry.name)}
                         value={entry.value}
                         total={Math.max(totalResources, 1)}
                         color="var(--accent-base)"
                       />
                     ))}
                   </div>
                 </div>

                 <div>
                   <div className="analytics-list-label" style={{ marginBottom: '8px' }}>Top locations</div>
                   <ul className="analytics-list">
                     {resourceLocationBreakdown.length === 0 && (
                       <li>
                         <span className="analytics-list-label">No location data</span>
                         <span>0</span>
                       </li>
                     )}
                     {resourceLocationBreakdown.map((entry) => (
                       <li key={entry.name}>
                         <span className="analytics-list-label">{entry.name}</span>
                         <span>{entry.value}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             </div>
           )}
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
