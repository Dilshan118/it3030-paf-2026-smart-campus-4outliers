import React, { useContext, useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Users, Search, RefreshCw, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

export default function UserManagePage() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('active');

  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [approveRoles, setApproveRoles] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchPending();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/users');
      setUsers(res.data.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/users/pending');
      setPendingUsers(res.data.data.content || []);
    } catch {
      // silently fail for pending; error shown in active tab
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchPending();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError('');
      await api.patch(`/admin/users/${userId}/role`, null, { params: { role: newRole } });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return;
    if (Number(targetUser.id) === Number(user?.id)) {
      setError('You cannot deactivate your own account.');
      return;
    }
    if (!window.confirm(`Deactivate ${targetUser.name || 'this user'}? They will lose platform access immediately.`)) return;
    try {
      setError('');
      setDeletingUserId(targetUser.id);
      await api.delete(`/admin/users/${targetUser.id}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleApprove = async (targetUser) => {
    const role = approveRoles[targetUser.id] || 'USER';
    try {
      setApprovingId(targetUser.id);
      setError('');
      await api.patch(`/admin/users/${targetUser.id}/approve`, null, { params: { role } });
      await Promise.all([fetchUsers(), fetchPending()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (targetUser) => {
    if (!window.confirm(`Reject ${targetUser.name || 'this user'}? They will not be able to access the platform.`)) return;
    try {
      setRejectingId(targetUser.id);
      setError('');
      await api.patch(`/admin/users/${targetUser.id}/reject`);
      await fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject user');
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem); font-family: var(--font-display); font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); line-height: 1.1;
        }
        .data-row {
          display: grid; grid-template-columns: minmax(180px, 2fr) minmax(220px, 2fr) 140px minmax(240px, 2.2fr);
          gap: 16px; padding: 24px; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.03);
          transition: background 0.2s;
        }
        .data-row:hover { background: rgba(42, 20, 180, 0.02); }
        .data-row:last-child { border-bottom: none; }
        .pending-row {
          display: grid; grid-template-columns: minmax(180px, 2fr) minmax(220px, 2fr) minmax(200px, 1.5fr) minmax(200px, 1.5fr);
          gap: 16px; padding: 24px; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.03);
          transition: background 0.2s;
        }
        .pending-row:hover { background: rgba(245, 158, 11, 0.02); }
        .pending-row:last-child { border-bottom: none; }
        .um-tab {
          padding: 10px 20px; border-radius: 8px; border: none; font-family: var(--font-mono);
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
          cursor: pointer; transition: all 0.15s;
        }
        .um-tab-active { background: var(--accent-base); color: white; }
        .um-tab-inactive { background: var(--bg-surface); color: var(--text-muted); }
        .um-tab-inactive:hover { background: var(--bg-surface-elevated); color: var(--text-main); }
      `}</style>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px', marginBottom: '48px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Central Administration
          </div>
          <h1 className="page-title">
            User <span style={{ color: 'var(--text-muted)' }}>Authority</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search directory..."
              style={{
                width: '260px', padding: '12px 16px 12px 42px',
                background: 'var(--bg-surface)', border: 'none', borderRadius: '12px',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-main)',
                boxShadow: 'var(--ambient-shadow)', outline: 'none'
              }}
            />
          </div>
          <button onClick={handleRefresh} className="btn-secondary" title="Refresh">
            <RefreshCw size={18} /> Sync
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`um-tab ${tab === 'active' ? 'um-tab-active' : 'um-tab-inactive'}`}
          onClick={() => setTab('active')}
        >
          <Users size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Active Users
        </button>
        <button
          className={`um-tab ${tab === 'pending' ? 'um-tab-active' : 'um-tab-inactive'}`}
          onClick={() => setTab('pending')}
          style={{ position: 'relative' }}
        >
          <Clock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Pending Approval
          {pendingUsers.length > 0 && (
            <span style={{
              marginLeft: '8px', background: '#d97706', color: 'white',
              borderRadius: '999px', padding: '2px 7px', fontSize: '0.7rem', fontWeight: 800
            }}>
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>SYS_ERR:</strong> {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {tab === 'active' && (
          loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : users.length === 0 ? (
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px' }}>
              <Users size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Directory Empty</h3>
              <p style={{ color: 'var(--text-muted)' }}>No active users found.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(220px, 2fr) 140px minmax(240px, 2.2fr)', gap: '16px', padding: '16px 24px', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <div>User Designation</div>
                <div>System Identity</div>
                <div>Status</div>
                <div>Authority & Actions</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {users.map(u => {
                  const isCurrentUser = Number(u.id) === Number(user?.id);
                  const isInactive = !Boolean(u.isActive);
                  const isDeleting = deletingUserId === u.id;
                  return (
                    <div key={u.id} className="data-row" style={{ opacity: isInactive ? 0.65 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid var(--accent-base)', color: 'var(--accent-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
                          {(u.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{u.name}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                      <div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '6px 12px',
                          borderRadius: '999px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                          fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                          background: isInactive ? 'var(--danger-muted)' : 'rgba(16, 185, 129, 0.14)',
                          color: isInactive ? 'var(--danger)' : '#047857',
                        }}>
                          {isInactive ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <select
                            value={u.role || 'USER'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isInactive || isDeleting}
                            style={{
                              flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)',
                              background: 'var(--bg-primary)', fontFamily: 'var(--font-mono)',
                              fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', outline: 'none', cursor: 'pointer',
                              textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}
                          >
                            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isInactive || isDeleting || isCurrentUser}
                            title={isCurrentUser ? 'You cannot deactivate your own account' : 'Deactivate user'}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              border: 'none', borderRadius: '8px', padding: '10px 12px',
                              fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                              cursor: isInactive || isDeleting || isCurrentUser ? 'not-allowed' : 'pointer',
                              background: isInactive || isDeleting || isCurrentUser ? 'var(--bg-primary)' : 'var(--danger-muted)',
                              color: isInactive || isDeleting || isCurrentUser ? 'var(--text-muted)' : 'var(--danger)'
                            }}
                          >
                            <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                        {isCurrentUser && (
                          <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            Current signed-in admin
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {tab === 'pending' && (
          pendingUsers.length === 0 ? (
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px' }}>
              <Clock size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No Pending Requests</h3>
              <p style={{ color: 'var(--text-muted)' }}>All accounts have been reviewed.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(220px, 2fr) minmax(200px, 1.5fr) minmax(200px, 1.5fr)', gap: '16px', padding: '16px 24px', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <div>User</div>
                <div>Email</div>
                <div>Assign Role</div>
                <div>Actions</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pendingUsers.map(u => {
                  const isApproving = approvingId === u.id;
                  const isRejecting = rejectingId === u.id;
                  return (
                    <div key={u.id} className="pending-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                          {(u.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{u.name}</p>
                          <p style={{ margin: '2px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#d97706' }}>PENDING</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                      <div>
                        <select
                          value={approveRoles[u.id] || 'USER'}
                          onChange={(e) => setApproveRoles(prev => ({ ...prev, [u.id]: e.target.value }))}
                          disabled={isApproving || isRejecting}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)',
                            background: 'var(--bg-primary)', fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', outline: 'none', cursor: 'pointer',
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}
                        >
                          {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(u)}
                          disabled={isApproving || isRejecting}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            border: 'none', borderRadius: '8px', padding: '10px 14px',
                            fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                            cursor: isApproving || isRejecting ? 'not-allowed' : 'pointer',
                            background: 'rgba(16, 185, 129, 0.12)', color: '#047857',
                            opacity: isApproving || isRejecting ? 0.6 : 1
                          }}
                        >
                          <CheckCircle size={14} /> {isApproving ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(u)}
                          disabled={isApproving || isRejecting}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            border: 'none', borderRadius: '8px', padding: '10px 14px',
                            fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                            cursor: isApproving || isRejecting ? 'not-allowed' : 'pointer',
                            background: 'var(--danger-muted)', color: 'var(--danger)',
                            opacity: isApproving || isRejecting ? 0.6 : 1
                          }}
                        >
                          <XCircle size={14} /> {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
