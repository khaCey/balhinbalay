import React, { createContext, useContext, useState, useCallback } from 'react';

const defaultSearchState = {
  listingType: 'sale',
  view: 'city',
  propertyType: '',
  priceRangeIndex: 0,
  priceMin: null,
  priceMax: null,
  selectedRegion: 'all',
  selectedProvince: '',
  selectedCity: 'cebu-province',
  searchQuery: '',
  furnishedFilter: '',
  minBeds: 0,
  minBaths: 0,
  sizeRange: { min: 0, max: Infinity },
  sortBy: 'newest',
  selectedSchoolId: ''
};

const SearchContext = createContext(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return ctx;
}

export function SearchProvider({ children }) {
  const [lastSearchState, setLastSearchState] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  /** Per listingType (sale/rent) so each tab restores its own filters when swiping */
  const [currentResultsState, setCurrentResultsState] = useState(() => ({}));

  const submitSearch = useCallback((state) => {
    const normalized = {
      listingType: state.listingType ?? 'sale',
      view: state.view ?? 'city',
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
      sizeRange: state.sizeRange && typeof state.sizeRange === 'object'
        ? { min: state.sizeRange.min ?? 0, max: state.sizeRange.max === undefined || state.sizeRange.max === null ? Infinity : state.sizeRange.max }
        : defaultSearchState.sizeRange,
      sortBy: state.sortBy ?? 'newest',
      selectedSchoolId: state.selectedSchoolId ?? ''
    };
    setLastSearchState(normalized);
    setHasSearched(true);
  }, []);

  const setCurrentResultsStateForListing = useCallback((listingTypeKey, state) => {
    setCurrentResultsState((prev) => ({ ...prev, [listingTypeKey]: state }));
  }, []);

  const value = {
    lastSearchState,
    hasSearched,
    submitSearch,
    currentResultsState,
    setCurrentResultsStateForListing
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}
