import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const STORAGE_KEY = 'balhinbalay_recently_viewed';
const MAX_RECENT = 20;

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};

const loadStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const RecentlyViewedProvider = ({ children }) => {
  const { user } = useAuth();
  const [recentIds, setRecentIds] = useState(loadStored);

  const fetchRecent = useCallback(async () => {
    if (!user) {
      setRecentIds(loadStored());
      return;
    }
    try {
      const data = await api.get('/api/recently-viewed');
      setRecentIds(Array.isArray(data) ? data : []);
    } catch {
      setRecentIds([]);
    }
  }, [user]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
    }
  }, [user, recentIds]);

  const addView = async (propertyId) => {
    if (!propertyId) return;
    if (!user) {
      setRecentIds((prev) => {
        const next = [propertyId, ...prev.filter((id) => id !== propertyId)];
        return next.slice(0, MAX_RECENT);
      });
      return;
    }
    try {
      await api.post('/api/recently-viewed', { listingId: propertyId });
      setRecentIds((prev) => {
        const next = [propertyId, ...prev.filter((id) => id !== propertyId)];
        return next.slice(0, MAX_RECENT);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    recentIds,
    addView
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};
