import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Since we're stubbing API calls for this module
const API_URL = 'http://localhost:8080/api/v1/admin/users';

export default function UserManagePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcode roles
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
    <div className="page-container">
      <h1 className="h1" style={{ marginBottom: '24px' }}>User Role Management</h1>

      <div className="card" style={{ padding: '8px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px 0', opacity: 0.5 }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', opacity: 0.5 }}>No users found.</p>
        ) : (
          <div className="no-border-list">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '8px 16px', borderBottom: 'var(--border-thick)' }}>
              <div className="label-text">Name</div>
              <div className="label-text">Email</div>
              <div className="label-text">Role</div>
            </div>

            {users.map(u => (
              <div key={u.id} className="data-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px', alignItems: 'center', borderBottom: '1px solid var(--border-main)' }}>
                <div style={{ fontWeight: '600', color: 'var(--accent-base)' }}>{u.name}</div>
                <div style={{ color: 'var(--text-main)' }}>{u.email}</div>
                <div>
                   <select 
                     value={u.role || 'USER'} 
                     onChange={(e) => handleRoleChange(u.id, e.target.value)}
                     className="input-field"
                     style={{ padding: '6px 12px', fontSize: '12px', width: 'auto', margin: 0 }}
                   >
                     {ROLES.map(role => (
                       <option key={role} value={role}>{role}</option>
                     ))}
                   </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
