import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, clearToken, getToken, setOn401 } from '../api/client';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

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
    if (Capacitor.isNativePlatform()) {
      try {
        await Preferences.set({ key: STORAGE_KEY, value: payload });
      } catch (e) {
        // ignore
      }
    }
  } else {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    if (Capacitor.isNativePlatform()) {
      try {
        await Preferences.remove({ key: STORAGE_KEY });
      } catch (e) {
        // ignore
      }
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

  // In native app, restore auth from Capacitor Preferences (persists across app restarts)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    (async () => {
      try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (cancelled || !value) return;
        const data = JSON.parse(value);
        if (data && data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const validateStoredSession = async () => {
      if (!getToken()) return;
      try {
        await api.get('/api/auth/me');
      } catch {
        // 401 already triggers on401Callback → setUser(null); other errors (e.g. network) do not log out
      }
    };
    validateStoredSession();
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
      return { ok: false, message: (err.data && err.data.message) || err.message || 'Registration failed.' };
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
      return { ok: false, message: (err.data && err.data.message) || err.message || 'Failed to resend confirmation email.' };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user || !updates) return { ok: false, message: 'Nothing to update.' };
    try {
      const body = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.email !== undefined) body.email = updates.email;
      const data = await api.patch('/api/users/me', body);
      if (data) {
        setUser(prev => ({ ...prev, id: data.id, email: data.email, name: data.name || data.email, role: data.role || (prev && prev.role) || 'user' }));
        return { ok: true };
      }
      return { ok: false, message: 'Update failed.' };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.message || 'Update failed.' };
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
      return { ok: false, message: (err.data && err.data.message) || err.message || 'Could not change password.' };
    }
  };

  const value = {
    user,
    login,
    register,
    resendConfirmation,
    logout,
    updateProfile,
    changePassword,
    isLoggedIn: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
