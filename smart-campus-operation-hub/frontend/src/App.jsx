import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotificationHistoryPage from './pages/notifications/NotificationHistoryPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex" style={{flexDirection: 'column', flex: 1}}>
                    <Navbar />
                    <main className="main-content">
                      <DashboardPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex" style={{flexDirection: 'column', flex: 1}}>
                    <Navbar />
                    <main className="main-content">
                      <NotificationHistoryPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* Placeholder routes for other modules */}
            <Route path="/bookings/*" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6">
                      <div className="text-center text-gray-500">
                        <h2 className="text-2xl font-bold mb-4">Bookings Module</h2>
                        <p>Coming soon...</p>
                      </div>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/tickets/*" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6">
                      <div className="text-center text-gray-500">
                        <h2 className="text-2xl font-bold mb-4">Tickets Module</h2>
                        <p>Coming soon...</p>
                      </div>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/resources/*" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6">
                      <div className="text-center text-gray-500">
                        <h2 className="text-2xl font-bold mb-4">Resources Module</h2>
                        <p>Coming soon...</p>
                      </div>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6">
                      <div className="text-center text-gray-500">
                        <h2 className="text-2xl font-bold mb-4">Admin Module</h2>
                        <p>Coming soon...</p>
                      </div>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
