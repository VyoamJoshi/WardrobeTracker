import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wardrobe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('wardrobe_token'));
  const [loading, setLoading] = useState(true);
  const { error: toastError, info: toastInfo } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('wardrobe_token');
    localStorage.removeItem('wardrobe_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for session expiry event
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      toastInfo('Your session has expired. Please sign in again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout, toastInfo]);

  // Check auth status on mount
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('wardrobe_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('wardrobe_user', JSON.stringify(res.user));
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('wardrobe_token', res.token);
      localStorage.setItem('wardrobe_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('wardrobe_token', res.token);
      localStorage.setItem('wardrobe_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const demoLogin = async () => {
    return login('demo@wardrobe.me', 'demo1234');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout,
        demoLogin,
      }}
    >
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
