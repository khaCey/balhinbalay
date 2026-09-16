import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'balhinbalay_search_state';

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
  selectedCityIds: [],
  searchQuery: '',
  furnishedFilter: '',
  minBeds: 0,
  minBaths: 0,
  sizeRange: { min: 0, max: Infinity },
  sortBy: 'newest',
  selectedSchoolId: ''
};

function serializeSizeRange(sizeRange) {
  if (!sizeRange || typeof sizeRange !== 'object') {
    return { min: 0, max: null };
  }
  return {
    min: sizeRange.min ?? 0,
    max: sizeRange.max === Infinity || sizeRange.max == null ? null : sizeRange.max
  };
}

function deserializeSizeRange(sizeRange) {
  if (!sizeRange || typeof sizeRange !== 'object') {
    return { ...defaultSearchState.sizeRange };
  }
  return {
    min: sizeRange.min ?? 0,
    max: sizeRange.max == null ? Infinity : sizeRange.max
  };
}

function normalizeSearchState(state) {
  const legacySelectedCity = state.selectedCity ?? 'cebu-province';
  const selectedCityIds = Array.from(new Set(
    (Array.isArray(state.selectedCityIds)
      ? state.selectedCityIds
      : (legacySelectedCity && legacySelectedCity !== 'cebu-province' ? [legacySelectedCity] : []))
      .filter((cityId) => typeof cityId === 'string' && cityId && cityId !== 'cebu-province')
  ));

  return {
    listingType: state.listingType ?? 'sale',
    view: state.view ?? 'city',
    propertyType: state.propertyType ?? '',
    priceRangeIndex: state.priceRangeIndex ?? 0,
    priceMin: state.priceMin ?? null,
    priceMax: state.priceMax ?? null,
    selectedRegion: state.selectedRegion ?? 'all',
    selectedProvince: state.selectedProvince ?? '',
    selectedCity: selectedCityIds.length === 1 ? selectedCityIds[0] : legacySelectedCity,
    selectedCityIds,
    searchQuery: state.searchQuery ?? '',
    furnishedFilter: state.furnishedFilter ?? '',
    minBeds: state.minBeds ?? 0,
    minBaths: state.minBaths ?? 0,
    sizeRange: deserializeSizeRange(state.sizeRange),
    sortBy: state.sortBy ?? 'newest',
    selectedSchoolId: state.selectedSchoolId ?? ''
  };
}

function loadPersisted() {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      hasSearched: Boolean(parsed.hasSearched),
      lastSearchState: parsed.lastSearchState ? normalizeSearchState(parsed.lastSearchState) : null,
      currentResultsState: parsed.currentResultsState && typeof parsed.currentResultsState === 'object'
        ? Object.fromEntries(
            Object.entries(parsed.currentResultsState).map(([key, value]) => [key, normalizeSearchState(value)])
          )
        : {}
    };
  } catch {
    return null;
  }
}

const SearchContext = createContext(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return ctx;
}

export function SearchProvider({ children }) {
  const [mapStates, setMapStates] = useState({});
  const updateMapState = useCallback((listingType, next) => setMapStates(value => ({ ...value, [listingType]: { ...value[listingType], ...next } })), []);
  const persisted = loadPersisted();
  const [lastSearchState, setLastSearchState] = useState(persisted?.lastSearchState ?? null);
  const [hasSearched, setHasSearched] = useState(Boolean(persisted?.hasSearched && persisted?.lastSearchState));
  /** Per listingType (sale/rent) so each tab restores its own filters when swiping */
  const [currentResultsState, setCurrentResultsState] = useState(() => persisted?.currentResultsState ?? {});

  useEffect(() => {
    try {
      if (typeof sessionStorage === 'undefined') return;
      const payload = {
        hasSearched,
        lastSearchState: lastSearchState
          ? { ...lastSearchState, sizeRange: serializeSizeRange(lastSearchState.sizeRange) }
          : null,
        currentResultsState: Object.fromEntries(
          Object.entries(currentResultsState).map(([key, value]) => [
            key,
            { ...value, sizeRange: serializeSizeRange(value.sizeRange) }
          ])
        )
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }, [hasSearched, lastSearchState, currentResultsState]);

  const submitSearch = useCallback((state) => {
    const normalized = normalizeSearchState({
      ...state,
      sortBy: state.sortBy ?? 'newest'
    });
    setLastSearchState(normalized);
    setMapStates(value => ({ ...value, [normalized.listingType]: null }));
    // New searches should start from the submitted state for that listing type.
    // This prevents stale in-page filter tweaks from overriding the new search payload.
    setCurrentResultsState((prev) => ({ ...prev, [normalized.listingType]: normalized }));
    setHasSearched(true);
  }, []);

  const setCurrentResultsStateForListing = useCallback((listingTypeKey, state) => {
    setCurrentResultsState((prev) => ({ ...prev, [listingTypeKey]: state }));
  }, []);

  const value = {
    mapStates,
    updateMapState,
    lastSearchState,
    hasSearched,
    submitSearch,
    currentResultsState,
    setCurrentResultsStateForListing,
    defaultSearchState
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}
