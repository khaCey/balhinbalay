import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const FavoritesContext = createContext();
const STORAGE_KEY = 'balhinbalay_favorites';

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setFavorites(raw ? JSON.parse(raw) : []);
      } catch {
        setFavorites([]);
      }
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/api/favorites');
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    if (!user && favorites.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [user, favorites]);

  const addFavorite = async (propertyId) => {
    if (favorites.includes(propertyId)) return;
    if (!user) {
      setFavorites((prev) => [...prev, propertyId]);
      return;
    }
    try {
      await api.post('/api/favorites', { listingId: propertyId });
      setFavorites((prev) => [...prev, propertyId]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (propertyId) => {
    if (!user) {
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
      return;
    }
    try {
      await api.delete('/api/favorites/' + propertyId);
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = (propertyId) => {
    if (favorites.includes(propertyId)) {
      removeFavorite(propertyId);
    } else {
      addFavorite(propertyId);
    }
  };

  const isFavorite = (propertyId) => favorites.includes(propertyId);

  const value = {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
