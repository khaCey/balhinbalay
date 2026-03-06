import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, NavLink } from 'react-router-dom';
import FilterSidebar from './components/FilterSidebar';
import PropertyCard from './components/PropertyCard';
import PropertyListCard from './components/PropertyListCard';
import RecentlyViewedCard from './components/RecentlyViewedCard';
import PropertyModal from './components/PropertyModal';
import SortBar from './components/SortBar';
import MapView from './components/MapView';
import ConfirmModal from './components/ConfirmModal';
import { LoginModalProvider, useLoginModal } from './context/LoginModalContext';
import ChatModal from './components/ChatModal';
import ErrorBoundary from './components/ErrorBoundary';
import MessagesModal from './components/MessagesModal';
import FavoritesModal from './components/FavoritesModal';
import ProfileDrawer from './components/ProfileDrawer';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { RecentlyViewedProvider, useRecentlyViewed } from './context/RecentlyViewedContext';
import { SavedSearchesProvider } from './context/SavedSearchesContext';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ListingsProvider, useListings } from './context/ListingsContext';
import { UserListingsProvider, useUserListings } from './context/UserListingsContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { priceRanges } from './data/listings';
import {
  getCityById,
  getCitiesByRegion,
  getCitiesByRegionAndProvince,
  getProvincesByRegion,
  getRegionIdsWithListings,
  getCityIdsWithListings
} from './data/cities';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AddPropertyPage from './pages/AddPropertyPage';
import './App.css';

function AdminRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminPage />;
}

