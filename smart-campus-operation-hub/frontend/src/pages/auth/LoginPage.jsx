import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Info, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = error === 'access_denied'
    ? 'Your access request was declined. Please contact a campus administrator.'
    : error === 'server_error'
    ? 'A server error occurred during sign-in. Please check the backend logs and try again.'
    : error
    ? 'Sign-in failed. Please try again.'
    : null;

  const handleGoogleLogin = () => {
    const from = location.state?.from?.pathname || '/';
    localStorage.setItem('auth_redirect', from);

    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';
    window.location.href = `${base}/oauth2/authorization/google`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', flexWrap: 'wrap' }}>
      <style>{`
        .login-left {
          flex: 1;
          min-width: 400px;
          background: var(--accent-gradient);
          padding: 4rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          position: relative;
        }
        .login-right {
          flex: 1.2;
          min-width: 360px;
          padding: 4rem clamp(2rem, 8vw, 8rem);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        @media (max-width: 900px) {
          .login-left { display: none; }
        }
        .google-btn {
          width: 100%;
          padding: 16px 20px;
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--bg-surface-elevated);
          color: var(--text-main);
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .google-btn:hover {
          background: #e0e3e5; /* active hover state */
        }
      `}</style>
      
      {/* Left Panel: The Indigo Monolith */}
      <div className="login-left">
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            width: '64px', height: '64px',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <Building2 size={32} color="white" strokeWidth={1.5} />
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'white',
            marginBottom: '1.5rem',
            maxWidth: '90%'
          }}>
            Smart Campus<br/>Central Hub.
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '85%',
            marginBottom: '4rem'
          }}>
            Book campus facilities, request IT support, and discover university resources all in one unified platform.
          </p>

          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase', 
                color: 'rgba(255,255,255,0.6)', 
                fontWeight: 600, 
                marginBottom: '0.5rem' 
              }}>
                Students & Staff
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Instant Access</div>
            </div>
            <div>
              <div style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase', 
                color: 'rgba(255,255,255,0.6)', 
                fontWeight: 600, 
                marginBottom: '0.5rem' 
              }}>
                Campus Tickets
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Quick Resolutions</div>
            </div>
          </div>
        </div>

        <div style={{ 
          fontSize: '1.25rem', 
          fontWeight: 800, 
          letterSpacing: '-0.01em', 
          color: 'rgba(255,255,255,0.2)',
          marginTop: '4rem'
        }}>
          SMART CAMPUS HUB
        </div>
      </div>

      {/* Right Panel: The Soft Workspace */}
      <div className="login-right">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '16px'
            }}>
              Welcome to<br/>SLIIT Campus Hub
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.5, maxWidth: '90%' }}>
              Sign in with your university account to explore resources, book spaces, and get help.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: 'var(--ambient-shadow)'
          }}>
            {errorMessage && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
                background: 'var(--danger-muted)', color: 'var(--danger)'
              }}>
                <AlertTriangle size={18} strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }}>{errorMessage}</p>
              </div>
            )}
            <button onClick={handleGoogleLogin} className="google-btn">
              <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            {/* Label over lines. Enforcing the Forbid Rule. */}
            <div style={{
              margin: '40px 0',
              textAlign: 'center',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              Students & Faculty
            </div>

            {/* Ghost outline info box using background tonal shift */}
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '24px',
              borderRadius: '12px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '24px', height: '24px',
                borderRadius: '50%', background: 'var(--accent-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Info size={14} color="white" strokeWidth={2.5} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
                Sign in with your SLIIT student or staff email. Your account will automatically be created 
                and securely connected to your campus profile.
              </p>
            </div>
          </div>
        </div>

        {/* Footer row carved into the bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontWeight: 700,
          letterSpacing: '0.05em',
          marginTop: '4rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span style={{ cursor: 'pointer', opacity: 0.8 }}>HELP CENTER</span>
            <span style={{ cursor: 'pointer', opacity: 0.8 }}>IT SUPPORT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
