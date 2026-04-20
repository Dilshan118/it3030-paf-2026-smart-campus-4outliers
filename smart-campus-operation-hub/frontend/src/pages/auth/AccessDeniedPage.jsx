import { useNavigate } from 'react-router-dom';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚫</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', color: 'var(--on-surface-variant)' }}>
          Access Denied
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', opacity: 0.7, marginBottom: '24px' }}>
          You don't have permission to view this page.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
