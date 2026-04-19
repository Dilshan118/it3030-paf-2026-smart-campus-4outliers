import React, { useState, useEffect } from 'react';
import { getResourceAnalytics } from '../../api/resourceApi';
import { Activity, AlertTriangle, Database, CalendarPlus, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const TYPE_META = {
  LAB:           { label: 'Laboratory',     color: 'var(--accent-base)' },
  LECTURE_HALL:  { label: 'Lecture Hall',   color: '#38A169' },
  MEETING_ROOM:  { label: 'Meeting Room',   color: '#805AD5' },
  EQUIPMENT:     { label: 'Equipment',      color: '#D69E2E' },
};

const STAT_CARDS = (d) => [
  { label: 'Total Resources',   value: d.totalResources,       icon: <Database size={16} />,     color: 'var(--text-main)' },
  { label: 'Active',            value: d.activeResources,      icon: <Activity size={16} />,     color: 'var(--success)' },
  { label: 'Out of Service',    value: d.outOfServiceResources,icon: <AlertTriangle size={16} />,color: 'var(--danger)' },
  { label: 'Added This Month',  value: d.addedThisMonth,       icon: <CalendarPlus size={16} />, color: 'var(--info)' },
];

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)',
      display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
    }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--border-main)' }} />
    </div>
  );
}

function CssBar({ value, max, color, height = 6 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height, background: 'var(--bg-surface-elevated)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: '0 auto 0 0',
        width: `${pct}%`,
        background: color,
        transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

export default function ResourceAnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getResourceAnalytics()
      .then(res => { setData(res.data); setRefreshedAt(new Date()); })
      .catch(() => setError('Failed to fetch analytics from server.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* ── Loading ── */
  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.12em' }}>
        // loading analytics...
      </span>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="page-container">
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontSize: '0.9rem', padding: '32px', border: '1px solid var(--danger)', background: 'rgba(255,51,0,0.05)' }}>
        <strong>ERR:</strong> {error}
        <button onClick={load} style={{ marginLeft: '24px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--danger)', background: 'transparent', border: '1px solid var(--danger)', padding: '4px 12px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    </div>
  );

  const {
    totalResources, activeResources, outOfServiceResources,
    resourcesByType, resourcesByLocation, addedThisMonth, activePercentage,
  } = data;

  const typeEntries = Object.entries(resourcesByType  || {}).sort((a, b) => b[1] - a[1]);
  const locEntries  = Object.entries(resourcesByLocation || {}).sort((a, b) => b[1] - a[1]);
  const maxType = Math.max(...typeEntries.map(([, v]) => v), 1);
  const maxLoc  = Math.max(...locEntries.map(([, v]) => v),  1);

  // Prepare chart data
  const pieData = typeEntries.map(([type, count]) => {
    const meta = TYPE_META[type] || { label: type, color: 'var(--accent-base)' };
    return { name: meta.label, value: count, color: meta.color };
  });

  const barData = locEntries.map(([loc, count]) => ({
    name: loc,
    count,
  }));

  const activeRate = Math.min(activePercentage, 100);
  const rateColor  = activeRate >= 70 ? 'var(--success)' : activeRate >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page-container">

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>
            Module A — Facilities &amp; Assets
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
            Resource <span style={{ color: 'var(--text-muted)' }}>Analytics</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '14px', letterSpacing: '0.06em' }}>
            // live infrastructure health · {refreshedAt ? refreshedAt.toLocaleTimeString() : '—'}
          </p>
        </div>
        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          background: 'transparent', border: '1px solid var(--border-main)',
          color: 'var(--text-muted)', padding: '10px 18px', cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-base)'; e.currentTarget.style.color = 'var(--accent-base)'; }}
          onMouseOut={e =>  { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border-main)', marginBottom: '1px' }}>
        {STAT_CARDS(data).map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background: 'var(--bg-surface)', padding: '28px 24px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
              {icon} {label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 4vw, 3.8rem)', fontWeight: 900, color, lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

        {/* Middle Row: Type chart + Operational status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1px', background: 'var(--border-main)', marginBottom: '1px' }}>

        {/* Spatial Analytics (Recharts BarChart) */}
        <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
          <SectionLabel>Spatial Analytics</SectionLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '28px' }}>
            Location Utilization
          </h2>
          {locEntries.length === 0 ? (
             <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No location data yet.</p>
          ) : (
            <div style={{ height: '300px', width: '100%', marginTop: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-main)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.03)'}}
                    contentStyle={{ background: '#11141b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }} 
                    itemStyle={{color: '#fff'}}
                  />
                  <Bar dataKey="count" fill="var(--info)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Operational Status & Architecture (Pie) */}
        <div style={{ background: 'var(--bg-surface)', padding: '32px' }}>
          <SectionLabel>Class Telemetry</SectionLabel>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px' }}>
             Systems Overview
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(180px, auto)', gap: '20px', alignItems: 'center' }}>
              {/* Architecture Pie Chart */}
              <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                          contentStyle={{ background: '#11141b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', padding: '10px 16px' }} 
                          itemStyle={{color: '#fff'}}
                      />
                    </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Type legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pieData.map(entry => (
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

          {/* Active-rate bar */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border-main)'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Infrastructure Health Status
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: rateColor }}>
                {activePercentage.toFixed(1)}% Operational
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
              <div style={{
                position: 'absolute', inset: '0 auto 0 0',
                width: `${activeRate}%`,
                background: rateColor,
                transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
                borderRadius: '10px'
              }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
