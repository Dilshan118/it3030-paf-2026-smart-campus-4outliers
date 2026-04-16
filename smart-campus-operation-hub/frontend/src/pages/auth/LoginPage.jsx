import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMockLogin = () => {
    // TEMPORARY: Mock login for development/testing
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN'
    };
    login('mock-token', mockUser);
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
    }}>
      <div style={{ maxWidth: '380px', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--on-surface-variant)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Smart Campus Hub
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', opacity: 0.7 }}>
            Sign in to access the operations system
          </p>
        </div>

        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <button
            onClick={handleMockLogin}
            className="btn-primary"
            style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem' }}
          >
            Mock Login (Development)
          </button>
          <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--on-surface-variant)', opacity: 0.5 }}>
            This is a temporary login for testing.
          </p>
        </div>
      </div>
    </div>
  );
}
