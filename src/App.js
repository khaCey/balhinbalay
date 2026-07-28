import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import PropertyCard from './components/PropertyCard';
import PropertyListCard from './components/PropertyListCard';
import SortBar from './components/SortBar';
import ListingTypeToggle from './components/ListingTypeToggle';
import PriceSlider from './components/PriceSlider';
import MapView from './components/MapView';
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
import { PropertyModalProvider } from './context/PropertyModalContext';
import { ThemeProvider } from './context/ThemeContext';
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
  getCityIdsWithListings,
  philippineRegions
} from './data/cities';
import { schools, getSchoolById } from './data/schools';
import { haversineKm } from './utils/distance';
import { clampPriceRange } from './utils/priceSliderRange';
import { formatSearchPriceRangeLine } from './utils/searchCriteriaFormat';
import { trackPageView } from './utils/analytics';
import AdminPage from './pages/AdminPage/index';
import ProfilePage from './pages/ProfilePage/index';
import SettingsPage from './pages/SettingsPage/index';
import AddPropertyPage from './pages/AddPropertyPage/index';
import ConfirmEmailPage from './pages/ConfirmEmailPage/index';
import SavedPage from './pages/SavedPage/index';
import MessagesPage from './pages/MessagesPage/index';
import PropertyPage from './pages/PropertyPage/index';
import ChatPage from './pages/ChatPage/index';
import HomePage from './pages/HomePage/index';
import SearchPage from './pages/SearchPage/index';
import SearchMapPage from './pages/SearchMapPage/index';
import MenuPage from './pages/MenuPage/index';
import MinimalFilterChips from './components/minimal/MinimalFilterChips';
import Seo from './components/Seo';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from './seo/siteSeo';
import './App.css';
import './styles/minimal-marketplace.css';
import './styles/map-search-page.css';
import './styles/prototype-palette.css';

function AdminRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminPage />;
}

function LegacySearchRedirect({ mode }) {
  const [params] = useSearchParams();
  const listingType = params.get('listingType') === 'rent' ? 'rent' : 'sale';
  return <Navigate to={`/search?listingType=${listingType}&mode=${mode}&edit=1`} replace />;
}

