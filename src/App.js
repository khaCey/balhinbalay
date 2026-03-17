import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import PropertyCard from './components/PropertyCard';
import PropertyListCard from './components/PropertyListCard';
import RecentlyViewedCard from './components/RecentlyViewedCard';
import SortBar from './components/SortBar';
import ListingTypeToggle from './components/ListingTypeToggle';
import PriceSlider from './components/PriceSlider';
import MapView from './components/MapView';
import PullToRefresh from './components/PullToRefresh';
import { LoginModalProvider } from './context/LoginModalContext';
import ErrorBoundary from './components/ErrorBoundary';
import { FavoritesProvider } from './context/FavoritesContext';
import { RecentlyViewedProvider, useRecentlyViewed } from './context/RecentlyViewedContext';
import { SavedSearchesProvider } from './context/SavedSearchesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ListingsProvider, useListings } from './context/ListingsContext';
import { UserListingsProvider } from './context/UserListingsContext';
import { ChatProvider } from './context/ChatContext';
import { ChatModalProvider } from './context/ChatModalContext';
import { SearchProvider, useSearch } from './context/SearchContext';
import { useSliderDrag } from './context/SliderDragContext';
import { PropertyModalProvider } from './context/PropertyModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { SliderDragProvider } from './context/SliderDragContext';
import MainLayout from './components/MainLayout';
import PageHeader from './components/PageHeader';
import BackButtonHandler from './components/BackButtonHandler';
import PushTokenHandler from './components/PushTokenHandler';
import { PushProvider } from './context/PushContext';
import { baseUrl } from './api/client';
import { priceRanges, priceSliderConfig } from './data/listings';
import {
  getCityById,
  getCitiesByRegion,
  getCitiesByRegionAndProvince,
  getProvincesByRegion,
  getRegionIdsWithListings,
  getCityIdsWithListings
} from './data/cities';
import { schools, getSchoolById } from './data/schools';
import { haversineKm } from './utils/distance';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AddPropertyPage from './pages/AddPropertyPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import SavedPage from './pages/SavedPage';
import MessagesPage from './pages/MessagesPage';
import PropertyPage from './pages/PropertyPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import SearchCityPage from './pages/SearchCityPage';
import SearchKeywordPage from './pages/SearchKeywordPage';
import SearchMapPage from './pages/SearchMapPage';
import SearchSchoolPage from './pages/SearchSchoolPage';
import MenuPage from './pages/MenuPage';
import './App.css';

function AdminRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminPage />;
}

