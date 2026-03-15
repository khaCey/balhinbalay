import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const STORAGE_KEY = 'balhinbalay_saved_searches';
const MAX_SAVED = 20;

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

const SavedSearchesContext = createContext();

export const useSavedSearches = () => {
  const context = useContext(SavedSearchesContext);
  if (!context) {
    throw new Error('useSavedSearches must be used within SavedSearchesProvider');
  }
  return context;
};

/** Build a serializable filter state (for saving). sizeRange.max Infinity -> null. */
export const serializeFilterState = (state) => ({
  listingType: state.listingType,
  propertyType: state.propertyType ?? '',
  priceRangeIndex: state.priceRangeIndex ?? 0,
  priceMin: state.priceMin ?? null,
  priceMax: state.priceMax ?? null,
  selectedRegion: state.selectedRegion ?? 'all',
  selectedProvince: state.selectedProvince ?? '',
  selectedCity: state.selectedCity ?? 'cebu-province',
  searchQuery: state.searchQuery ?? '',
  furnishedFilter: state.furnishedFilter ?? '',
  minBeds: state.minBeds ?? 0,
  minBaths: state.minBaths ?? 0,
  sizeRangeMin: state.sizeRange?.min ?? 0,
  sizeRangeMax: state.sizeRange?.max === Infinity || state.sizeRange?.max == null ? null : state.sizeRange.max,
  sortBy: state.sortBy ?? 'newest'
});

/** Restore sizeRange from serialized (null max -> Infinity). */
export const deserializeFilterState = (saved) => ({
  listingType: saved.listingType ?? 'sale',
  propertyType: saved.propertyType ?? '',
  priceRangeIndex: saved.priceRangeIndex ?? 0,
  priceMin: saved.priceMin ?? null,
  priceMax: saved.priceMax ?? null,
  selectedRegion: saved.selectedRegion ?? 'all',
  selectedProvince: saved.selectedProvince ?? '',
  selectedCity: saved.selectedCity ?? 'cebu-province',
  searchQuery: saved.searchQuery ?? '',
  furnishedFilter: saved.furnishedFilter ?? '',
  minBeds: saved.minBeds ?? 0,
  minBaths: saved.minBaths ?? 0,
  sizeRange: {
    min: saved.sizeRangeMin ?? 0,
    max: saved.sizeRangeMax == null ? Infinity : saved.sizeRangeMax
  },
  sortBy: saved.sortBy ?? 'newest'
});

export const SavedSearchesProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState(loadStored);

  const fetchSearches = useCallback(async () => {
    if (!user) {
      setSavedSearches(loadStored());
      return;
    }
    try {
      const data = await api.get('/api/saved-searches');
      setSavedSearches(Array.isArray(data) ? data : []);
    } catch {
      setSavedSearches([]);
    }
  }, [user]);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSearches));
    }
  }, [user, savedSearches]);

  const saveSearch = async (name, filterState) => {
    const serialized = serializeFilterState(filterState);
    const payload = { name: (name || '').trim() || 'Untitled search', ...serialized };
    if (!user) {
      const id = 'ss_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      const entry = { id, ...payload };
      setSavedSearches((prev) => [entry, ...prev].slice(0, MAX_SAVED));
      return id;
    }
    try {
      const created = await api.post('/api/saved-searches', payload);
      await fetchSearches();
      return created?.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const getSearch = (id) => {
    const entry = savedSearches.find((s) => s.id === id);
    return entry ? deserializeFilterState(entry) : null;
  };

  const deleteSearch = async (id) => {
    if (!user) {
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    try {
      await api.delete('/api/saved-searches/' + id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    savedSearches,
    saveSearch,
    getSearch,
    deleteSearch
  };

  return (
    <SavedSearchesContext.Provider value={value}>
      {children}
    </SavedSearchesContext.Provider>
  );
};
