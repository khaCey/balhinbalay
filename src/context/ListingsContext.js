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

function buildSearchQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const searchParams = new URLSearchParams();
  if (params.listingType) searchParams.set('listingType', params.listingType);
  if (params.priceMin != null && params.priceMin !== '') searchParams.set('priceMin', String(params.priceMin));
  if (params.priceMax != null && params.priceMax !== '') searchParams.set('priceMax', String(params.priceMax));
  if (params.cityId) searchParams.set('cityId', params.cityId);
  if (params.cityIds && params.cityIds.length > 0) searchParams.set('cityIds', params.cityIds.join(','));
  if (params.type) searchParams.set('type', params.type);
  if (params.furnished) searchParams.set('furnished', params.furnished);
  if (params.minBeds != null && params.minBeds > 0) searchParams.set('minBeds', String(params.minBeds));
  if (params.minBaths != null && params.minBaths > 0) searchParams.set('minBaths', String(params.minBaths));
  if (params.sizeMin != null && params.sizeMin > 0) searchParams.set('sizeMin', String(params.sizeMin));
  if (params.sizeMax != null && params.sizeMax !== Infinity && params.sizeMax > 0) searchParams.set('sizeMax', String(params.sizeMax));
  if (params.q) searchParams.set('q', params.q.trim());
  if (params.sort) searchParams.set('sort', params.sort);
  const qs = searchParams.toString();
  return qs ? '?' + qs : '';
}

export const ListingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  const fetchSearchListings = useCallback(async (params) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const qs = buildSearchQueryString(params);
      const url = '/api/listings' + qs;
      const data = await api.get(url);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setSearchResults([]);
      setSearchError(err.message || 'Failed to load search results');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  const value = {
    listings,
    loading,
    error,
    refreshListings,
    searchResults,
    searchLoading,
    searchError,
    fetchSearchListings
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};
