import React, { createContext, useContext, useState, useCallback } from 'react';

const FiltersOpenContext = createContext(null);

export function FiltersOpenProvider({ children }) {
  const [openRequested, setOpenRequested] = useState(false);

  const requestOpen = useCallback(() => setOpenRequested(true), []);
  const clearRequest = useCallback(() => setOpenRequested(false), []);

  const value = { openRequested, requestOpen, clearRequest };

  return (
    <FiltersOpenContext.Provider value={value}>
      {children}
    </FiltersOpenContext.Provider>
  );
}

export function useFiltersOpen() {
  const ctx = useContext(FiltersOpenContext);
  return ctx || { openRequested: false, requestOpen: () => {}, clearRequest: () => {} };
}
