import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useListings } from './ListingsContext';
import { api } from '../api/client';

const UserListingsContext = createContext();

export const useUserListings = () => {
  const context = useContext(UserListingsContext);
  if (!context) {
    throw new Error('useUserListings must be used within UserListingsProvider');
  }
  return context;
};

export const UserListingsProvider = ({ children }) => {
  const { user } = useAuth();
  const { listings, refreshListings } = useListings();

  const userListings = useMemo(
    () => (user ? listings.filter((l) => l.ownerId === user.id) : []),
    [listings, user]
  );

  const addListing = async (listing) => {
    const res = await api.post('/api/listings', listing);
    await refreshListings();
    return res;
  };

  const updateListing = async (id, updates) => {
    await api.patch('/api/listings/' + id, updates);
    await refreshListings();
  };

  const unlistListing = async (id) => {
    await api.delete('/api/listings/' + id);
    await refreshListings();
  };

  const getListingsByOwner = (ownerId) => {
    return listings.filter((l) => l.ownerId === ownerId);
  };

  const value = {
    userListings,
    addListing,
    updateListing,
    unlistListing,
    getListingsByOwner
  };

  return (
    <UserListingsContext.Provider value={value}>
      {children}
    </UserListingsContext.Provider>
  );
};
