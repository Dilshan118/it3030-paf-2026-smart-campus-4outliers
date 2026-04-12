import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketCreatePage from './pages/tickets/TicketCreatePage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', alignItems: 'center' }}>
        <nav style={{ padding: '20px', width: '100%', maxWidth: '800px', display: 'flex', gap: '15px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: 'var(--text-h)' }}>Home</Link>
          <Link to="/tickets" style={{ fontWeight: 'bold', textDecoration: 'none', color: 'var(--accent)' }}>Tickets Module</Link>
        </nav>

        <main style={{ flex: 1, width: '100%', maxWidth: '800px' }}>
          <Routes>
            <Route path="/" element={<div style={{ padding: '20px' }}><h1>Welcome</h1><p>Select Tickets Module from the nav to test Member 3s work.</p></div>} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<TicketCreatePage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
