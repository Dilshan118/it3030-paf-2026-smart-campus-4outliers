import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1/admin/users';

export default function UserManagePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setUsers(res.data.data.content || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`${API_URL}/${userId}/role?role=${newRole}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
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
          display: grid; grid-template-columns: minmax(200px, 2fr) minmax(200px, 2fr) 200px;
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) minmax(200px, 2fr) 200px', gap: '16px', padding: '16px 24px', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div>User Designation</div>
              <div>System Identity</div>
              <div>Authority Scope</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {users.map(u => (
                <div key={u.id} className="data-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid var(--accent-base)', color: 'var(--accent-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                      {u.name}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {u.email}
                  </div>
                  
                  <div>
                    <select 
                      value={u.role || 'USER'} 
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ 
                        width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)',
                        background: 'var(--bg-primary)', fontFamily: 'var(--font-mono)', 
                        fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', outline: 'none', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
