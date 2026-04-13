export default function LoadingSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          className="animate-spin"
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--surface-container-highest)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            margin: '0 auto',
          }}
        />
        <p style={{ marginTop: '16px', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Loading...</p>
      </div>
    </div>
  );
}
