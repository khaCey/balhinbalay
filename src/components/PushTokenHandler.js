/**
 * Handles FCM push token: register when user is logged in, revoke when no user.
 * Must be mounted for the whole app (not route-specific) so revoke runs when logged out on any screen.
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePush } from '../context/PushContext';
import { api } from '../api/client';
import { Capacitor } from '@capacitor/core';

export default function PushTokenHandler() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { pushEnabled, setPushToken, getStoredToken, clearStoredToken, trigger } = usePush();
  const [startupRevokeDone, setStartupRevokeDone] = useState(false);

  /* On every app start (native): revoke stored token first. Server stops sending push to this device.
   * Register effect only runs after this so we never re-add then immediately revoke. */
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setStartupRevokeDone(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const token = await getStoredToken?.();
      if (cancelled) return;
      if (!token) {
        setStartupRevokeDone(true);
        return;
      }
      try {
        await api.post('/api/users/revoke-push-token', { token });
        console.log('[push] Startup revoke: token removed from server.');
      } catch (e) {
        console.warn('[push] Startup revoke failed:', e?.message || e);
      }
      if (!cancelled) setStartupRevokeDone(true);
    })();
    return () => { cancelled = true; };
  }, [getStoredToken]);

  /* Register token once per session: after startup revoke, when user is logged in and push enabled. Re-runs only when userId, pushEnabled, or trigger change — not on route change. */
  useEffect(() => {
    if (!startupRevokeDone || !userId || !Capacitor.isNativePlatform() || !pushEnabled) return;
    const cancelledRef = { current: false };
    let tapListener;
    let regListener;
    let retryTimeout;
    const sendTokenToServer = async (token) => {
      if (!token || cancelledRef.current) return;
      try {
        await api.post('/api/users/me/push-token', { token, platform: Capacitor.getPlatform() });
        console.log('[push] Token registered with server for current user.');
      } catch (e) {
        console.warn('[push] Failed to register token with server:', e?.message || e);
      }
    };
    (async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        if (!PushNotifications) throw new Error('PushNotifications plugin not available');
        if (cancelledRef.current) return;
        const onRegistration = async ({ value: token }) => {
          if (cancelledRef.current) return;
          setPushToken?.(token);
          await sendTokenToServer(token);
        };
        const onTap = ({ notification }) => {
          const data = notification.data || {};
          const nav = navigateRef.current;
          if (data.threadId) {
            nav(`/chat/${data.threadId}`);
          } else {
            nav('/messages');
          }
        };
        if (typeof PushNotifications.addListener === 'function') {
          tapListener = PushNotifications.addListener('pushNotificationActionPerformed', onTap);
          regListener = PushNotifications.addListener('registration', onRegistration);
        }
        if (cancelledRef.current) return;
        const storedToken = await getStoredToken?.();
        if (storedToken) await sendTokenToServer(storedToken);
        if (cancelledRef.current) return;
        console.log('[push] Requesting notification permission...');
        const status = await PushNotifications.requestPermissions();
        if (cancelledRef.current) return;
        if (status?.receive !== 'granted') {
          console.warn('[push] Permission not granted:', status?.receive);
          return;
        }
        console.log('[push] Permission granted, calling register()...');
        await PushNotifications.register();
        retryTimeout = setTimeout(async () => {
          if (cancelledRef.current) return;
          PushNotifications.register?.();
          const t = await getStoredToken?.();
          if (t) await sendTokenToServer(t);
        }, 15000);
      } catch (e) {
        console.warn('[push] Setup failed:', e?.message || e);
      }
    })();
    return () => {
      cancelledRef.current = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (tapListener?.remove) tapListener.remove();
      if (regListener?.remove) regListener.remove();
    };
  }, [startupRevokeDone, userId, pushEnabled, trigger, setPushToken, getStoredToken]);

  /* Revoke token when no user — runs on every route so logout or opening app without login triggers revoke */
  const revokeToken = useCallback(async () => {
    if (user || !Capacitor.isNativePlatform()) return;
    const token = await getStoredToken?.();
    if (!token) return;
    try {
      await api.post('/api/users/revoke-push-token', { token });
      console.log('[push] Token revoked (no user logged in).');
      await clearStoredToken?.();
    } catch (e) {
      console.warn('[push] Revoke failed:', e?.message || e);
    }
  }, [user, getStoredToken, clearStoredToken]);

  useEffect(() => {
    if (user || !Capacitor.isNativePlatform()) return;
    revokeToken();
  }, [user, revokeToken]);

  useEffect(() => {
    if (user || !Capacitor.isNativePlatform()) return;
    const onVisible = () => {
      revokeToken();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user, revokeToken]);

  return null;
}
