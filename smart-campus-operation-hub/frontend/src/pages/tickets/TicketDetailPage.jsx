import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, AlertCircle, Clock, FileWarning } from 'lucide-react';
import CommentThread from '../../components/tickets/CommentThread';
import SlaTimer from '../../components/tickets/SlaTimer';

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const resp = await axios.get(`http://localhost:8080/api/tickets/${id}`);
      setTicket(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/status?status=${newStatus}`);
      fetchTicket();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="page-container" style={{ display: 'grid', placeItems: 'center' }}>Loading precise details...</div>;
  if (!ticket) return <div className="page-container"><FileWarning className="icon" /> Ticket not found</div>;

  return (
    <div className="page-container">
      <Link to="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: '500' }}>
        <ArrowLeft size={16} /> Back to Library
      </Link>

      <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Info Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 className="h1">{ticket.title}</h1>
                <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px', fontSize: '15px' }}>
                  #{ticket.id} • Created by User {ticket.creatorId}
                </p>
              </div>
              <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                {ticket.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px', padding: '16px', backgroundColor: 'var(--surface-container-low)', borderRadius: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '4px', fontWeight: '600' }}>Category</p>
                <p style={{ fontWeight: '500' }}>{ticket.category}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '4px', fontWeight: '600' }}>Priority</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {ticket.priority === 'CRITICAL' && <AlertCircle size={14} color="#dc2626" />}
                  <span style={{ fontWeight: '500' }}>{ticket.priority}</span>
                </div>
              </div>
              {ticket.resourceId && (
                <div>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '4px', fontWeight: '600' }}>Resource ID</p>
                  <p style={{ fontWeight: '500' }}>{ticket.resourceId}</p>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '16px', fontWeight: '600' }}>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--on-surface)' }}>{ticket.description}</p>
            </div>
          </div>

          {/* Comments Section */}
          <CommentThread ticketId={id} />
          
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
             <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '20px', fontWeight: '600' }}>SLA Tracking</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                   <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>Resolution Deadline</p>
                   {ticket.slaDeadline ? <SlaTimer deadline={ticket.slaDeadline} status={ticket.status} /> : <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Not Set</span>}
                </div>
             </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '20px', fontWeight: '600' }}>Actions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ticket.status === 'OPEN' && (
                <button className="btn-primary" onClick={() => handleUpdateStatus('IN_PROGRESS')} style={{ width: '100%', justifyContent: 'center' }}>
                 Mark In Progress
                </button>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <button className="btn-primary" onClick={() => handleUpdateStatus('RESOLVED')} style={{ width: '100%', justifyContent: 'center' }}>
                  Resolve Ticket
                </button>
              )}
              {ticket.status !== 'CLOSED' && (
                <button className="btn-outline" onClick={() => handleUpdateStatus('CLOSED')} style={{ width: '100%', justifyContent: 'center' }}>
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
