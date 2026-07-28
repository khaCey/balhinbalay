import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, clearToken, getToken, setOn401 } from '../api/client';

const STORAGE_KEY = 'balhinbalay_auth';
const MIN_PASSWORD_LENGTH = 8;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const data = JSON.parse(raw);
    if (data && data.token) {
      setToken(data.token);
      return { user: data.user || null, token: data.token };
    }
    return { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
};

const saveAuth = async (user, token) => {
  if (user && token) {
    const payload = JSON.stringify({ user, token });
    try {
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      // ignore
    }
  } else {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const { user: storedUser, token } = loadStoredAuth();
    if (storedUser && token) {
      setToken(token);
      return storedUser;
    }
    return null;
  });

  useEffect(() => {
    setOn401(() => setUser(null));
    return () => setOn401(null);
  }, []);

  useEffect(() => {
    const bootSession = async () => {
      if (process.env.REACT_APP_DEBUG_AUTH === '1') {
        try {
          const data = await api.post('/api/auth/debug-login', {});
          if (data && data.ok && data.token && data.user) {
            const userObj = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.email,
              role: data.user.role || 'admin'
            };
            setToken(data.token);
            setUser(userObj);
            return;
          }
        } catch {
          // Fall through to stored-session validation when debug login is unavailable.
        }
      }
      if (!getToken()) return;
      try {
        await api.get('/api/auth/me');
      } catch {
        // 401 already triggers on401Callback → setUser(null); other errors (e.g. network) do not log out
      }
    };
    bootSession();
  }, []);

  useEffect(() => {
    if (user) {
      const token = getToken();
      if (token) saveAuth(user, token);
    } else {
      clearToken();
      saveAuth(null, null);
    }
  }, [user]);

  const refreshUser = async () => {
    if (!getToken()) return;
    try {
      const data = await api.get('/api/users/me');
      if (data) {
        setUser(prev => ({ ...prev, id: data.id, email: data.email, name: data.name || data.email, push_enabled: data.push_enabled, avatar_url: data.avatar_url ?? prev?.avatar_url }));
      }
    } catch {
      // ignore
    }
  };

  const login = async (email, password) => {
    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (!data || !data.ok) {
        const msg = (data && data.message) || 'Login failed. Check your email and password, and that your email is verified.';
        return { ok: false, message: msg };
      }
      const userObj = data.user ? { id: data.user.id, email: data.user.email, name: data.user.name || data.user.email, role: data.user.role || 'user' } : null;
      setToken(data.token);
      setUser(userObj);
      if (userObj) refreshUser().catch(() => {});
      return { ok: true, user: userObj };
    } catch (err) {
      const msg = (err.data && err.data.message) || err.userMessage || err.message;
      return {
        ok: false,
        message: msg || 'Connection problem. Check your network and try again.',
        code: err.data && err.data.code
      };
    }
  };

  const register = async (email, password, name) => {
    if (!(email || '').trim() || !password) {
      return { ok: false, message: 'Email and password are required.' };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    try {
      const data = await api.post('/api/auth/register', { email, password, name });
      if (!data || !data.ok) {
        return { ok: false, message: (data && data.message) || 'Registration failed.' };
      }
      if (data.requiresConfirmation) {
        return { ok: true, requiresConfirmation: true, message: data.message || 'Check your email to confirm your account.' };
      }
      const userObj = data.user ? { id: data.user.id, email: data.user.email, name: data.user.name || data.user.email, role: data.user.role || 'user' } : null;
      setToken(data.token);
      setUser(userObj);
      return { ok: true, user: userObj };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.userMessage || err.message || 'Registration failed.' };
    }
  };

  const resendConfirmation = async (email) => {
    if (!(email || '').trim()) {
      return { ok: false, message: 'Email is required.' };
    }
    try {
      const data = await api.post('/api/auth/resend-confirmation', { email });
      return { ok: data && data.ok, message: (data && data.message) || 'Check your email for the confirmation link.' };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.userMessage || err.message || 'Failed to resend confirmation email.' };
    }
  };

  const requestPasswordReset = async (email) => {
    if (!(email || '').trim()) {
      return { ok: false, message: 'Email is required.' };
    }
    try {
      const data = await api.post('/api/auth/request-password-reset', { email });
      return { ok: data && data.ok, message: (data && data.message) || 'Check your email for the reset code.' };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.userMessage || err.message || 'Failed to send reset code.' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    if (!(email || '').trim() || !(code != null ? String(code).trim() : '')) {
      return { ok: false, message: 'Email and code are required.' };
    }
    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    try {
      const data = await api.post('/api/auth/reset-password', { email, code, newPassword });
      return { ok: data && data.ok, message: (data && data.message) || 'Password updated. You can log in now.' };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.userMessage || err.message || 'Reset failed.' };
    }
  };

  const logout = async () => {
    try {
      await api.delete('/api/users/me/push-token');
    } catch (_) {
      // ignore; token may already be invalid or server unavailable
    }
    clearToken();
    setUser(null);
    saveAuth(null, null);
  };

  const updateProfile = async (updates) => {
    if (!user || !updates) return { ok: false, message: 'Nothing to update.' };
    try {
      const body = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.email !== undefined) body.email = updates.email;
      if (updates.avatar_url !== undefined) body.avatar_url = updates.avatar_url;
      const data = await api.patch('/api/users/me', body);
      if (data) {
        setUser(prev => ({ ...prev, id: data.id, email: data.email, name: data.name || data.email, role: data.role || (prev && prev.role) || 'user', avatar_url: data.avatar_url ?? prev?.avatar_url }));
        return { ok: true };
      }
      return { ok: false, message: 'Update failed.' };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.userMessage || err.message || 'Update failed.' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { ok: false, message: 'Not logged in.' };
    if (!currentPassword || !newPassword) {
      return { ok: false, message: 'Current and new password are required.' };
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    try {
      await api.post('/api/users/me/change-password', {
        currentPassword,
        newPassword
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.userMessage || err.message || 'Could not change password.' };
    }
  };

  const value = {
    user,
    login,
    register,
    resendConfirmation,
    requestPasswordReset,
    resetPassword,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isLoggedIn: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
