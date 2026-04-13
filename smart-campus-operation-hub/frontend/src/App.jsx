import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketCreatePage from './pages/tickets/TicketCreatePage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';

import { LayoutDashboard, Ticket } from 'lucide-react';

function App() {
  const navClassName = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Sidebar */}
        <nav className="sidebar">
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '32px', letterSpacing: '0' }}>SmartCampus Hub</h2>

          <NavLink to="/" end className={navClassName}>
            <LayoutDashboard size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Dashboard
          </NavLink>

          <NavLink to="/tickets" className={navClassName}>
            <Ticket size={20} strokeWidth={1.5} style={{ marginRight: '16px' }} />
            Tickets
          </NavLink>
        </nav>

        {/* Global Body */}
        <div className="app-shell" style={{ flex: 1, backgroundColor: 'var(--surface)' }}>
          {/* Floating Header */}
          <header style={{ padding: '20px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
            <div className="glass-chip">
              Test User (ID: 1)
            </div>
          </header>

          <main className="app-main" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
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
