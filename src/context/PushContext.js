import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PREF_KEY = 'balhinbalay_push_enabled';
const TOKEN_KEY = 'balhinbalay_push_token';

const PushContext = createContext(null);

export function usePush() {
  const ctx = useContext(PushContext);
  return ctx;
}

export function PushProvider({ children }) {
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [pushToken, setPushToken] = useState(null);
  const [trigger, setTrigger] = useState(0);

  const loadPreference = useCallback(async () => {
    try {
      const value = localStorage.getItem(PREF_KEY);
      setPushEnabledState(value !== 'false');
    } catch {
      setPushEnabledState(true);
    }
  }, []);

  useEffect(() => {
    loadPreference();
  }, [loadPreference]);

  const setPushEnabled = useCallback(async (enabled) => {
    setPushEnabledState(enabled);
    try {
      localStorage.setItem(PREF_KEY, enabled ? 'true' : 'false');
    } catch (_) {}
  }, []);

  const saveToken = useCallback(async (token) => {
    setPushToken(token);
    try {
      localStorage.setItem(TOKEN_KEY, token || '');
    } catch (_) {}
  }, []);

  const getStoredToken = useCallback(async () => {
    try {
      const value = localStorage.getItem(TOKEN_KEY);
      return value || '';
    } catch {
      return null;
    }
  }, []);

  const clearStoredToken = useCallback(async () => {
    setPushToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
  }, []);

  const triggerRegister = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  const value = {
    pushEnabled,
    setPushEnabled,
    pushToken,
    setPushToken: saveToken,
    getStoredToken,
    clearStoredToken,
    triggerRegister,
    trigger
  };

  return (
    <PushContext.Provider value={value}>
      {children}
    </PushContext.Provider>
  );
}
