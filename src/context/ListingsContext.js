import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const ListingsContext = createContext();

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within ListingsProvider');
  }
  return context;
};

export const ListingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = user ? '/api/listings?includeMine=1' : '/api/listings';
      const data = await api.get(url);
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setListings([]);
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  const value = {
    listings,
    loading,
    error,
    refreshListings
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};
