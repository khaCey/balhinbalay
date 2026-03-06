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

const saveAuth = (user, token) => {
  if (user && token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
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
        return { ok: false, message: (data && data.message) || 'Login failed.' };
      }
      const userObj = data.user ? { id: data.user.id, email: data.user.email, name: data.user.name || data.user.email, role: data.user.role || 'user' } : null;
      setToken(data.token);
      setUser(userObj);
      return { ok: true, user: userObj };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.message || 'Login failed.' };
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
      const userObj = data.user ? { id: data.user.id, email: data.user.email, name: data.user.name || data.user.email, role: data.user.role || 'user' } : null;
      setToken(data.token);
      setUser(userObj);
      return { ok: true, user: userObj };
    } catch (err) {
      return { ok: false, message: (err.data && err.data.message) || err.message || 'Registration failed.' };
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