function AppContent() {
  const { user } = useAuth();
  const { listings: apiListings, loading: listingsLoading, error: listingsError, refreshListings, searchResults, searchLoading, searchError, fetchSearchListings } = useListings();
  const { addView } = useRecentlyViewed();
  const [myPropertiesListingType, setMyPropertiesListingType] = useState('sale');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewFromUrl = searchParams.get('view') || '';
  const { hasSearched, lastSearchState, currentResultsState, setCurrentResultsStateForListing } = useSearch();
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
  const [selectedCityIds, setSelectedCityIds] = useState([]);
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
  const searchedResultsMode = (!showMyPropertiesOnly && hasSearched) ? 'list' : effectiveViewMode;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const pageSize = isMobile ? 6 : 9;
  const [itemsToShow, setItemsToShow] = useState(pageSize);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const closeFiltersModal = useCallback(() => setShowAdvancedFilters(false), []);

  useEffect(() => {
    if (!showAdvancedFilters) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeFiltersModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showAdvancedFilters, closeFiltersModal]);

  useEffect(() => {
    const fullPath = `${location.pathname}${location.search || ''}`;
    let listingContext = '';
    if (location.pathname === '/sale' || location.pathname === '/rent') {
      listingContext = location.pathname.slice(1);
    } else if (location.pathname.startsWith('/property/')) {
      listingContext = 'property';
    } else if (location.pathname.startsWith('/search')) {
      listingContext = 'search';
    }
    trackPageView({
      path: fullPath,
      title: document.title,
      listingContext
    });
  }, [location.pathname, location.search]);
  const prevWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 768);
  const hasRestoredFiltersRef = useRef(false);
  const resultsAreaRef = useRef(null);

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
      case 'recommended': return 'newest';
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
  const requestedCityParams = useMemo(() => {
    const explicitCityIds = Array.from(new Set(
      (Array.isArray(selectedCityIds) ? selectedCityIds : [])
        .filter((cityId) => cityId && cityId !== 'cebu-province')
    ));
    if (explicitCityIds.length === 1) return { cityId: explicitCityIds[0] };
    if (explicitCityIds.length > 1) return { cityIds: explicitCityIds };
    if (selectedCity && selectedCity !== 'cebu-province') return { cityId: selectedCity };

    const cityIdsFromRegion = selectedRegion && selectedRegion !== 'all'
      ? getCitiesByRegion(selectedRegion).map((city) => city.id).filter((cityId) => cityId !== 'cebu-province')
      : [];
    return cityIdsFromRegion.length > 0 ? { cityIds: cityIdsFromRegion } : {};
  }, [selectedCityIds, selectedCity, selectedRegion]);

  const applyAdvancedFilters = useCallback(() => {
    if (!hasSearched || showMyPropertiesOnly) return;
    fetchSearchListings({
      listingType,
      priceMin: effectivePriceMin,
      priceMax: effectivePriceMax,
      ...requestedCityParams,
      type: propertyType || undefined,
      furnished: furnishedFilter || undefined,
      minBeds: minBeds > 0 ? minBeds : undefined,
      minBaths: minBaths > 0 ? minBaths : undefined,
      sizeMin: sizeRange.min > 0 ? sizeRange.min : undefined,
      sizeMax: sizeRange.max !== Infinity && sizeRange.max > 0 ? sizeRange.max : undefined,
      q: searchQuery.trim() || undefined,
      sort: mapSortByToApiSort(sortBy)
    });
  }, [hasSearched, showMyPropertiesOnly, fetchSearchListings, listingType, effectivePriceMin, effectivePriceMax, requestedCityParams, propertyType, furnishedFilter, minBeds, minBaths, sizeRange.min, sizeRange.max, searchQuery, sortBy]);

  useEffect(() => {
    if (!hasSearched || showMyPropertiesOnly) return;
    fetchSearchListings({
      listingType,
      priceMin: effectivePriceMin,
      priceMax: effectivePriceMax,
      ...requestedCityParams,
      type: propertyType || undefined,
      furnished: furnishedFilter || undefined,
      minBeds: minBeds > 0 ? minBeds : undefined,
      minBaths: minBaths > 0 ? minBaths : undefined,
      sizeMin: sizeRange.min > 0 ? sizeRange.min : undefined,
      sizeMax: sizeRange.max !== Infinity && sizeRange.max > 0 ? sizeRange.max : undefined,
      q: searchQuery.trim() || undefined,
      sort: mapSortByToApiSort(sortBy)
    });
  }, [hasSearched, showMyPropertiesOnly, fetchSearchListings, listingType, effectivePriceMin, effectivePriceMax, requestedCityParams, searchQuery, sortBy]);

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
        case 'recommended':
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
    if (showMyPropertiesOnly || hasSearched) return;
    if (location.pathname !== '/sale' && location.pathname !== '/rent') return;
    const listing = location.pathname === '/rent' ? 'rent' : 'sale';
    navigate(`/search?listingType=${listing}&edit=1`, { replace: true });
  }, [location.pathname, hasSearched, showMyPropertiesOnly, navigate]);

  useEffect(() => {
    setItemsToShow(pageSize);
  }, [pageSize, listingsForView.length]);

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (effectiveViewMode === 'map') return;
      const container = resultsAreaRef.current;
      if (!container) return;
      const scrollPosition = container.scrollTop + container.clientHeight;
      const threshold = container.scrollHeight - 300;
      if (scrollPosition >= threshold) {
        setItemsToShow((prev) => Math.min(prev + pageSize, listingsForView.length));
      }
    };

    const container = resultsAreaRef.current;
    if (!container) return undefined;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
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
    if (selectedCityIds.length > 0) return;
    if (selectedRegion !== 'all' && !availableRegionIds.includes(selectedRegion)) {
      setSelectedRegion('all');
      setSelectedProvince('');
      setSelectedCity('cebu-province');
      setSelectedCityIds([]);
    }
  }, [availableRegionIds, selectedRegion, selectedCityIds.length]);
  useEffect(() => {
    if (selectedCityIds.length > 0) return;
    if (selectedProvince && !availableProvinces.includes(selectedProvince)) {
      setSelectedProvince('');
      setSelectedCity('cebu-province');
      setSelectedCityIds([]);
    }
  }, [availableProvinces, selectedProvince, selectedCityIds.length]);
  useEffect(() => {
    if (selectedCityIds.length > 0) return;
    if (selectedCity !== 'cebu-province' && !availableCityIds.includes(selectedCity)) {
      setSelectedCity('cebu-province');
      setSelectedCityIds([]);
    }
  }, [availableCityIds, selectedCity, selectedCityIds.length]);

  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedProvince('');
    setSelectedCity('cebu-province');
    setSelectedCityIds([]);
  };

  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
    setSelectedCity('cebu-province');
    setSelectedCityIds([]);
  };

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setSelectedCityIds(cityId && cityId !== 'cebu-province' ? [cityId] : []);
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
    navigate(`/property/${property.id}`, { state: { from: `${location.pathname}${location.search || ''}` } });
  };

  const handlePriceChange = (min, max) => {
    const cfg = priceSliderConfig[effectiveListingTypeForMyProperties] || priceSliderConfig.sale;
    const { minVal, maxVal } = clampPriceRange(min, max, cfg.min, cfg.max, cfg.step);
    setPriceMin(minVal);
    setPriceMax(maxVal);
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
      selectedCityIds,
      searchQuery,
      furnishedFilter,
      minBeds,
      minBaths,
      sizeRange,
      sortBy
    }),
    [listingType, propertyType, priceRangeIndex, priceMin, priceMax, selectedRegion, selectedProvince, selectedCity, selectedCityIds, searchQuery, furnishedFilter, minBeds, minBaths, sizeRange, sortBy]
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
    setSelectedCityIds(
      Array.isArray(state.selectedCityIds)
        ? state.selectedCityIds
        : (state.selectedCity && state.selectedCity !== 'cebu-province' ? [state.selectedCity] : [])
    );
    setSearchQuery(state.searchQuery);
    setFurnishedFilter(state.furnishedFilter ?? '');
    setMinBeds(state.minBeds);
    setMinBaths(state.minBaths);
    setSizeRange(state.sizeRange);
    setSortBy(state.sortBy ?? 'newest');
  };

  const selectedCitiesData = useMemo(
    () => (Array.isArray(selectedCityIds) ? selectedCityIds : [])
      .map((cityId) => getCityById(cityId))
      .filter(Boolean),
    [selectedCityIds]
  );
  const selectedCityData = getCityById(selectedCity);
  const mapFocusCityData = selectedCityData?.id !== 'cebu-province'
    ? selectedCityData
    : (selectedCitiesData[0] || selectedCityData);
  const selectedRegionData = philippineRegions.find((region) => region.id === selectedRegion) || null;
  const selectedSchool = selectedSchoolId ? getSchoolById(selectedSchoolId) : null;
  const sliderMaxForCriteria = priceSliderConfig[listingType]?.max ?? 10000000;

  const criteriaProvinceCity = useMemo(() => {
    if (showMyPropertiesOnly) return '';
    if (view === 'school' && selectedSchool?.name) {
      return `Near school – ${selectedSchool.name}`;
    }
    if ((view === 'keyword' || view === 'search') && searchQuery.trim()) {
      return `Keyword – ${searchQuery.trim()}`;
    }
    if (selectedCitiesData.length > 1) {
      return `${selectedCitiesData[0].displayName} + ${selectedCitiesData.length - 1} more`;
    }
    if (selectedCitiesData.length === 1) {
      const city = selectedCitiesData[0];
      return city.province ? `${city.province} – ${city.displayName}` : city.displayName;
    }
    if (selectedCityData) {
      const province = selectedCityData.province || '';
      const city = selectedCityData.displayName || '';
      if (province && city) return `${province} – ${city}`;
    }
    if (selectedRegionData && selectedRegion !== 'all') {
      return `${selectedRegionData.displayName} – All cities`;
    }
    return listingType === 'rent' ? 'Philippines – All rentals' : 'Philippines – All sales';
  }, [
    showMyPropertiesOnly,
    view,
    selectedSchool?.name,
    searchQuery,
    selectedCitiesData,
    selectedCityData,
    selectedRegionData,
    selectedRegion,
    listingType
  ]);

  const criteriaPriceLabel = useMemo(
    () => formatSearchPriceRangeLine(effectivePriceMin, effectivePriceMax, listingType, sliderMaxForCriteria),
    [effectivePriceMin, effectivePriceMax, listingType, sliderMaxForCriteria]
  );

  const quickFilterChips = [
    { id: 'mode', label: listingType === 'rent' ? 'Rent' : 'Buy' },
    { id: 'price', label: 'Price' },
    { id: 'type', label: 'Property type' },
    { id: 'beds', label: 'Beds' },
    { id: 'more', label: 'More' }
  ];

  const isPublicResultsRoute = !showMyPropertiesOnly && (location.pathname === '/sale' || location.pathname === '/rent');
  const resultsRoutePath = listingType === 'rent' ? '/rent' : '/sale';
  const publicLocationLabel = useMemo(() => {
    if (view === 'school' && selectedSchool?.name) return selectedSchool.name;
    if (selectedCitiesData.length > 1) return `${selectedCitiesData[0].displayName} + ${selectedCitiesData.length - 1} more`;
    if (selectedCitiesData.length === 1) return selectedCitiesData[0].displayName;
    if (selectedCityData && selectedCityData.id !== 'cebu-province') return selectedCityData.displayName;
    if (selectedRegionData && selectedRegion !== 'all') return selectedRegionData.displayName;
    return '';
  }, [view, selectedSchool?.name, selectedCitiesData, selectedCityData, selectedRegionData, selectedRegion]);
  const resultsTitle = useMemo(() => {
    const base = listingType === 'rent' ? 'For Rent Properties' : 'For Sale Properties';
    return publicLocationLabel ? `${base} in ${publicLocationLabel}` : `${base} in the Philippines`;
  }, [listingType, publicLocationLabel]);
  const resultsDescription = useMemo(() => {
    const modeLabel = listingType === 'rent' ? 'rental' : 'for-sale';
    const countPart = hasSearched ? `${listingsForView.length} ${modeLabel} listing${listingsForView.length === 1 ? '' : 's'} found.` : '';
    const locationPart = publicLocationLabel ? `Browse ${modeLabel} properties in ${publicLocationLabel}.` : `Browse ${modeLabel} properties across the Philippines.`;
    const criteriaPart = hasSearched ? `${criteriaPriceLabel}.` : 'Use filters to refine by price, beds, baths, and property type.';
    return [countPart, locationPart, criteriaPart].filter(Boolean).join(' ');
  }, [listingType, hasSearched, listingsForView.length, publicLocationLabel, criteriaPriceLabel]);
  const resultsJsonLd = useMemo(() => {
    if (!isPublicResultsRoute) return null;
    const itemListElement = listingsForView.slice(0, 20).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: toAbsoluteUrl(`/property/${listing.id}`),
      name: listing.title || `${listing.type || 'Property'} listing`,
      item: {
        '@type': 'Offer',
        price: Number(listing.price) || 0,
        priceCurrency: 'PHP',
        availability: listing.sold || listing.currentlyRented ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        url: toAbsoluteUrl(`/property/${listing.id}`)
      }
    }));
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: resultsTitle,
        description: resultsDescription,
        url: toAbsoluteUrl(resultsRoutePath)
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: toAbsoluteUrl('/')
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: listingType === 'rent' ? 'For Rent' : 'For Sale',
            item: toAbsoluteUrl(resultsRoutePath)
          }
        ]
      },
      itemListElement.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${listingType === 'rent' ? 'Rental' : 'Sale'} listings`,
            itemListElement
          }
        : null
    ];
  }, [isPublicResultsRoute, listingsForView, resultsTitle, resultsDescription, resultsRoutePath, listingType]);
  const shouldNoindexResultsPage = isPublicResultsRoute && view === 'map';

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
    setSelectedCityIds(
      Array.isArray(source.selectedCityIds)
        ? source.selectedCityIds
        : (source.selectedCity && source.selectedCity !== 'cebu-province' ? [source.selectedCity] : [])
    );
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
      selectedCityIds,
      searchQuery,
      furnishedFilter,
      minBeds,
      minBaths,
      sizeRange,
      sortBy,
      selectedSchoolId
    });
  }, [hasSearched, listingType, view, propertyType, priceRangeIndex, priceMin, priceMax, selectedRegion, selectedProvince, selectedCity, selectedCityIds, searchQuery, furnishedFilter, minBeds, minBaths, sizeRange, sortBy, selectedSchoolId, setCurrentResultsStateForListing]);


  return (
    <>
      {isPublicResultsRoute && (
        <Seo
          title={resultsTitle}
          description={resultsDescription}
          canonicalPath={resultsRoutePath}
          ogTitle={resultsTitle}
          ogDescription={resultsDescription}
          ogImage={DEFAULT_OG_IMAGE_PATH}
          noindex={shouldNoindexResultsPage}
          jsonLd={resultsJsonLd}
          jsonLdId="seo-results-json-ld"
        />
      )}
      <div className={`App ${isMobile ? 'app-has-bottom-nav' : ''}`}>
        {!(isMobile && hasSearched && !showMyPropertiesOnly) && (
          <PageHeader
            title={showMyPropertiesOnly ? 'My properties' : (listingType === 'rent' ? 'For Rent' : 'For Sale')}
            onBack={() => navigate(`/search?listingType=${listingType}&edit=1`)}
          />
        )}

        <div className={!isMobile ? 'app-layout-desktop' : ''}>
          <main
            ref={resultsAreaRef}
            className={`results-area ${!isMobile ? 'full' : ''} ${!showMyPropertiesOnly && hasSearched ? 'minimal-results-shell' : ''}`}
          >
            {(() => {
              const content = (
                <>
            {hasSearched && !showMyPropertiesOnly && !searchLoading && searchError && (
              <div className="listings-error-banner">
                <span>{searchError}{baseUrl ? ` — API: ${baseUrl}` : ' — API: same origin'}</span>
                <button type="button" className="listings-error-banner-btn" onClick={() => fetchSearchListings({ listingType, priceMin: effectivePriceMin, priceMax: effectivePriceMax, ...requestedCityParams, type: propertyType || undefined, furnished: furnishedFilter || undefined, minBeds: minBeds > 0 ? minBeds : undefined, minBaths: minBaths > 0 ? minBaths : undefined, sizeMin: sizeRange.min > 0 ? sizeRange.min : undefined, sizeMax: sizeRange.max !== Infinity && sizeRange.max > 0 ? sizeRange.max : undefined, q: searchQuery.trim() || undefined, sort: mapSortByToApiSort(sortBy) })}>
                  Retry
                </button>
              </div>
            )}
            {showMyPropertiesOnly && !listingsLoading && listingsError && (
              <div className="listings-error-banner">
                <span>{listingsError}{baseUrl ? ` — API: ${baseUrl}` : ' — API: same origin'}</span>
                <button type="button" className="listings-error-banner-btn" onClick={() => refreshListings()}>
                  Retry
                </button>
              </div>
            )}
            {showMyPropertiesOnly && user && (
              <div className="my-properties-bar">
                <div className="my-properties-bar-toggle-wrap">
                  <ListingTypeToggle
                    value={myPropertiesListingType}
                    onChange={setMyPropertiesListingType}
                  />
                </div>
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
            {!showMyPropertiesOnly && hasSearched ? (
              <>
              <section className="results-portal-block results-portal-summary minimal-results-shell" aria-label="Search summary">
                <div className="minimal-results-header">
                  <div className="minimal-results-topline">
                    <button type="button" className="minimal-results-back" onClick={() => navigate(`/search?listingType=${listingType}&edit=1`)}>
                      <i className="fas fa-arrow-left" aria-hidden />
                    </button>
                    <strong>Search results</strong>
                    <button type="button" className="minimal-results-map-btn" onClick={() => navigate(`/search/map?listingType=${listingType}`)}>
                      <i className="fas fa-map" aria-hidden /> Map
                    </button>
                  </div>
                  <button
                    type="button"
                    className="prototype-results-search"
                    onClick={() => setShowAdvancedFilters(true)}
                    aria-expanded={showAdvancedFilters}
                    aria-haspopup="dialog"
                    aria-controls="results-advanced-filters-panel"
                  >
                    <i className="fas fa-search" aria-hidden />
                    <span>{criteriaProvinceCity}</span>
                    <i className="fas fa-sliders-h" aria-hidden />
                  </button>
                  <MinimalFilterChips
                    chips={quickFilterChips}
                    onSelect={() => setShowAdvancedFilters(true)}
                    activeId="mode"
                  />
                </div>
                <div className="minimal-results-body">
                  <div className="minimal-results-meta-row">
                    <p className="minimal-results-count">{listingsForView.length.toLocaleString()} results</p>
                    <select
                      className="prototype-results-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort results"
                    >
                      <option value="newest">Newest first</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                      <option value="size-large">Size: large first</option>
                      <option value="size-small">Size: small first</option>
                    </select>
                  </div>
                </div>
              </section>

                {searchedResultsMode === 'map' ? (
                  <MapView
                    properties={listingsForView}
                    selectedCity={mapFocusCityData}
                    onPropertyClick={(index) => {
                      const property = listingsForView[index];
                      if (property) {
                        addView(property.id);
                        navigate(`/property/${property.id}`, { state: { from: `${location.pathname}${location.search || ''}` } });
                      }
                    }}
                  />
                ) : (
                  <section
                    className={`listing-grid ${searchedResultsMode === 'list' ? 'list-view' : ''}`}
                    id="listingArea"
                  >
                    {visibleListings.map((property, index) =>
                      searchedResultsMode === 'list' ? (
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

                {searchedResultsMode !== 'map' && itemsToShow < listingsForView.length && (
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
                    {view === 'school' && !selectedSchoolId ? (
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
              {showAdvancedFilters &&
                createPortal(
                  <div
                    className="modal auth-modal filters-modal fade show"
                    style={{ display: 'block' }}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="filters-modal-title"
                  >
                    <div className="modal-backdrop fade show" onClick={closeFiltersModal} aria-hidden />
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg modal-fullscreen-md-down filters-modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h2 id="filters-modal-title" className="modal-title">
                            Filters
                          </h2>
                          <button type="button" className="modal-close-btn" onClick={closeFiltersModal} aria-label="Close">
                            <i className="fas fa-times" aria-hidden />
                          </button>
                        </div>
                        <div className="modal-body filters-modal-body">
                          <div id="results-advanced-filters-panel" className="results-filters-wrap results-filters-wrap--modal">
                            {(view === 'keyword' || view === 'search') && (
                              <div className="results-search-bar-wrap">
                                <SearchBar
                                  searchQuery={searchQuery}
                                  onSearchChange={handleSearchChange}
                                  onClear={handleSearchClear}
                                />
                              </div>
                            )}

                            {view === 'school' && (
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

                            <div className="results-price-slider-wrap">
                              <PriceSlider
                                {...(priceSliderConfig[effectiveListingTypeForMyProperties] || priceSliderConfig.sale)}
                                valueMin={priceMin ?? (priceRanges[effectiveListingTypeForMyProperties]?.[priceRangeIndex]?.min ?? 0)}
                                valueMax={priceMax ?? (priceRanges[effectiveListingTypeForMyProperties]?.[priceRangeIndex]?.max === Infinity ? (priceSliderConfig[effectiveListingTypeForMyProperties]?.max ?? 10000000) : (priceRanges[effectiveListingTypeForMyProperties]?.[priceRangeIndex]?.max ?? (priceSliderConfig[effectiveListingTypeForMyProperties]?.max ?? 10000000)))}
                                onChange={handlePriceChange}
                              />
                            </div>

                            <div className="results-filters-header">
                              <h3 className="results-filters-title">More filters</h3>
                            </div>

                            <div className="results-advanced-filters">
                              <label htmlFor="results-filter-beds" className="form-label results-advanced-filters-label">
                                <i className="fas fa-bed me-1" aria-hidden />
                                Min bedrooms
                              </label>
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
                              <label htmlFor="results-filter-baths" className="form-label results-advanced-filters-label">
                                <i className="fas fa-bath me-1" aria-hidden />
                                Min bathrooms
                              </label>
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
                                  onClick={() => {
                                    applyAdvancedFilters();
                                    closeFiltersModal();
                                  }}
                                  aria-label="Apply advanced filters"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </>
            ) : (
              <SortBar
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={listingsForView.length}
                isMyProperties={showMyPropertiesOnly && !!user}
              />
            )}

            {(!hasSearched || showMyPropertiesOnly) && (
              <>
                {effectiveViewMode === 'map' ? (
                  <MapView
                    properties={listingsForView}
                    selectedCity={mapFocusCityData}
                    onPropertyClick={(index) => {
                      const property = listingsForView[index];
                      if (property) {
                        addView(property.id);
                        navigate(`/property/${property.id}`, { state: { from: `${location.pathname}${location.search || ''}` } });
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

                {listingsForView.length === 0 && !(hasSearched && !showMyPropertiesOnly && searchLoading) && showMyPropertiesOnly && (
                  <div className="text-center py-5">
                    <i className="fas fa-house fa-3x text-muted mb-3" aria-hidden />
                    <h4>No {myPropertiesListingType === 'rent' ? 'rental' : 'sale'} listings</h4>
                    <p className="text-muted">You have no properties listed for {myPropertiesListingType === 'rent' ? 'rent' : 'sale'} yet. Add one to get started.</p>
                    <button type="button" className="btn btn-primary mt-2" onClick={() => navigate('/add-property')}>
                      Add property
                    </button>
                  </div>
                )}
              </>
            )}
            </>
            )}
            </>);
              return content;
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
                      <PushProvider>
                        <PushTokenHandler />
                        <LoginModalProvider>
                          <ChatModalProvider>
                          <SearchProvider>
                          <PropertyModalProvider>
                          <BackButtonHandler />
                          <Routes>
                            <Route path="/" element={<MainLayout />}>
                              <Route index element={<HomePage />} />
                              <Route path="search" element={<SearchPage />} />
                              <Route path="search/city" element={<LegacySearchRedirect mode="city" />} />
                              <Route path="search/keyword" element={<LegacySearchRedirect mode="keyword" />} />
                              <Route path="search/map" element={<SearchMapPage />} />
                              <Route path="map" element={<SearchMapPage />} />
                              <Route path="search/school" element={<LegacySearchRedirect mode="school" />} />
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
