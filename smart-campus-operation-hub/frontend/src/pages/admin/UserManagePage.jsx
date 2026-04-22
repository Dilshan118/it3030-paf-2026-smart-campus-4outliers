import React, { useContext, useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Users, Search, RefreshCw, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function UserManagePage() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);

  const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/users');
      setUsers(res.data.data.content || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
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

    if (!window.confirm(`Deactivate ${targetUser.name || 'this user'}? They will lose platform access immediately.`)) {
      return;
    }

    try {
      setError('');
      setDeletingUserId(targetUser.id);
      await api.delete(`/admin/users/${targetUser.id}`);
      await fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || '';
      if (message.includes('No static resource') || message.includes('Endpoint not found')) {
        setError('Delete endpoint is not available in the running backend. Restart/redeploy backend and try again.');
      } else {
        setError(message || 'Failed to delete user');
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-header {
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px;
        }
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
      `}</style>

      <div className="page-header">
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
          <button onClick={fetchUsers} className="btn-secondary" title="Refresh Directory">
            <RefreshCw size={18} /> Sync
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>SYS_ERR:</strong> {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
               <Users size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Directory Empty</h3>
            <p style={{ color: 'var(--text-muted)' }}>No user authorization records found.</p>
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
                const isInactive = !u.isActive;
                const isDeleting = deletingUserId === u.id;

                return (
                <div key={u.id} className="data-row" style={{ opacity: isInactive ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid var(--accent-base)', color: 'var(--accent-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
                      {(u.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                      {u.name}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {u.email}
                  </div>

                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        background: isInactive ? 'var(--danger-muted)' : 'rgba(16, 185, 129, 0.14)',
                        color: isInactive ? 'var(--danger)' : '#047857',
                      }}
                    >
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
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={isInactive || isDeleting || isCurrentUser}
                        title={isCurrentUser ? 'You cannot deactivate your own account' : 'Deactivate user'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
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
              )})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
