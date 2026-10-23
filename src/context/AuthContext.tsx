import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const wasAdminRoute = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/me', { credentials: 'include' });
      const data = await res.json().catch(() => null);
      if (data && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Verify the session when entering the admin area, not on every admin-page navigation.
    if (isAdminRoute && !wasAdminRoute.current) {
      void checkAuth();
    } else if (!isAdminRoute) {
      setUser(null);
      setLoading(false);
    }

    wasAdminRoute.current = isAdminRoute;
  }, [location.pathname]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email.trim(), email: email.trim(), username: email.trim(), password }),
      });
      const data = await res.json().catch(() => null);
      if (data && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      if (data && data.error) {
        return { success: false, error: data.error };
      }
      return {
        success: false,
        error: res.ok ? 'Login failed. Please verify your credentials.' : `Server error (${res.status}). Please try again shortly.`,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
