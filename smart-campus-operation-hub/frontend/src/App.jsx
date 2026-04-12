import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketCreatePage from './pages/tickets/TicketCreatePage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';

import { LayoutDashboard, Ticket, FileText } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Sidebar */}
        <nav className="sidebar">
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '32px', letterSpacing: '0' }}>SmartCampus Hub</h2>
          
          <Link to="/">
            <LayoutDashboard size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Dashboard
          </Link>
          
          <Link to="/tickets" className="active">
            <Ticket size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Tickets Task
          </Link>

          <Link to="#">
            <FileText size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Documentation
          </Link>
        </nav>

        {/* Global Body */}
        <div style={{ flex: 1, backgroundColor: 'var(--surface)' }}>
          {/* Floating Header Header */}
          <header style={{ 
            height: '64px', 
            padding: '0 32px', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderBottom: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '99px', fontSize: '14px', fontWeight: '500' }}>
              Test User (ID: 1)
            </div>
          </header>

          <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<div className="card"><h2>Dashboard</h2><p>Click "Tickets Task" in the sidebar.</p></div>} />
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/tickets/new" element={<TicketCreatePage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
