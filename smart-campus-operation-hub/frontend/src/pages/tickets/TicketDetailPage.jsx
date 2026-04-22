import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  FileWarning,
  Edit2,
  Trash2,
  CalendarDays,
  Clock3,
  UserRound,
  Wrench,
  Hash,
  CircleDot,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import CommentThread from '../../components/tickets/CommentThread';
import SlaTimer from '../../components/tickets/SlaTimer';
import ImageUpload from '../../components/tickets/ImageUpload';
import TicketForm from '../../components/tickets/TicketForm';
import { getTicketById, updateTicketStatus, updateTicket, deleteTicket, reopenTicket } from '../../api/ticketApi';
import { AuthContext } from '../../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketError, setTicketError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const canManage = isAdmin || user?.role === 'MANAGER';
  const isAssignedTech = user?.role === 'TECHNICIAN' && ticket?.assignedToId === user?.id;
  const isOwner = user?.id === ticket?.userId;
  const hasAssignedTechnician = Boolean(ticket?.assignedToId);

  const canMoveToInProgress = canManage && ticket?.status === 'OPEN' && hasAssignedTechnician;
  const canReject = canManage && ticket?.status === 'OPEN';
  const canResolve = (canManage || isAssignedTech) && ticket?.status === 'IN_PROGRESS' && hasAssignedTechnician;
  const canClose = canManage && ticket?.status === 'RESOLVED';
  const canReopen = (isOwner || canManage) && (ticket?.status === 'RESOLVED' || ticket?.status === 'CLOSED');
  const showSidebar = isOwner || canManage || isAssignedTech || canReopen || Boolean(ticket?.slaDeadline);

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

    const needsAssignee = newStatus === 'IN_PROGRESS' || newStatus === 'RESOLVED';
    if (needsAssignee && !ticket?.assignedToId) {
      setActionError(`Assign a technician before moving to ${newStatus}.`);
      return;
    }

    if (newStatus === 'RESOLVED') {
      resolutionNotes = window.prompt('Add resolution notes (required):', '') || '';
      if (resolutionNotes.trim().length < 10) {
        setActionError('Resolution notes must be at least 10 characters before resolving this ticket.');
        return;
      }
    }

    if (newStatus === 'REJECTED') {
      rejectionReason = window.prompt('Add rejection reason (required):', '') || '';
      if (rejectionReason.trim().length < 10) {
        setActionError('A rejection reason (minimum 10 characters) is required before rejecting this ticket.');
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

  const handleReopen = async () => {
    const reason = window.prompt('Why should this ticket be reopened? (minimum 10 characters)', '') || '';
    if (reason.trim().length < 10) {
      setActionError('Please provide at least 10 characters for the reopen reason.');
      return;
    }

    try {
      setActionError('');
      await reopenTicket(id, reason.trim());
      fetchTicket();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reopen ticket');
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

  const formatEnum = (value) => {
    if (!value) return 'Not Set';
    return value
      .toString()
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDateTime = (value) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleString();
  };

  const getLifecycleStages = (status) => {
    if (status === 'REJECTED') return [];
    const ordered = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentIndex = ordered.indexOf(status);

    return ordered.map((stage, index) => {
      if (currentIndex === -1) {
        return { stage, state: 'pending' };
      }
      if (index < currentIndex) {
        return { stage, state: 'done' };
      }
      if (index === currentIndex) {
        return { stage, state: 'current' };
      }
      return { stage, state: 'pending' };
    });
  };

  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <div className="card" style={{ width: 'min(520px, 100%)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (ticketError) {
    return (
      <div className="page-container">
        <div className="card" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
          Error: {ticketError}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <div className="card" style={{ width: 'min(520px, 100%)', textAlign: 'center' }}>
          <FileWarning size={24} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Ticket not found.</p>
        </div>
      </div>
    );
  }

  const lifecycleStages = getLifecycleStages(ticket.status);

  return (
    <div className="page-container ticket-detail-page">
      <style>{`
        .ticket-detail-page .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 20px;
          transition: color 0.25s ease, transform 0.25s ease;
        }

        .ticket-detail-page .back-link:hover {
          color: var(--text-main);
          transform: translateX(-2px);
        }

        .ticket-detail-page .ticket-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 26px;
          background: linear-gradient(140deg, #ffffff 0%, #f8faff 100%);
        }

        .ticket-detail-page .ticket-hero::after {
          content: '';
          position: absolute;
          right: -90px;
          top: -90px;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(42, 20, 180, 0.12) 0%, rgba(42, 20, 180, 0) 72%);
          pointer-events: none;
        }

        .ticket-detail-page .hero-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }

        .ticket-detail-page .hero-kicker {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.72rem;
          color: var(--accent-base);
          font-weight: 700;
          margin-bottom: 10px;
        }

        .ticket-detail-page .hero-title {
          margin: 0;
          font-size: clamp(1.6rem, 2.8vw, 2.3rem);
          letter-spacing: -0.02em;
          color: var(--text-main);
          line-height: 1.15;
        }

        .ticket-detail-page .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 14px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.76rem;
        }

        .ticket-detail-page .hero-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ticket-detail-page .hero-status {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }

        .ticket-detail-page .ticket-shell {
          display: grid;
          gap: 24px;
          grid-template-columns: minmax(0, 1.9fr) minmax(300px, 1fr);
          align-items: start;
        }

        .ticket-detail-page .ticket-main,
        .ticket-detail-page .ticket-side {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ticket-detail-page .section-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 16px;
          font-size: 1.12rem;
          color: var(--text-main);
        }

        .ticket-detail-page .issue-text {
          white-space: pre-wrap;
          line-height: 1.7;
          margin: 0;
          color: var(--text-main);
          background: var(--bg-primary);
          border-radius: var(--radius);
          padding: 18px;
          font-size: 0.95rem;
        }

        .ticket-detail-page .detail-facts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
        }

        .ticket-detail-page .fact-item {
          background: var(--bg-surface-elevated);
          border-radius: var(--radius);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ticket-detail-page .fact-label {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ticket-detail-page .fact-value {
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.45;
        }

        .ticket-detail-page .note-box {
          margin-top: 14px;
          border-radius: var(--radius);
          padding: 14px 16px;
          font-size: 0.9rem;
          line-height: 1.55;
        }

        .ticket-detail-page .horizontal-lifecycle {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid var(--bg-surface-elevated);
          position: relative;
        }

        .ticket-detail-page .horizontal-lifecycle::before {
          content: '';
          position: absolute;
          top: 48px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: var(--bg-surface-elevated);
          z-index: 1;
        }

        .ticket-detail-page .hz-node {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: transparent;
        }

        .ticket-detail-page .hz-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-surface-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.4s ease;
          border: 4px solid #ffffff; /* Cutout effect */
        }
        
        .ticket-detail-page .hz-node.done .hz-icon {
          background: var(--success);
          color: white;
        }
        
        .ticket-detail-page .hz-node.current .hz-icon {
          background: #ffffff;
          border-color: var(--accent-base);
          border-width: 2px;
          box-shadow: 0 0 0 4px var(--accent-muted);
        }
        
        .ticket-detail-page .hz-node.current .hz-icon::after {
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-base);
        }
        
        .ticket-detail-page .hz-node.rejected .hz-icon {
          background: var(--danger);
          color: white;
        }

        .ticket-detail-page .hz-text {
          font-size: 0.8rem;
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .ticket-detail-page .hz-node.done .hz-text { color: var(--text-main); }
        .ticket-detail-page .hz-node.current .hz-text { color: var(--accent-base); font-weight: 700; }
        .ticket-detail-page .hz-node.rejected .hz-text { color: var(--danger); }

        @media (max-width: 1100px) {
          .ticket-detail-page .ticket-shell {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .ticket-detail-page .horizontal-lifecycle::before {
            display: none;
          }
          .ticket-detail-page .horizontal-lifecycle {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
          }
          .ticket-detail-page .hz-node {
            flex-direction: row;
          }
          .ticket-detail-page .hero-head {
            flex-direction: column;
          }

          .ticket-detail-page .hero-status {
            justify-content: flex-start;
          }

          .ticket-detail-page .detail-facts {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>

      <Link to="/tickets" className="back-link">
        <ArrowLeft size={16} /> Back to Tickets
      </Link>

      <div className="ticket-hero card">
        <div className="hero-head">
          <div>
            <p className="hero-kicker">Service Incident</p>
            <h1 className="hero-title">{ticket.title || `${formatEnum(ticket.category)} Request`}</h1>
            <div className="hero-meta">
              <span className="hero-meta-item"><Hash size={12} /> #{ticket.id}</span>
              <span className="hero-meta-item"><UserRound size={12} /> {ticket.userName || `User ${ticket.userId}`}</span>
              <span className="hero-meta-item"><CalendarDays size={12} /> {formatDateTime(ticket.createdAt)}</span>
            </div>
          </div>

          <div className="hero-status">
            <span className={`status-badge status-${ticket.status.toLowerCase()}`}>{formatEnum(ticket.status)}</span>
            <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
              {ticket.priority === 'CRITICAL' ? <AlertCircle size={13} /> : <CircleDot size={13} />}
              {formatEnum(ticket.priority)}
            </span>
          </div>
        </div>

        {/* Horizontal Lifecycle */}
        <div className="horizontal-lifecycle">
          {ticket.status === 'REJECTED' ? (
            <>
              <div className="hz-node done">
                <div className="hz-icon"><CheckCircle2 size={16} /></div>
                <span className="hz-text">Opened</span>
              </div>
              <div className="hz-node rejected">
                <div className="hz-icon"><XCircle size={16} /></div>
                <span className="hz-text">Rejected</span>
              </div>
            </>
          ) : (
            lifecycleStages.map((stage) => (
              <div key={stage.stage} className={`hz-node ${stage.state}`}>
                <div className="hz-icon" title={formatEnum(stage.stage)}>
                  {stage.state === 'done' && <CheckCircle2 size={16} strokeWidth={3} />}
                </div>
                <span className="hz-text">{formatEnum(stage.stage)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className="ticket-shell"
        style={{
          gridTemplateColumns: showSidebar ? 'minmax(0, 1.9fr) minmax(300px, 1fr)' : 'minmax(0, 1fr)',
        }}
      >
        <div className="ticket-main">
          {isEditing ? (
            <div className="card">
              <h2 className="section-title"><Edit2 size={18} /> Edit Ticket</h2>
              <TicketForm initialData={ticket} onSubmit={handleEditSubmit} onCancel={() => setIsEditing(false)} />
            </div>
          ) : (
            <>
              <div className="card">
                <h2 className="section-title"><AlertCircle size={18} /> Issue Summary</h2>
                <p className="issue-text">{ticket.description}</p>

                {ticket.resolutionNotes && (
                  <div className="note-box" style={{ background: 'var(--success-muted)', color: '#065f46' }}>
                    <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
                  </div>
                )}

                {ticket.rejectionReason && (
                  <div className="note-box" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                    <strong>Rejection Reason:</strong> {ticket.rejectionReason}
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="section-title"><Wrench size={18} /> Ticket Details</h2>
                <div className="detail-facts">
                  <div className="fact-item">
                    <span className="fact-label"><CalendarDays size={12} /> Created</span>
                    <span className="fact-value">{formatDateTime(ticket.createdAt)}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><Clock3 size={12} /> Last Updated</span>
                    <span className="fact-value">{formatDateTime(ticket.updatedAt)}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><CircleDot size={12} /> Category</span>
                    <span className="fact-value">{formatEnum(ticket.category)}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><AlertCircle size={12} /> Priority</span>
                    <span className="fact-value">{formatEnum(ticket.priority)}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><UserRound size={12} /> Reporter</span>
                    <span className="fact-value">{ticket.userName || `User ${ticket.userId}`}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><Wrench size={12} /> Assigned Technician</span>
                    <span className="fact-value">{ticket.assignedToName || 'Unassigned'}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><Hash size={12} /> Resource</span>
                    <span className="fact-value">
                      {ticket.resourceName || (ticket.resourceId ? `#${ticket.resourceId}` : 'Not linked')}
                    </span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label"><UserRound size={12} /> Contact</span>
                    <span className="fact-value">{ticket.contactInfo || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {showSidebar && (
          <aside className="ticket-side">
            {actionError && (
              <div className="card" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>Workflow Error:</strong> {` ${actionError}`}
              </div>
            )}

            {isOwner && ticket.status === 'OPEN' && !isEditing && (
              <div className="card">
                <h3 className="label-text" style={{ marginBottom: '14px' }}>Your Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ width: '100%', justifyContent: 'center' }}>
                    <Edit2 size={16} /> Edit Details
                  </button>
                  <button className="btn-secondary" onClick={handleDelete} style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', background: 'var(--danger-muted)' }}>
                    <Trash2 size={16} /> Withdraw Ticket
                  </button>
                </div>
              </div>
            )}

            {canManage && (
              <div className="card">
                <h3 className="label-text" style={{ marginBottom: '12px' }}>SLA Tracking</h3>
                <p className="fact-label" style={{ marginBottom: '8px' }}>Resolution Deadline</p>
                {ticket.slaDeadline ? (
                  <SlaTimer deadline={ticket.slaDeadline} status={ticket.status} />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Not set</span>
                )}
              </div>
            )}

            {(canManage || isAssignedTech || canReopen) && (
              <div className="card">
                <h3 className="label-text" style={{ marginBottom: '14px' }}>Workflow Actions</h3>

                {ticket.status === 'OPEN' && !hasAssignedTechnician && canManage && (
                  <div style={{ marginBottom: '12px', padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--bg-primary)', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    Assign a technician from Manage Tickets before moving this request forward.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {canMoveToInProgress && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus('IN_PROGRESS')} style={{ width: '100%', justifyContent: 'center' }}>
                      Mark In Progress
                    </button>
                  )}
                  {canReject && (
                     <button className="btn-secondary" onClick={() => handleUpdateStatus('REJECTED')} style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', background: 'var(--danger-muted)' }}>
                      Reject Request
                    </button>
                  )}
                  {canResolve && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus('RESOLVED')} style={{ width: '100%', justifyContent: 'center' }}>
                      Complete Resolution
                    </button>
                  )}
                  {canClose && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus('CLOSED')} style={{ width: '100%', justifyContent: 'center' }}>
                      Close Ticket File
                    </button>
                  )}
                  {canReopen && (
                     <button className="btn-secondary" onClick={handleReopen} style={{ width: '100%', justifyContent: 'center' }}>
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <CommentThread ticketId={id} initialComments={ticket.comments || []} onCommentAdded={fetchTicket} />
        <ImageUpload ticketId={id} attachments={ticket.attachments || []} onUploadSuccess={fetchTicket} />
      </div>
    </div>
  );
}
