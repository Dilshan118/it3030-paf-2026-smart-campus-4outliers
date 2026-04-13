import React from 'react';

export default function Navbar() {
  return (
    <header style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'flex-end', position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Floating Glass Header */}
      <div className="glass-chip" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dcfce7', boxShadow: '0 0 0 3px #bbf7d0' }}></div>
        <span style={{ color: 'var(--on-surface-variant)' }}>Test User (ID: 1)</span>
      </div>
    </header>
  );
}
