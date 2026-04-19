import { createContext, useContext, useState, useEffect } from 'react';

/**
 * MEMBER 4: Auth Context
 * Provides user info and auth state to the entire app.
 *
 * Usage in any component:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY: For development/testing, set a mock user
    // TODO: Replace with actual token validation and user fetching
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN'
    };
    // Ensure a token exists in localStorage so the axios interceptor sends
    // the Authorization header. Real login flow uses login() which stores
    // the actual JWT; this fallback covers the dev mock-user path.
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'mock-dev-token');
    }
    setUser(mockUser);
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
