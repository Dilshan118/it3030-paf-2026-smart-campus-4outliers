import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTicketById, updateTicketStatus, deleteTicket } from '../../api/ticketApi';
import SlaTimer from '../../components/tickets/SlaTimer';
import CommentThread from '../../components/tickets/CommentThread';
import ImageUpload from '../../components/tickets/ImageUpload';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    
    let resolutionNotes = '';
    let rejectionReason = '';

    if (newStatus === 'RESOLVED') {
      resolutionNotes = prompt('Enter resolution notes:');
      if (resolutionNotes === null) return;
    }
    if (newStatus === 'REJECTED') {
      rejectionReason = prompt('Enter rejection reason:');
      if (rejectionReason === null) return;
    }

    try {
      setStatusLoading(true);
      await updateTicketStatus(id, newStatus, resolutionNotes, rejectionReason);
      await fetchTicket();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicket(id);
      navigate('/tickets');
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading ticket...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'left' }}>
      <Link to="/tickets" style={{ textDecoration: 'none', color: 'var(--accent)', marginBottom: '20px', display: 'inline-block' }}>← Back to Tickets</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Ticket #{ticket.id} - {ticket.category}</h2>
        <SlaTimer deadline={ticket.slaDeadline} status={ticket.status} />
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        borderRadius: '8px', 
        backgroundColor: 'var(--code-bg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <strong>Status:</strong> {ticket.status}
          </div>
          <div>
            <strong>Priority:</strong> {ticket.priority}
          </div>
          <div>
            <strong>Created By:</strong> {ticket.userName}
          </div>
          <div>
            <strong>Assigned To:</strong> {ticket.assignedToName || 'Unassigned'}
          </div>
          <div>
            <strong>Resource:</strong> {ticket.resourceName || 'None'}
          </div>
          <div>
            <strong>Contact Info:</strong> {ticket.contactInfo}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Description:</strong>
          <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
        </div>

        {ticket.resolutionNotes && (
          <div style={{ backgroundColor: '#e2f5e9', padding: '12px', borderRadius: '4px', marginBottom: '16px', color: '#006633' }}>
            <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
          </div>
        )}
        {ticket.rejectionReason && (
          <div style={{ backgroundColor: '#fce8e8', padding: '12px', borderRadius: '4px', marginBottom: '16px', color: '#990000' }}>
            <strong>Rejection Reason:</strong> {ticket.rejectionReason}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #ccc', paddingTop: '16px' }}>
          {ticket.status === 'OPEN' && (
            <>
              <button disabled={statusLoading} onClick={() => handleStatusChange('IN_PROGRESS')} style={{ padding: '8px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Start Progress</button>
              <button disabled={statusLoading} onClick={() => handleStatusChange('REJECTED')} style={{ padding: '8px', backgroundColor: 'darkred', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
              <button disabled={statusLoading} onClick={handleDelete} style={{ padding: '8px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete Ticket</button>
            </>
          )}
          {ticket.status === 'IN_PROGRESS' && (
            <button disabled={statusLoading} onClick={() => handleStatusChange('RESOLVED')} style={{ padding: '8px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Resolve</button>
          )}
          {ticket.status === 'RESOLVED' && (
            <button disabled={statusLoading} onClick={() => handleStatusChange('CLOSED')} style={{ padding: '8px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close Ticket</button>
          )}
        </div>
      </div>

      <ImageUpload ticketId={ticket.id} attachments={ticket.attachments} onUploadSuccess={fetchTicket} />
      
      <CommentThread ticketId={ticket.id} initialComments={ticket.comments} onCommentAdded={fetchTicket} />

    </div>
  );
}
