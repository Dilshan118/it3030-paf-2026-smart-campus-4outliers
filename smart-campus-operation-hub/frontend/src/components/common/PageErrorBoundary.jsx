import React from 'react';

export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      componentStack: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Page rendering failed:', error, errorInfo);
    this.setState({ componentStack: errorInfo?.componentStack || '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '720px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--danger)',
            padding: '28px',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--ambient-shadow)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--danger)', marginBottom: '10px' }}>
              This page failed to render
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
              A runtime error occurred while loading this view. Refresh and try again.
            </p>
            {this.state.error?.message && (
              <pre
                style={{
                  marginBottom: '18px',
                  padding: '12px',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: 1.45,
                }}
              >
{`Error: ${this.state.error.message}`}
              </pre>
            )}
            {this.state.componentStack && (
              <details style={{ marginBottom: '18px' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  Component stack
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    borderRadius: '8px',
                    overflowX: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    lineHeight: 1.4,
                  }}
                >
                  {this.state.componentStack}
                </pre>
              </details>
            )}
            <button
              className="btn-secondary"
              onClick={() => window.location.reload()}
              style={{ border: '1px solid var(--border-main)' }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
