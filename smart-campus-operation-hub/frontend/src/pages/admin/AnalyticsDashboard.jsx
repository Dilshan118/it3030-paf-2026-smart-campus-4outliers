import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Ticket, Users, CalendarCheck } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1/admin/analytics';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    totalResources: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data && res.data.data) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container"><p style={{ textAlign: 'center', opacity: 0.5 }}>Loading analytics...</p></div>;
  }

  return (
    <div className="page-container">
      <h1 className="h1" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={28} strokeWidth={2} /> System Analytics
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        
        {/* Ticket Stats */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Ticket size={20} />
            <span style={{ fontWeight: 600 }}>Total Tickets</span>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-base)' }}>{metrics.totalTickets}</span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--danger)' }}>{metrics.openTickets}</strong> Open</span>
            <span><strong style={{ color: 'var(--success)' }}>{metrics.resolvedTickets}</strong> Resolved</span>
          </div>
        </div>

        {/* Resources */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Users size={20} />
            <span style={{ fontWeight: 600 }}>Total Resources</span>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-base)' }}>{metrics.totalResources}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered in catalog</span>
        </div>

        {/* Bookings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <CalendarCheck size={20} />
            <span style={{ fontWeight: 600 }}>Total Bookings</span>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-base)' }}>{metrics.totalBookings}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All time requests</span>
        </div>

      </div>
    </div>
  );
}