function AppContent() {
  const { user, logout } = useAuth();
  const { openLogin } = useLoginModal();
  const { listings: apiListings, loading: listingsLoading, error: listingsError, refreshListings } = useListings();
  const { deleteListing } = useUserListings();
  const { favorites } = useFavorites();
  const { recentIds, addView } = useRecentlyViewed();
  const { getThreads } = useChat();
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatProperty, setChatProperty] = useState(null);
  const [chatThreadId, setChatThreadId] = useState(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [showMyPropertiesOnly, setShowMyPropertiesOnly] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const listingType = location.pathname === '/rent' ? 'rent' : 'sale';
  const [propertyType, setPropertyType] = useState('');
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('cebu-province');
  const [searchQuery, setSearchQuery] = useState('');
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [sizeRange, setSizeRange] = useState({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'grid'
  );
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pageSize = isMobile ? 6 : 9;
  const [itemsToShow, setItemsToShow] = useState(pageSize);
  const prevWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 768);

  const allListings = useMemo(
    () => (Array.isArray(apiListings) ? apiListings : []),
    [apiListings]
  );
  const favoriteListings = useMemo(
    () => allListings.filter((l) => favorites.includes(l.id)),
    [allListings, favorites]
  );
  const listingsToFilter = useMemo(() => {
    if (showMyPropertiesOnly && user) return allListings.filter((l) => l.ownerId === user.id);
    return allListings;
  }, [allListings, showMyPropertiesOnly, user]);

  const messagesPillData = useMemo(() => {
    try {
      const raw = getThreads();
      const threads = Array.isArray(raw) ? raw : [];
      const list = Array.isArray(allListings) ? allListings : [];
      const listings = threads
        .map((t) => list.find((l) => l.id === t.listingId))
        .filter(Boolean);
      const count = threads
        .filter((t) => list.some((l) => l.id === t.listingId))
        .reduce((sum, t) => sum + (t.unreadCount || 0), 0);
      return { count, recent: listings.slice(0, 3) };
    } catch (e) {
      console.error('messagesPillData', e);
      return { count: 0, recent: [] };
    }
  }, [getThreads, allListings]);

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
        setFiltersOpen(false);
        setViewMode('list'); // switch to list view when going to mobile
      } else if (!nextIsMobile) setFiltersOpen((prev) => prev || true);
    };
    const isMobileView = window.innerWidth < 768;
    if (!isMobileView) setFiltersOpen(true); // desktop: show filters by default
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredListings = useMemo(() => {
    const currentPriceRange = priceRanges[listingType][priceRangeIndex] || priceRanges[listingType][0];
    const { min: priceMin, max: priceMax } = currentPriceRange;

    let filtered = listingsToFilter.filter(item => {
      // Listing type filter
      if (item.listingType !== listingType) return false;

      // Region filter: if a region is selected, item must be in that region
      if (selectedRegion && selectedRegion !== 'all') {
        const citiesInRegion = getCitiesByRegion(selectedRegion);
        const cityIdsInRegion = citiesInRegion.map(c => c.id).filter(id => id !== 'cebu-province');
        if (!cityIdsInRegion.includes(item.cityId)) return false;
      }

      // City filter
      if (selectedCity !== 'cebu-province' && item.cityId !== selectedCity) return false;

      // Property type filter
      if (propertyType && item.type !== propertyType) return false;

      // Price range filter
      if (item.price < priceMin || item.price >= priceMax) return false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const cityName = getCityById(item.cityId)?.displayName || item.city || '';
        const searchableText = `${item.title} ${item.location} ${cityName} ${item.description}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      // Advanced filters
      if (minBeds > 0 && item.beds < minBeds) return false;
      if (minBaths > 0 && item.baths < minBaths) return false;
      if (sizeRange.min > 0 && item.sizeSqm < sizeRange.min) return false;
      if (sizeRange.max !== Infinity && item.sizeSqm > sizeRange.max) return false;

      return true;
    });

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'size-large':
          return (b.sizeSqm || 0) - (a.sizeSqm || 0);
        case 'size-small':
          return (a.sizeSqm || 0) - (b.sizeSqm || 0);
        case 'newest':
        default:
          return new Date(b.datePosted || 0) - new Date(a.datePosted || 0);
      }
    });

    return filtered;
  }, [listingsToFilter, listingType, propertyType, priceRangeIndex, selectedRegion, selectedCity, searchQuery, minBeds, minBaths, sizeRange, sortBy]);

  useEffect(() => {
    setItemsToShow(pageSize);
  }, [pageSize, filteredListings]);

  useEffect(() => {
    const handleScroll = () => {
      if (viewMode === 'map') return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;
      if (scrollPosition >= threshold) {
        setItemsToShow((prev) => Math.min(prev + pageSize, filteredListings.length));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredListings.length, pageSize, viewMode]);

  const listingsByType = useMemo(
    () => listingsToFilter.filter((item) => item.listingType === listingType),
    [listingType, listingsToFilter]
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

  const handleListingTypeChange = (newType) => {
    navigate(newType === 'rent' ? '/rent' : '/sale');
    setPriceRangeIndex(0);
  };

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
    const property = filteredListings[index];
    addView(property.id);
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleOpenProperty = (property) => {
    addView(property.id);
    setSelectedProperty(property);
    setShowModal(true);
  };

  const currentFilterState = useMemo(
    () => ({
      listingType,
      propertyType,
      priceRangeIndex,
      selectedRegion,
      selectedProvince,
      selectedCity,
      searchQuery,
      minBeds,
      minBaths,
      sizeRange,
      sortBy
    }),
    [listingType, propertyType, priceRangeIndex, selectedRegion, selectedProvince, selectedCity, searchQuery, minBeds, minBaths, sizeRange, sortBy]
  );

  const applySavedSearchState = (state) => {
    navigate(state.listingType === 'rent' ? '/rent' : '/sale');
    setPropertyType(state.propertyType);
    setPriceRangeIndex(state.priceRangeIndex);
    setSelectedRegion(state.selectedRegion);
    setSelectedProvince(state.selectedProvince ?? '');
    setSelectedCity(state.selectedCity);
    setSearchQuery(state.searchQuery);
    setMinBeds(state.minBeds);
    setMinBaths(state.minBaths);
    setSizeRange(state.sizeRange);
    setSortBy(state.sortBy);
  };

  const handleLogoHome = () => {
    setShowMyPropertiesOnly(false);
    setSelectedRegion('all');
    setSelectedProvince('');
    setSelectedCity('cebu-province');
    setSearchQuery('');
    setPropertyType('');
    setPriceRangeIndex(0);
    setMinBeds(0);
    setMinBaths(0);
    setSizeRange({ min: 0, max: Infinity });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const handleEditListing = (listing) => {
    setShowModal(false);
    setSelectedProperty(null);
    navigate(`/add-property/${listing.id}`);
  };

  const handleDeleteListing = (listing) => {
    setListingToDelete(listing);
  };

  const handleConfirmDeleteListing = async () => {
    if (!listingToDelete) return;
    try {
      await deleteListing(listingToDelete.id);
      setListingToDelete(null);
      setShowModal(false);
      setSelectedProperty(null);
    } catch (err) {
      console.error(err);
      window.alert(err?.message || 'Failed to delete listing.');
    } finally {
      setListingToDelete(null);
    }
  };

  const selectedCityData = getCityById(selectedCity);
  const visibleListings = filteredListings.slice(0, itemsToShow);
  const anyModalOpen =
    showChatModal ||
    showMessagesModal ||
    showFavoritesModal ||
    showModal;

  return (
    <>
      <div className={`App ${!filtersOpen && !isMobile ? 'desktop-filters-closed' : ''}`}>
        <header className="app-header">
          <div className="app-header-spacer" aria-hidden />
          <button
            type="button"
            className="app-logo-btn"
            onClick={handleLogoHome}
            aria-label="Home"
          >
            <img src="/logo-nav.png" alt="BalhinBalay" className="app-logo-img" />
          </button>
          <div className="app-header-actions">
            {/* Mobile: Favorites + menu + Filters */}
            <div className="header-actions-mobile">
              <button
                type="button"
                className={`btn-header-favorites ${favorites.length > 0 ? 'has-favorites' : ''}`}
                onClick={() => setShowFavoritesModal(true)}
                aria-label="Saved properties"
              >
                <i className="fas fa-heart" aria-hidden></i>
              </button>
              <button
                type="button"
                className="btn-header-secondary"
                onClick={() => setFiltersOpen(true)}
                aria-label="Search and filters"
              >
                <i className="fas fa-search" aria-hidden></i>
              </button>
              {!user ? (
                <button
                  type="button"
                  className="btn-header-login btn-header-login-mobile"
                  onClick={() => openLogin()}
                  aria-label="Log in"
                >
                  <i className="fas fa-sign-in-alt" aria-hidden></i>
                  <span>Log in</span>
                </button>
              ) : (
                <div className="app-header-actions-wrap">
                  <button
                    type="button"
                    className="btn-header-menu-trigger"
                    onClick={() => setShowHeaderMenu(true)}
                    aria-label="Account menu"
                    aria-expanded={showHeaderMenu}
                  >
                    <i className="fas fa-ellipsis-v" aria-hidden></i>
                  </button>
                  {isMobile ? (
                    <ProfileDrawer
                      open={showHeaderMenu}
                      onClose={() => setShowHeaderMenu(false)}
                      user={user}
                      onAddProperty={() => { setShowHeaderMenu(false); navigate('/add-property'); }}
                      onMyProperties={() => setShowMyPropertiesOnly((v) => !v)}
                      onProfile={() => { setShowHeaderMenu(false); navigate('/profile'); }}
                      onLogout={() => setShowLogoutConfirm(true)}
                      loggingOut={loggingOut}
                    />
                  ) : (
                    showHeaderMenu && (
                      <>
                        <div
                          className="header-menu-backdrop"
                          aria-hidden
                          onClick={() => setShowHeaderMenu(false)}
                        />
                        <div className="header-menu-dropdown">
                          <button type="button" onClick={() => { navigate('/add-property'); setShowHeaderMenu(false); }}>
                            <i className="fas fa-plus" aria-hidden></i> Add
                          </button>
                          <button type="button" onClick={() => { setShowMyPropertiesOnly((v) => !v); setShowHeaderMenu(false); }}>
                            <i className="fas fa-house" aria-hidden></i> My properties
                          </button>
                          <button type="button" onClick={() => { navigate('/profile'); setShowHeaderMenu(false); }}>
                            <i className="fas fa-circle-user" aria-hidden></i> Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (loggingOut) return;
                              setShowLogoutConfirm(true);
                            }}
                            disabled={loggingOut}
                          >
                            {loggingOut ? (
                              <>
                                <i className="fas fa-spinner fa-spin auth-spinner" aria-hidden></i> Logging out...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-sign-out-alt" aria-hidden></i> Log out
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )
                  )}
                </div>
              )}
            </div>
            {/* Desktop: full actions */}
            <div className="header-actions-full">
              <button
                type="button"
                className={`btn-header-favorites ${favorites.length > 0 ? 'has-favorites' : ''}`}
                onClick={() => setShowFavoritesModal(true)}
                aria-label="Saved properties"
              >
                <i className="fas fa-heart" aria-hidden></i>
                <span className="btn-header-label">Saved</span>
              </button>
              <button
                type="button"
                className="btn-header-secondary"
                onClick={() => setFiltersOpen(true)}
                aria-label="Search and filters"
              >
                <i className="fas fa-search" aria-hidden></i>
                <span className="btn-header-label">Search</span>
              </button>
              {user ? (
                <>
                  <button
                    type="button"
                    className="btn-header-secondary"
                    onClick={() => navigate('/add-property')}
                    aria-label="Add property"
                  >
                    <i className="fas fa-plus" aria-hidden></i>
                    <span className="btn-header-label">Add</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-header-secondary ${showMyPropertiesOnly ? 'active' : ''}`}
                    onClick={() => setShowMyPropertiesOnly((v) => !v)}
                    aria-label="My properties"
                  >
                    <i className="fas fa-house" aria-hidden></i>
                    <span className="btn-header-label">My properties</span>
                  </button>
                  <button
                    type="button"
                    className="btn-header-secondary"
                    onClick={() => navigate('/profile')}
                    aria-label="Profile"
                  >
                    <i className="fas fa-circle-user" aria-hidden></i>
                    <span className="btn-header-label">Profile</span>
                  </button>
                  <button
                    type="button"
                    className="btn-header-secondary"
                    onClick={() => {
                      if (loggingOut) return;
                      setShowLogoutConfirm(true);
                    }}
                    disabled={loggingOut}
                    aria-label={loggingOut ? 'Logging out' : 'Log out'}
                  >
                    {loggingOut ? (
                      <>
                        <i className="fas fa-spinner fa-spin auth-spinner" aria-hidden></i>
                        <span className="btn-header-label">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-out-alt" aria-hidden></i>
                        <span className="btn-header-label">Log out</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-header-login"
                  onClick={() => openLogin()}
                  aria-label="Log in"
                >
                  <i className="fas fa-sign-in-alt" aria-hidden></i>
                  <span>Log in</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="listing-tabs">
          <NavLink
            to="/sale"
            className={({ isActive }) => `listing-tab${isActive ? ' active' : ''}`}
          >
            For Sale
          </NavLink>
          <NavLink
            to="/rent"
            className={({ isActive }) => `listing-tab${isActive ? ' active' : ''}`}
          >
            For Rent
          </NavLink>
        </div>

        {!filtersOpen && !anyModalOpen && (
          <button
            type="button"
            className="floating-filters-btn"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open filters"
          >
            <i className="fas fa-sliders-h" aria-hidden></i>
          </button>
        )}

        {user && !anyModalOpen && (
          <button
            type="button"
            className="floating-messages-pill instagram-style"
            onClick={() => setShowMessagesModal(true)}
            aria-label="Messages"
          >
            <span className="floating-messages-pill-icon-wrap">
              <i className="fas fa-paper-plane" aria-hidden></i>
              {messagesPillData.count > 0 && (
                <span className="floating-messages-pill-badge" aria-label={`${messagesPillData.count} unread message(s)`}>
                  {messagesPillData.count > 99 ? '99+' : messagesPillData.count}
                </span>
              )}
            </span>
            <span className="floating-messages-pill-label">Messages</span>
            {messagesPillData.recent.length > 0 && (
              <span className="floating-messages-pill-avatars" aria-hidden>
                {messagesPillData.recent.map((listing) => (
                  <span key={listing.id} className="floating-messages-pill-avatar">
                    <img src={listing.images?.[0]} alt="" />
                  </span>
                ))}
              </span>
            )}
            <span className="floating-messages-pill-ellipsis" aria-hidden>
              <i className="fas fa-ellipsis-v" aria-hidden></i>
            </span>
          </button>
        )}

        <div className={!isMobile ? 'app-layout-desktop' : ''}>
          {isMobile ? (
            <AnimatePresence>
              {filtersOpen && (
                <>
                  <motion.div
                    className="filter-backdrop filter-backdrop-animated"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFiltersOpen(false)}
                    aria-hidden="true"
                  />
                  <motion.div
                    className="filter-sheet filter-sheet-mobile"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="filter-sheet-handle" aria-hidden="true" />
                    <div className="filter-sheet-header">
                      <h2>Filters</h2>
                      <button
                        type="button"
                        className="filter-sheet-close"
                        onClick={() => setFiltersOpen(false)}
                        aria-label="Close filters"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <FilterSidebar
                      listingType={listingType}
                      propertyType={propertyType}
                      priceRangeIndex={priceRangeIndex}
                      selectedRegion={selectedRegion}
                      selectedProvince={selectedProvince}
                      selectedCity={selectedCity}
                      availableRegionIds={availableRegionIds}
                      availableProvinces={availableProvinces}
                      availableCityIds={availableCityIds}
                      searchQuery={searchQuery}
                      minBeds={minBeds}
                      minBaths={minBaths}
                      sizeRange={sizeRange}
                      onListingTypeChange={handleListingTypeChange}
                      onRegionChange={handleRegionChange}
                      onProvinceChange={handleProvinceChange}
                      onPropertyTypeChange={setPropertyType}
                      onPriceRangeChange={setPriceRangeIndex}
                      onCityChange={handleCityChange}
                      onSearchChange={handleSearchChange}
                      onSearchClear={handleSearchClear}
                      onAdvancedFiltersChange={handleAdvancedFiltersChange}
                      onApply={() => {}}
                      onApplySavedState={applySavedSearchState}
                      currentFilterState={currentFilterState}
                      isMobile={isMobile}
                      hideHeader
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          ) : (
            <>
              <div
                className={`filter-backdrop ${filtersOpen ? 'open' : ''}`}
                onClick={() => setFiltersOpen(false)}
                aria-hidden="true"
              />
              <div
                className={`filter-sheet ${filtersOpen ? 'open' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="filter-sheet-handle" aria-hidden="true" />
                <div className="filter-sheet-header">
                  <h2>Filters</h2>
                  <button
                    type="button"
                    className="filter-sheet-close"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="Close filters"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <FilterSidebar
                  listingType={listingType}
                  propertyType={propertyType}
                  priceRangeIndex={priceRangeIndex}
                  selectedRegion={selectedRegion}
                  selectedProvince={selectedProvince}
                  selectedCity={selectedCity}
                  availableRegionIds={availableRegionIds}
                  availableProvinces={availableProvinces}
                  availableCityIds={availableCityIds}
                  searchQuery={searchQuery}
                  minBeds={minBeds}
                  minBaths={minBaths}
                  sizeRange={sizeRange}
                  onListingTypeChange={handleListingTypeChange}
                  onRegionChange={handleRegionChange}
                  onProvinceChange={handleProvinceChange}
                  onPropertyTypeChange={setPropertyType}
                  onPriceRangeChange={setPriceRangeIndex}
                  onCityChange={handleCityChange}
                  onSearchChange={handleSearchChange}
                  onSearchClear={handleSearchClear}
                  onAdvancedFiltersChange={handleAdvancedFiltersChange}
                  onApply={() => {}}
                  onApplySavedState={applySavedSearchState}
                  currentFilterState={currentFilterState}
                  isMobile={isMobile}
                  hideHeader
                />
              </div>
            </>
          )}

          <main className={`results-area ${!filtersOpen && !isMobile ? 'full' : ''}`}>
            {!listingsLoading && listingsError && (
              <div className="listings-error-banner" style={{ padding: '12px 16px', background: '#f8d7da', color: '#721c24', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span>{listingsError}</span>
                <button type="button" onClick={() => refreshListings()} style={{ padding: '6px 14px', cursor: 'pointer', backgroundColor: '#721c24', color: '#fff', border: 'none', borderRadius: 4 }}>
                  Retry
                </button>
              </div>
            )}
            {showMyPropertiesOnly && user && (
              <div className="my-properties-bar">
                <span className="my-properties-bar-text"><i className="fas fa-house" aria-hidden></i>Showing only your properties</span>
                <button
                  type="button"
                  className="my-properties-bar-back"
                  onClick={() => setShowMyPropertiesOnly(false)}
                >
                  Show all properties
                </button>
              </div>
            )}
            <SortBar
              sortBy={sortBy}
              viewMode={viewMode}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              totalResults={filteredListings.length}
              isMyProperties={showMyPropertiesOnly && !!user}
            />

            {viewMode !== 'map' && !showMyPropertiesOnly && recentListings.length > 0 && (
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

            {viewMode === 'map' ? (
              <MapView
                properties={filteredListings}
                selectedCity={selectedCityData}
                onPropertyClick={handleViewDetails}
              />
            ) : (
              <section
                className={`listing-grid ${viewMode === 'list' ? 'list-view' : ''}`}
                id="listingArea"
              >
                {visibleListings.map((property, index) =>
                  viewMode === 'list' ? (
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

            {viewMode !== 'map' && itemsToShow < filteredListings.length && (
              <div className="text-center py-4">
                <div className="loading-more">Loading more properties...</div>
              </div>
            )}

            {filteredListings.length === 0 && (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No properties found</h4>
                <p className="text-muted">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </main>
        </div>

        <PropertyModal
          property={selectedProperty}
          show={showModal}
          onHide={handleCloseModal}
          user={user}
          onOpenChat={(p) => {
            setChatProperty(p);
            setChatThreadId(null);
            setShowChatModal(true);
          }}
          onLoginForChat={() => openLogin()}
          onEdit={handleEditListing}
          onDelete={handleDeleteListing}
        />
        <ChatModal
          show={showChatModal && !!user}
          onClose={() => { setShowChatModal(false); setChatProperty(null); setChatThreadId(null); }}
          property={chatProperty}
          threadId={chatThreadId}
          user={user}
          onBack={() => {
            setShowChatModal(false);
            setChatProperty(null);
            setChatThreadId(null);
            setShowMessagesModal(true);
          }}
        />
        <MessagesModal
          show={showMessagesModal && !!user}
          onClose={() => setShowMessagesModal(false)}
          allListings={allListings}
          onOpenThread={(listing, threadId) => {
            setChatProperty(listing);
            setChatThreadId(threadId || null);
            setShowMessagesModal(false);
            setShowChatModal(true);
          }}
        />
        <FavoritesModal
          show={showFavoritesModal}
          onClose={() => setShowFavoritesModal(false)}
          favoriteListings={favoriteListings}
          onSelectProperty={handleOpenProperty}
        />
        <ConfirmModal
          show={showLogoutConfirm}
          title="Log out"
          message="Are you sure you want to log out?"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => {
            setShowLogoutConfirm(false);
            setShowHeaderMenu(false);
            setLoggingOut(true);
            setTimeout(() => {
              logout();
              setLoggingOut(false);
            }, 400);
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
        <ConfirmModal
          show={!!listingToDelete}
          title="Delete listing"
          message="Are you sure you want to delete this listing?"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleConfirmDeleteListing}
          onCancel={() => setListingToDelete(null)}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ListingsProvider>
          <UserListingsProvider>
            <ChatProvider>
              <FavoritesProvider>
                <RecentlyViewedProvider>
                  <SavedSearchesProvider>
                    <BrowserRouter>
                      <LoginModalProvider>
                        <Routes>
                          <Route path="/" element={<Navigate to="/sale" replace />} />
                          <Route path="/sale" element={<AppContent />} />
                          <Route path="/rent" element={<AppContent />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/add-property" element={<AddPropertyPage />} />
                          <Route path="/add-property/:id" element={<AddPropertyPage />} />
                          <Route path="/admin" element={<AdminRoute />} />
                        </Routes>
                      </LoginModalProvider>
                    </BrowserRouter>
                  </SavedSearchesProvider>
                </RecentlyViewedProvider>
              </FavoritesProvider>
            </ChatProvider>
          </UserListingsProvider>
        </ListingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
