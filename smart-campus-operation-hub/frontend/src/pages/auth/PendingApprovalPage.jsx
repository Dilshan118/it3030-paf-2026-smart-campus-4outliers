import { useContext } from 'react';
import { Clock, LogOut, Building2, Mail } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function PendingApprovalPage() {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '20px',
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', color: '#d97706'
        }}>
          <Clock size={36} strokeWidth={1.5} />
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
          Awaiting Approval
        </div>

        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1, margin: '0 0 16px 0' }}>
          Account Under<br /><span style={{ color: 'var(--text-muted)' }}>Review</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px' }}>
          Your account has been registered and is pending administrator approval.
          You'll be able to access the platform once an admin reviews and approves your request.
        </p>

        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: 'var(--ambient-shadow)',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(42, 20, 180, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-base)', flexShrink: 0 }}>
                <Building2 size={16} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Admin Approval Required</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  A campus administrator will review your account and assign you the appropriate role.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(42, 20, 180, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-base)', flexShrink: 0 }}>
                <Mail size={16} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Contact IT Support</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  If you need urgent access, reach out to your campus IT department.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px', border: 'none',
            background: 'var(--bg-surface)', color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: 'var(--ambient-shadow)'
          }}
        >
          <LogOut size={16} strokeWidth={2} />
          Sign out and try another account
        </button>
      </div>
    </div>
  );
}
