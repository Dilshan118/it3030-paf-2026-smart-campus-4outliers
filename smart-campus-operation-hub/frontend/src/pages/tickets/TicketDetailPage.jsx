import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, FileWarning, Edit2, Trash2 } from 'lucide-react';
import CommentThread from '../../components/tickets/CommentThread';
import SlaTimer from '../../components/tickets/SlaTimer';
import ImageUpload from '../../components/tickets/ImageUpload';
import TicketForm from '../../components/tickets/TicketForm';
import { getTicketById, updateTicketStatus, updateTicket, deleteTicket } from '../../api/ticketApi';
import { AuthContext } from '../../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketError, setTicketError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setTicketError('');
      const resp = await getTicketById(id);
      setTicket(resp.data);
    } catch (err) {
      setTicketError(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleUpdateStatus = async (newStatus) => {
    let resolutionNotes = '';
    let rejectionReason = '';

    if (newStatus === 'RESOLVED') {
      resolutionNotes = window.prompt('Add resolution notes (required):', '') || '';
      if (!resolutionNotes.trim()) {
        setActionError('Resolution notes are required before resolving this ticket.');
        return;
      }
    }

    if (newStatus === 'REJECTED') {
      rejectionReason = window.prompt('Add rejection reason (required):', '') || '';
      if (!rejectionReason.trim()) {
        setActionError('A rejection reason is required before rejecting this ticket.');
        return;
      }
    }

    try {
      setActionError('');
      await updateTicketStatus(id, newStatus, resolutionNotes, rejectionReason);
      fetchTicket();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      setActionError('');
      await updateTicket(id, data);
      setIsEditing(false);
      fetchTicket();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        await deleteTicket(id);
        navigate('/tickets');
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to delete ticket');
      }
    }
  };

  if (loading) return <div className="page-container" style={{ display: 'grid', placeItems: 'center' }}>Loading...</div>;
  if (ticketError) return <div className="card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Error: {ticketError}</div>;
  if (!ticket) return <div className="page-container"><FileWarning className="icon" /> Ticket not found</div>;

  return (
    <div className="page-container">
      <Link to="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '600' }}>
        <ArrowLeft size={16} /> Back to Tickets
      </Link>

      <div style={{
        display: 'grid',
        gap: '32px',
        gridTemplateColumns: isAdmin ? 'minmax(0, 2.5fr) minmax(300px, 1fr)' : 'minmax(0, 800px)',
        justifyContent: isAdmin ? 'stretch' : 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {isEditing ? (
            <div className="card">
              <h2 className="h2" style={{ marginBottom: '24px', fontSize: '2rem' }}>Edit Incident</h2>
              <TicketForm initialData={ticket} onSubmit={handleEditSubmit} onCancel={() => setIsEditing(false)} />
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h1 className="h1" style={{ marginBottom: 0, fontSize: '2rem' }}>{ticket.title || `Incident #${ticket.id} (${ticket.category.replace('_', ' ')})`}</h1>
                  <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                    #{ticket.id} • Created by {ticket.userName || `User ${ticket.userId}`}
                  </p>
                </div>
                <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px', padding: '24px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius)' }}>
                <div>
                  <p className="label-text">Category</p>
                  <p style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{ticket.category}</p>
                </div>
                <div>
                  <p className="label-text">Priority</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {ticket.priority === 'CRITICAL' && <AlertCircle size={14} color="var(--danger)" />}
                    <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: ticket.priority === 'CRITICAL' ? 'var(--danger)' : 'inherit' }}>{ticket.priority}</span>
                  </div>
                </div>
                {ticket.resourceId && (
                  <div>
                    <p className="label-text">Resource ID</p>
                    <p style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{ticket.resourceId}</p>
                  </div>
                )}
              </div>

              <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                <h3 className="label-text" style={{ marginBottom: '16px' }}>Description Details</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>{ticket.description}</p>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentThread ticketId={id} initialComments={ticket.comments || []} onCommentAdded={fetchTicket} />

          <ImageUpload ticketId={id} attachments={ticket.attachments || []} onUploadSuccess={fetchTicket} />
          
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {ticket.status === 'OPEN' && !isEditing && (
            <div className="card">
              <h3 className="label-text" style={{ marginBottom: '20px' }}>Your Actions</h3>
              
              {actionError && !isAdmin && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {actionError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ width: '100%', justifyContent: 'center' }}>
                  <Edit2 size={16} /> Edit Details
                </button>
                <button className="btn-secondary" onClick={handleDelete} style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', background: 'var(--danger-muted)' }}>
                  <Trash2 size={16} /> Withdraw Ticket
                </button>
              </div>
            </div>
          )}

          {isAdmin && (
            <>
              <div className="card">
                 <h3 className="label-text" style={{ marginBottom: '20px' }}>SLA Tracking</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                       <p className="label-text">Resolution Deadline</p>
                       {ticket.slaDeadline ? <SlaTimer deadline={ticket.slaDeadline} status={ticket.status} /> : <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Not Set</span>}
                    </div>
                 </div>
              </div>

              <div className="card">
                <h3 className="label-text" style={{ marginBottom: '20px' }}>Administration Setup</h3>

                {actionError && (
                  <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {actionError}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ticket.status === 'OPEN' && (
                    <button className="btn-secondary" onClick={() => handleUpdateStatus('IN_PROGRESS')} style={{ width: '100%', justifyContent: 'center' }}>
                     Mark In Progress
                    </button>
                  )}
                  {ticket.status === 'OPEN' && (
                    <button className="btn-secondary" onClick={() => handleUpdateStatus('REJECTED')} style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', background: 'var(--danger-muted)' }}>
                      Reject Request
                    </button>
                  )}
                  {ticket.status === 'IN_PROGRESS' && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus('RESOLVED')} style={{ width: '100%', justifyContent: 'center' }}>
                      Complete Resolution
                    </button>
                  )}
                  {ticket.status === 'RESOLVED' && (
                    <button className="btn-secondary" onClick={() => handleUpdateStatus('CLOSED')} style={{ width: '100%', justifyContent: 'center' }}>
                      Close Ticket File
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
