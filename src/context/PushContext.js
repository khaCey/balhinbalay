import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

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
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: PREF_KEY });
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
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: PREF_KEY, value: enabled ? 'true' : 'false' });
    } catch (_) {}
  }, []);

  const saveToken = useCallback(async (token) => {
    setPushToken(token);
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: TOKEN_KEY, value: token || '' });
    } catch (_) {}
  }, []);

  const getStoredToken = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return null;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      return value || null;
    } catch {
      return null;
    }
  }, []);

  const clearStoredToken = useCallback(async () => {
    setPushToken(null);
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: TOKEN_KEY });
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
