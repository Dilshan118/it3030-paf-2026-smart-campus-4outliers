import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
        window.location.href = '/login';
      }
    };
    window.addEventListener('storage', handleStorageChange);

    if (!token) {
      setLoading(false);
      return () => window.removeEventListener('storage', handleStorageChange);
    }

    api.get('/users/me')
      .then(res => setUser(res.data.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    return api.get('/users/me').then(res => {
      setUser(res.data.data);
      return res.data.data;
    });
  };

  const refreshUser = () =>
    api.get('/users/me').then(res => { setUser(res.data.data); return res.data.data; });

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
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
    refreshUser,
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
