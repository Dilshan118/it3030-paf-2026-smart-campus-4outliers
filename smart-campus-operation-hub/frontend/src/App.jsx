import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotificationHistoryPage from './pages/notifications/NotificationHistoryPage';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketCreatePage from './pages/tickets/TicketCreatePage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import TicketManagePage from './pages/tickets/TicketManagePage';
import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import ResourceManagePage from './pages/resources/ResourceManagePage';
import ResourceAnalyticsPage from './pages/resources/ResourceAnalyticsPage';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import UserManagePage from './pages/admin/UserManagePage';

function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-shell" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* Protected Main Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><NotificationHistoryPage /></DashboardLayout></ProtectedRoute>} />
          
          {/* Ticket Routes */}
          <Route path="/tickets" element={<ProtectedRoute><DashboardLayout><TicketListPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><DashboardLayout><TicketCreatePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/tickets/manage" element={<ProtectedRoute><DashboardLayout><TicketManagePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><DashboardLayout><TicketDetailPage /></DashboardLayout></ProtectedRoute>} />

          {/* Placeholders for Other Modules */}
          <Route path="/bookings/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="card" style={{ textAlign: 'center' }}>
                  <h2 className="h1">Bookings Module</h2>
                  <p style={{ color: 'var(--on-surface-variant)' }}>Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Resource Routes */}
          <Route path="/resources" element={<ProtectedRoute><DashboardLayout><ResourceListPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/resources/:id" element={<ProtectedRoute><DashboardLayout><ResourceDetailPage /></DashboardLayout></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/resources" element={<ProtectedRoute><DashboardLayout><ResourceManagePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/resources/analytics" element={<ProtectedRoute><DashboardLayout><ResourceAnalyticsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><DashboardLayout><UserManagePage /></DashboardLayout></ProtectedRoute>} />

          <Route path="/admin/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="card" style={{ textAlign: 'center' }}>
                  <h2 className="h1">Admin Module</h2>
                  <p style={{ color: 'var(--on-surface-variant)' }}>Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