function AppContent() {
  const { user } = useAuth();
  const { isSliding } = useSliderDrag();
  const { listings: apiListings, loading: listingsLoading, error: listingsError, refreshListings, searchResults, searchLoading, searchError, fetchSearchListings } = useListings();
  const { recentIds, addView } = useRecentlyViewed();
  const [myPropertiesListingType, setMyPropertiesListingType] = useState('sale');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewFromUrl = searchParams.get('view') || '';
  const { hasSearched, lastSearchState, submitSearch, currentResultsState, setCurrentResultsStateForListing } = useSearch();
  const view = (hasSearched && lastSearchState?.view) ? lastSearchState.view : viewFromUrl;
  const isMyPropertiesPath = location.pathname === '/my-properties';
  const showMyPropertiesOnly = isMyPropertiesPath || ((location.pathname === '/sale' || location.pathname === '/rent') && location.state?.showMyProperties);
  const listingType = isMyPropertiesPath ? myPropertiesListingType : (location.pathname === '/rent' ? 'rent' : 'sale');
  const effectiveListingTypeForMyProperties = showMyPropertiesOnly ? myPropertiesListingType : listingType;
  const [propertyType, setPropertyType] = useState('');
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('cebu-province');
  const [searchQuery, setSearchQuery] = useState('');
  const [furnishedFilter, setFurnishedFilter] = useState('');
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [sizeRange, setSizeRange] = useState({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'grid'
  );
  const effectiveViewMode = view === 'map' ? 'map' : viewMode;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const pageSize = isMobile ? 6 : 9;
  const [itemsToShow, setItemsToShow] = useState(pageSize);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const prevWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 768);
  const hasRestoredFiltersRef = useRef(false);

  const SCHOOL_RADIUS_KM = 10;

  const allListings = useMemo(
    () => (Array.isArray(apiListings) ? apiListings : []),
    [apiListings]
  );
  const listingsToFilter = useMemo(() => {
    if (showMyPropertiesOnly && user) return allListings.filter((l) => l.ownerId === user.id);
    return allListings;
  }, [allListings, showMyPropertiesOnly, user]);

  function mapSortByToApiSort(sortByValue) {
    switch (sortByValue) {
      case 'price-low': return 'price-asc';
      case 'price-high': return 'price-desc';
      case 'size-large': return 'size-desc';
      case 'size-small': return 'size-asc';
      case 'newest':
      default: return 'newest';
    }
  }

  const currentPriceRange = useMemo(
    () => priceRanges[listingType][priceRangeIndex] || priceRanges[listingType][0],
    [listingType, priceRangeIndex]
  );
  const effectivePriceMin = priceMin != null ? priceMin : (currentPriceRange?.min ?? 0);
  const effectivePriceMax = priceMax != null ? priceMax : (currentPriceRange?.max === Infinity ? (priceSliderConfig[listingType]?.max ?? 10000000) : (currentPriceRange?.max ?? (priceSliderConfig[listingType]?.max ?? 10000000)));

  const applyAdvancedFilters = useCallback(() => {
    if (!hasSearched || showMyPropertiesOnly) return;
    const cityIdsFromRegion = selectedRegion && selectedRegion !== 'all' ? (getCitiesByRegion(selectedRegion).map((c) => c.id).filter((id) => id !== 'cebu-province')) : [];
    fetchSearchListings({
      listingType,
      priceMin: effectivePriceMin,
      priceMax: effectivePriceMax,
      cityId: selectedCity && selectedCity !== 'cebu-province' ? selectedCity : undefined,
      cityIds: selectedCity === 'cebu-province' && cityIdsFromRegion.length > 0 ? cityIdsFromRegion : undefined,
      type: propertyType || undefined,
      furnished: furnishedFilter || undefined,
      minBeds: minBeds > 0 ? minBeds : undefined,
      minBaths: minBaths > 0 ? minBaths : undefined,
      sizeMin: sizeRange.min > 0 ? sizeRange.min : undefined,
      sizeMax: sizeRange.max !== Infinity && sizeRange.max > 0 ? sizeRange.max : undefined,
      q: searchQuery.trim() || undefined,
      sort: mapSortByToApiSort(sortBy)
    });
  }, [hasSearched, showMyPropertiesOnly, fetchSearchListings, listingType, effectivePriceMin, effectivePriceMax, selectedRegion, selectedCity, propertyType, furnishedFilter, minBeds, minBaths, sizeRange.min, sizeRange.max, searchQuery, sortBy]);

  useEffect(() => {
    if (!hasSearched || showMyPropertiesOnly) return;
    const cityIdsFromRegion = selectedRegion && selectedRegion !== 'all' ? (getCitiesByRegion(selectedRegion).map((c) => c.id).filter((id) => id !== 'cebu-province')) : [];
    fetchSearchListings({
      listingType,
      priceMin: effectivePriceMin,
      priceMax: effectivePriceMax,
      cityId: selectedCity && selectedCity !== 'cebu-province' ? selectedCity : undefined,
      cityIds: selectedCity === 'cebu-province' && cityIdsFromRegion.length > 0 ? cityIdsFromRegion : undefined,
      type: propertyType || undefined,
      furnished: furnishedFilter || undefined,
      minBeds: minBeds > 0 ? minBeds : undefined,
      minBaths: minBaths > 0 ? minBaths : undefined,
      sizeMin: sizeRange.min > 0 ? sizeRange.min : undefined,
      sizeMax: sizeRange.max !== Infinity && sizeRange.max > 0 ? sizeRange.max : undefined,
      q: searchQuery.trim() || undefined,
      sort: mapSortByToApiSort(sortBy)
    });
  }, [hasSearched, showMyPropertiesOnly, fetchSearchListings, listingType, effectivePriceMin, effectivePriceMax, selectedRegion, selectedCity, searchQuery, sortBy]);

  const recentListings = useMemo(() => {
    const seen = new Set();
    return recentIds
      .map((id) => allListings.find((l) => l.id === id))
      .filter(Boolean)
      .filter((listing) => {
        if (seen.has(listing.id)) return false;
        seen.add(listing.id);
        return true;
      })
      .slice(0, 10);
  }, [recentIds, allListings]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const nextIsMobile = width < 768;
      const wasDesktop = prevWidthRef.current >= 768;
      prevWidthRef.current = width;
      setIsMobile(nextIsMobile);
      if (nextIsMobile && wasDesktop) {
        setViewMode('list'); // switch to list view when going to mobile
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredListingsForMyProperties = useMemo(() => {
    if (!showMyPropertiesOnly) return [];
    const filtered = listingsToFilter.filter((item) => item.listingType === myPropertiesListingType);
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'size-large': return (b.sizeSqm || 0) - (a.sizeSqm || 0);
        case 'size-small': return (a.sizeSqm || 0) - (b.sizeSqm || 0);
        case 'newest':
        default: return new Date(b.datePosted || 0) - new Date(a.datePosted || 0);
      }
    });
  }, [showMyPropertiesOnly, listingsToFilter, myPropertiesListingType, sortBy]);

  const baseListForSchool = showMyPropertiesOnly ? filteredListingsForMyProperties : searchResults;
  const schoolFilteredListings = useMemo(() => {
    if (!selectedSchoolId) return [];
    const school = getSchoolById(selectedSchoolId);
    if (!school || !school.coordinates) return [];
    const { lat, lng } = school.coordinates;
    return baseListForSchool
      .filter((item) => item.coordinates && typeof item.coordinates === 'object' && typeof item.coordinates.lat === 'number' && typeof item.coordinates.lng === 'number')
      .map((item) => ({
        ...item,
        _distanceKm: haversineKm(lat, lng, item.coordinates.lat, item.coordinates.lng)
      }))
      .filter((item) => item._distanceKm <= SCHOOL_RADIUS_KM)
      .sort((a, b) => a._distanceKm - b._distanceKm);
  }, [baseListForSchool, selectedSchoolId]);

  const listingsForView = showMyPropertiesOnly
    ? (view === 'school' ? schoolFilteredListings : filteredListingsForMyProperties)
    : (view === 'school' ? schoolFilteredListings : searchResults);
  const visibleListings = listingsForView.slice(0, itemsToShow);

  useEffect(() => {
    if (showMyPropertiesOnly) setMyPropertiesListingType(listingType);
  }, [showMyPropertiesOnly]); // only when entering My Properties, sync to current tab

  useEffect(() => {
    if (location.state?.showMyProperties && (location.pathname === '/sale' || location.pathname === '/rent') && user) {
      navigate('/my-properties', { replace: true });
    }
  }, [location.state?.showMyProperties, location.pathname, user, navigate]);

  useEffect(() => {
    setItemsToShow(pageSize);
  }, [pageSize, listingsForView]);

  useEffect(() => {
    const handleScroll = () => {
      if (effectiveViewMode === 'map') return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;
      if (scrollPosition >= threshold) {
        setItemsToShow((prev) => Math.min(prev + pageSize, listingsForView.length));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [listingsForView.length, pageSize, effectiveViewMode]);

  const listingsByType = useMemo(
    () => listingsToFilter.filter((item) => item.listingType === effectiveListingTypeForMyProperties),
    [effectiveListingTypeForMyProperties, listingsToFilter]
  );
  const availableRegionIds = useMemo(
    () => getRegionIdsWithListings(listingsByType),
    [listingsByType]
  );
  const availableCityIds = useMemo(
    () => getCityIdsWithListings(listingsByType),
    [listingsByType]
  );
  const availableProvinces = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'all') return [];
    return getProvincesByRegion(selectedRegion).filter((prov) =>
      getCitiesByRegionAndProvince(selectedRegion, prov).some((c) => availableCityIds.includes(c.id))
    );
  }, [selectedRegion, availableCityIds]);

  useEffect(() => {
    if (selectedRegion !== 'all' && !availableRegionIds.includes(selectedRegion)) {
      setSelectedRegion('all');
      setSelectedProvince('');
      setSelectedCity('cebu-province');
    }
  }, [availableRegionIds, selectedRegion]);
  useEffect(() => {
    if (selectedProvince && !availableProvinces.includes(selectedProvince)) {
      setSelectedProvince('');
      setSelectedCity('cebu-province');
    }
  }, [availableProvinces, selectedProvince]);
  useEffect(() => {
    if (selectedCity !== 'cebu-province' && !availableCityIds.includes(selectedCity)) {
      setSelectedCity('cebu-province');
    }
  }, [availableCityIds, selectedCity]);

  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedProvince('');
    setSelectedCity('cebu-province');
  };

  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
    setSelectedCity('cebu-province');
  };

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleAdvancedFiltersChange = (filterType, value) => {
    if (filterType === 'minBeds') {
      setMinBeds(value);
    } else if (filterType === 'minBaths') {
      setMinBaths(value);
    } else if (filterType === 'sizeRange') {
      setSizeRange(value);
    }
  };

  const handleViewDetails = (index) => {
    const property = visibleListings[index];
    if (!property) return;
    addView(property.id);
    navigate(`/property/${property.id}`);
  };

  const handleOpenProperty = (property) => {
    addView(property.id);
    navigate(`/property/${property.id}`);
  };

  const handlePriceChange = (min, max) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  const currentFilterState = useMemo(
    () => ({
      listingType,
      propertyType,
      priceRangeIndex,
      priceMin,
      priceMax,
      selectedRegion,
      selectedProvince,
      selectedCity,
      searchQuery,
      furnishedFilter,
      minBeds,
      minBaths,
      sizeRange,
      sortBy
    }),
    [listingType, propertyType, priceRangeIndex, priceMin, priceMax, selectedRegion, selectedProvince, selectedCity, searchQuery, furnishedFilter, minBeds, minBaths, sizeRange, sortBy]
  );

  const applySavedSearchState = (state) => {
    navigate(state.listingType === 'rent' ? '/rent' : '/sale');
    setPropertyType(state.propertyType);
    setPriceRangeIndex(state.priceRangeIndex ?? 0);
    setPriceMin(state.priceMin ?? null);
    setPriceMax(state.priceMax ?? null);
    setSelectedRegion(state.selectedRegion);
    setSelectedProvince(state.selectedProvince ?? '');
    setSelectedCity(state.selectedCity);
    setSearchQuery(state.searchQuery);
    setFurnishedFilter(state.furnishedFilter ?? '');
    setMinBeds(state.minBeds);
    setMinBaths(state.minBaths);
    setSizeRange(state.sizeRange);
    setSortBy(state.sortBy);
  };


  const selectedCityData = getCityById(selectedCity);

  useEffect(() => {
    const openProperty = location.state?.openProperty;
    if (openProperty?.id) {
      navigate(`/property/${openProperty.id}`, { replace: true });
    }
  }, [location.state?.openProperty, navigate]);

  /* Restore filters: prefer currentResultsState for this listingType (in-page tweaks), else lastSearchState. Do not list currentResultsState in deps to avoid a loop with the persist effect. */
  useEffect(() => {
    const savedForTab = currentResultsState && currentResultsState[listingType];
    const source = (savedForTab?.listingType === listingType ? savedForTab : null) ?? lastSearchState;
    if (!hasSearched || !source || source.listingType !== listingType) {
      if (hasSearched) hasRestoredFiltersRef.current = true;
      return;
    }
    setPropertyType(source.propertyType ?? '');
    setPriceRangeIndex(source.priceRangeIndex ?? 0);
    setPriceMin(source.priceMin ?? null);
    setPriceMax(source.priceMax ?? null);
    setSelectedRegion(source.selectedRegion ?? 'all');
    setSelectedProvince(source.selectedProvince ?? '');
    setSelectedCity(source.selectedCity ?? 'cebu-province');
    setSearchQuery(source.searchQuery ?? '');
    setFurnishedFilter(source.furnishedFilter ?? '');
    setMinBeds(source.minBeds ?? 0);
    setMinBaths(source.minBaths ?? 0);
    setSizeRange(
      source.sizeRange && typeof source.sizeRange === 'object'
        ? { min: source.sizeRange.min ?? 0, max: source.sizeRange.max === undefined || source.sizeRange.max === null ? Infinity : source.sizeRange.max }
        : { min: 0, max: Infinity }
    );
    setSortBy(source.sortBy ?? 'newest');
    setSelectedSchoolId(source.selectedSchoolId ?? '');
    setViewMode(typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'grid');
    hasRestoredFiltersRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentResultsState intentionally omitted to avoid restore/persist loop
  }, [hasSearched, lastSearchState, listingType]);

  /* Persist current filters to context so they survive swipe navigation (skip first run to avoid overwriting before restore) */
  useEffect(() => {
    if (!hasSearched || !hasRestoredFiltersRef.current) return;
    setCurrentResultsStateForListing(listingType, {
      listingType,
      view: view === 'map' ? (lastSearchState?.view && lastSearchState.view !== 'map' ? lastSearchState.view : 'city') : view,
      propertyType,
      priceRangeIndex,
      priceMin,
      priceMax,
      selectedRegion,
      selectedProvince,
      selectedCity,
      searchQuery,
      furnishedFilter,
      minBeds,
      minBaths,
      sizeRange,
      sortBy,
      selectedSchoolId
    });
  }, [hasSearched, listingType, view, propertyType, priceRangeIndex, priceMin, priceMax, selectedRegion, selectedProvince, selectedCity, searchQuery, furnishedFilter, minBeds, minBaths, sizeRange, sortBy, selectedSchoolId, setCurrentResultsStateForListing]);


  return (
    <>
      <div className="App app-has-bottom-nav">
        <PageHeader
          title={showMyPropertiesOnly ? 'My properties' : (listingType === 'rent' ? 'For Rent' : 'For Sale')}
          onBack={() => navigate('/search')}
        />

        <div className={!isMobile ? 'app-layout-desktop' : ''}>
          <main className={`results-area ${!isMobile ? 'full' : ''}`}>
            {(() => {
              const content = (
                <>
            {hasSearched && !showMyPropertiesOnly && !searchLoading && searchError && (
              <div className="listings-error-banner" style={{ padding: '12px 16px', background: '#f8d7da', color: '#721c24', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span>{searchError}{baseUrl ? ` — API: ${baseUrl}` : ' — API: same origin'}</span>
                <button type="button" onClick={() => { const cityIdsFromRegion = selectedRegion && selectedRegion !== 'all' ? getCitiesByRegion(selectedRegion).map((c) => c.id).filter((id) => id !== 'cebu-province') : []; fetchSearchListings({ listingType, priceMin: effectivePriceMin, priceMax: effectivePriceMax, cityId: selectedCity && selectedCity !== 'cebu-province' ? selectedCity : undefined, cityIds: selectedCity === 'cebu-province' && cityIdsFromRegion.length > 0 ? cityIdsFromRegion : undefined, type: propertyType || undefined, furnished: furnishedFilter || undefined, minBeds: minBeds > 0 ? minBeds : undefined, minBaths: minBaths > 0 ? minBaths : undefined, sizeMin: sizeRange.min > 0 ? sizeRange.min : undefined, sizeMax: sizeRange.max !== Infinity && sizeRange.max > 0 ? sizeRange.max : undefined, q: searchQuery.trim() || undefined, sort: mapSortByToApiSort(sortBy) }); }} style={{ padding: '6px 14px', cursor: 'pointer', backgroundColor: '#721c24', color: '#fff', border: 'none', borderRadius: 4 }}>
                  Retry
                </button>
              </div>
            )}
            {showMyPropertiesOnly && !listingsLoading && listingsError && (
              <div className="listings-error-banner" style={{ padding: '12px 16px', background: '#f8d7da', color: '#721c24', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span>{listingsError}{baseUrl ? ` — API: ${baseUrl}` : ' — API: same origin'}</span>
                <button type="button" onClick={() => refreshListings()} style={{ padding: '6px 14px', cursor: 'pointer', backgroundColor: '#721c24', color: '#fff', border: 'none', borderRadius: 4 }}>
                  Retry
                </button>
              </div>
            )}
            {showMyPropertiesOnly && user && (
              <div className="my-properties-bar">
                <div className="my-properties-bar-top">
                  <span className="my-properties-bar-text"><i className="fas fa-house" aria-hidden></i>Showing only your properties</span>
                  <button
                    type="button"
                    className="my-properties-bar-back"
                    onClick={() => navigate(myPropertiesListingType === 'rent' ? '/rent' : '/sale')}
                  >
                    Show all properties
                  </button>
                </div>
                <div className="my-properties-bar-toggle-wrap">
                  <ListingTypeToggle
                    value={myPropertiesListingType}
                    onChange={setMyPropertiesListingType}
                  />
                </div>
              </div>
            )}
            {(hasSearched && !showMyPropertiesOnly && listingsForView.length > 0) && (
            <div className="results-filters-wrap">
              <div className="results-price-slider-wrap">
                <PriceSlider
                  {...(priceSliderConfig[effectiveListingTypeForMyProperties] || priceSliderConfig.sale)}
                  valueMin={priceMin ?? (priceRanges[effectiveListingTypeForMyProperties]?.[priceRangeIndex]?.min ?? 0)}
                  valueMax={priceMax ?? (priceRanges[effectiveListingTypeForMyProperties]?.[priceRangeIndex]?.max === Infinity ? (priceSliderConfig[effectiveListingTypeForMyProperties]?.max ?? 10000000) : (priceRanges[effectiveListingTypeForMyProperties]?.[priceRangeIndex]?.max ?? (priceSliderConfig[effectiveListingTypeForMyProperties]?.max ?? 10000000)))}
                  onChange={handlePriceChange}
                />
              </div>
              {hasSearched && (
                <>
                  <div className="results-advanced-filters-toggle-wrap">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none results-advanced-filters-toggle"
                      onClick={() => setShowAdvancedFilters((v) => !v)}
                      aria-expanded={showAdvancedFilters}
                      aria-controls="results-advanced-filters-panel"
                    >
                      <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-2`} aria-hidden />
                      Advanced Filters
                    </button>
                  </div>
                  {showAdvancedFilters && (
                    <div id="results-advanced-filters-panel" className="results-advanced-filters">
                      <label htmlFor="results-filter-beds" className="form-label results-advanced-filters-label">Min beds</label>
                      <select
                        id="results-filter-beds"
                        className="form-select form-select-sm results-advanced-filters-select"
                        value={minBeds}
                        onChange={(e) => setMinBeds(Number(e.target.value))}
                        aria-label="Minimum bedrooms"
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n === 4 ? '4+' : String(n)}</option>
                        ))}
                      </select>
                      <label htmlFor="results-filter-baths" className="form-label results-advanced-filters-label">Min baths</label>
                      <select
                        id="results-filter-baths"
                        className="form-select form-select-sm results-advanced-filters-select"
                        value={minBaths}
                        onChange={(e) => setMinBaths(Number(e.target.value))}
                        aria-label="Minimum bathrooms"
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n === 4 ? '4+' : String(n)}</option>
                        ))}
                      </select>
                      <label htmlFor="results-filter-type" className="form-label results-advanced-filters-label">Property type</label>
                      <select
                        id="results-filter-type"
                        className="form-select form-select-sm results-advanced-filters-select"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        aria-label="Property type"
                      >
                        <option value="">All</option>
                        <option value="House">House</option>
                        <option value="Condo">Condo</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Boarding House">Boarding House</option>
                        <option value="Room">Room</option>
                        <option value="Land">Land</option>
                      </select>
                      <label htmlFor="results-filter-furnished" className="form-label results-advanced-filters-label">Furnished</label>
                      <select
                        id="results-filter-furnished"
                        className="form-select form-select-sm results-advanced-filters-select"
                        value={furnishedFilter}
                        onChange={(e) => setFurnishedFilter(e.target.value)}
                        aria-label="Furnished"
                      >
                        <option value="">All</option>
                        <option value="furnished">Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                      <div className="results-advanced-filters-apply-wrap">
                        <button
                          type="button"
                          className="btn btn-primary results-advanced-filters-apply"
                          onClick={applyAdvancedFilters}
                          aria-label="Apply advanced filters"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            )}
            {(!hasSearched && !showMyPropertiesOnly) ? (
              <div className="search-now-empty">
                <i className="fas fa-search fa-3x text-muted mb-3" aria-hidden />
                <h4>Search now</h4>
                <p className="text-muted mb-4">Choose a search category on the home page and apply filters to see results.</p>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
                  Go to Home
                </button>
              </div>
            ) : (
            <>
            {!showMyPropertiesOnly && view === 'search' && (
              <div className="results-search-bar-wrap">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onClear={handleSearchClear}
                />
              </div>
            )}
            {!showMyPropertiesOnly && view === 'school' && (
              <div className="school-selector-wrap">
                <label htmlFor="school-select" className="school-selector-label">Near school or university</label>
                <select
                  id="school-select"
                  className="form-select school-selector-select"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  aria-label="Select school or university"
                >
                  <option value="">Select a school...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <SortBar
              sortBy={sortBy}
              viewMode={effectiveViewMode}
              onSortChange={setSortBy}
              onViewModeChange={(mode) => {
                setViewMode(mode);
                if (view === 'map' && mode !== 'map') navigate(location.pathname);
              }}
              totalResults={listingsForView.length}
              isMyProperties={showMyPropertiesOnly && !!user}
            />

            {effectiveViewMode !== 'map' && !showMyPropertiesOnly && recentListings.length > 0 && (
              <section className="recently-viewed-section" aria-label="Recently viewed properties">
                <h3 className="recently-viewed-title">Recently viewed</h3>
                <div className="recently-viewed-scroll">
                  {recentListings.map((property) => (
                    <RecentlyViewedCard
                      key={property.id}
                      property={property}
                      onClick={handleOpenProperty}
                    />
                  ))}
                </div>
              </section>
            )}

            {effectiveViewMode === 'map' ? (
              <MapView
                properties={listingsForView}
                selectedCity={selectedCityData}
                onPropertyClick={(index) => {
                  const property = listingsForView[index];
                  if (property) {
                    addView(property.id);
                    navigate(`/property/${property.id}`);
                  }
                }}
              />
            ) : (
              <section
                className={`listing-grid ${effectiveViewMode === 'list' ? 'list-view' : ''}`}
                id="listingArea"
              >
                {visibleListings.map((property, index) =>
                  effectiveViewMode === 'list' ? (
                    <PropertyListCard
                      key={property.id || `property-${index}`}
                      property={property}
                      index={index}
                      onViewDetails={handleViewDetails}
                    />
                  ) : (
                    <PropertyCard
                      key={property.id || `property-${index}`}
                      property={property}
                      index={index}
                      onViewDetails={handleViewDetails}
                    />
                  )
                )}
              </section>
            )}

            {effectiveViewMode !== 'map' && itemsToShow < listingsForView.length && (
              <div className="text-center py-4">
                <div className="loading-more">Loading more properties...</div>
              </div>
            )}

            {!showMyPropertiesOnly && hasSearched && searchLoading && (
              <div className="text-center py-5">
                <div className="loading-more">Loading results...</div>
              </div>
            )}
            {listingsForView.length === 0 && !(hasSearched && !showMyPropertiesOnly && searchLoading) && (
              <div className="text-center py-5">
                {showMyPropertiesOnly ? (
                  <>
                    <i className="fas fa-house fa-3x text-muted mb-3" aria-hidden />
                    <h4>No {myPropertiesListingType === 'rent' ? 'rental' : 'sale'} listings</h4>
                    <p className="text-muted">You have no properties listed for {myPropertiesListingType === 'rent' ? 'rent' : 'sale'} yet. Add one to get started.</p>
                    <button type="button" className="btn btn-primary mt-2" onClick={() => navigate('/add-property')}>
                      Add property
                    </button>
                  </>
                ) : view === 'school' && !selectedSchoolId ? (
                  <>
                    <i className="fas fa-school fa-3x text-muted mb-3" aria-hidden />
                    <h4>Nearby properties</h4>
                    <p className="text-muted">Select a school or university above to see properties within 10 km.</p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-search fa-3x text-muted mb-3" aria-hidden />
                    <h4>No properties found</h4>
                    <p className="text-muted">Try adjusting your filters to see more results.</p>
                  </>
                )}
              </div>
            )}
            </>
            )}
            </>);
              return isMobile ? <PullToRefresh onRefresh={refreshListings} disabled={(showMyPropertiesOnly ? listingsLoading : searchLoading) || isSliding}>{content}</PullToRefresh> : content;
            })()}
          </main>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <div className="app-root">
      <div className="app-root-inner">
    <ErrorBoundary>
      <AuthProvider>
        <ListingsProvider>
          <UserListingsProvider>
            <ChatProvider>
              <FavoritesProvider>
                <RecentlyViewedProvider>
                  <SavedSearchesProvider>
                    <BrowserRouter>
                      <BackButtonHandler />
                      <PushProvider>
                        <PushTokenHandler />
                        <LoginModalProvider>
                          <ChatModalProvider>
                          <SearchProvider>
                          <PropertyModalProvider>
                          <Routes>
                            <Route path="/" element={<SliderDragProvider><MainLayout /></SliderDragProvider>}>
                              <Route index element={<HomePage />} />
                              <Route path="search" element={<SearchPage />} />
                              <Route path="search/city" element={<SearchCityPage />} />
                              <Route path="search/keyword" element={<SearchKeywordPage />} />
                              <Route path="search/map" element={<SearchMapPage />} />
                              <Route path="search/school" element={<SearchSchoolPage />} />
                              <Route path="sale" element={<AppContent />} />
                              <Route path="rent" element={<AppContent />} />
                              <Route path="my-properties" element={<AppContent />} />
                              <Route path="saved" element={<SavedPage />} />
                              <Route path="messages" element={<MessagesPage />} />
                              <Route path="property/:id" element={<PropertyPage />} />
                              <Route path="chat/:threadId" element={<ChatPage />} />
                              <Route path="menu" element={<MenuPage />} />
                              <Route path="profile" element={<ProfilePage />} />
                              <Route path="settings" element={<SettingsPage />} />
                              <Route path="add-property" element={<AddPropertyPage />} />
                              <Route path="add-property/:id" element={<AddPropertyPage />} />
                              <Route path="admin" element={<AdminRoute />} />
                              <Route path="confirm-email" element={<ConfirmEmailPage />} />
                            </Route>
                          </Routes>
                          </PropertyModalProvider>
                          </SearchProvider>
                          </ChatModalProvider>
                        </LoginModalProvider>
                      </PushProvider>
                    </BrowserRouter>
                  </SavedSearchesProvider>
                </RecentlyViewedProvider>
              </FavoritesProvider>
            </ChatProvider>
          </UserListingsProvider>
        </ListingsProvider>
      </AuthProvider>
    </ErrorBoundary>
      </div>
    </div>
    </ThemeProvider>
  );
}
