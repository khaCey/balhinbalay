import React, { useState, useMemo, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useChat } from '../context/ChatContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useSearch } from '../context/SearchContext';
import ConfirmModal from './ConfirmModal';
import { getIsDesktop } from './MainLayout.constants';
import Seo from './Seo';
import { getCityById } from '../data/cities';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';
import ConsentBanner from './ConsentBanner';
import { initAnalytics, getStoredConsent, setAnalyticsConsent } from '../utils/analytics';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openLogin } = useLoginModal();
  const { favorites } = useFavorites();
  const { unreadChatCount } = useChat();
  const { hasSearched, lastSearchState } = useSearch();

  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(getIsDesktop());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    initAnalytics();
    const storedConsent = getStoredConsent();
    setShowConsentBanner(storedConsent == null);
  }, []);

  const messagesPillData = useMemo(
    () => ({ count: typeof unreadChatCount === 'number' ? unreadChatCount : 0 }),
    [unreadChatCount]
  );

  const path = location.pathname;
  const hideMobileBottomNav =
    path.startsWith('/chat/') ||
    path === '/add-property' ||
    path.startsWith('/add-property/') ||
    path === '/admin';
  const showBottomNav = !isDesktop && !hideMobileBottomNav;
  const isMyPropertiesView = path === '/my-properties';
  const isHomeActive = path === '/';
  const isSavedActive = path === '/saved';
  const isMessagesActive = path === '/messages' || path.startsWith('/chat/');
  const isSearchActive =
    path === '/search' ||
    path === '/search/city' ||
    path === '/search/keyword' ||
    path === '/search/school' ||
    path === '/sale' ||
    path === '/rent';
  const isMapActive = path === '/search/map' || path === '/map';
  const isSettingsActive = path === '/settings';
  const isAddPropertyActive = path === '/add-property' || path.startsWith('/add-property/');
  const isPropertyRoute = path.startsWith('/property/');
  const isRentOrSaleRoute = path === '/rent' || path === '/sale';
  const isPrivateNoIndexPath =
    path === '/my-properties' ||
    path === '/saved' ||
    path === '/messages' ||
    path.startsWith('/chat/') ||
    path === '/menu' ||
    path === '/profile' ||
    path === '/settings' ||
    path === '/add-property' ||
    path.startsWith('/add-property/') ||
    path === '/admin' ||
    path === '/confirm-email';

  const activeListingType = path === '/rent' ? 'rent' : 'sale';
  const searchStateForListing =
    hasSearched && lastSearchState?.listingType === activeListingType ? lastSearchState : null;
  const activeCity = searchStateForListing?.selectedCity
    ? getCityById(searchStateForListing.selectedCity)
    : null;
  const activeCityName =
    activeCity && activeCity.id !== 'cebu-province' ? activeCity.displayName : '';
  const rentOrSaleLabel = activeListingType === 'rent' ? 'Rent' : 'Sale';
  const rentOrSaleTitle = `${rentOrSaleLabel} Properties${activeCityName ? ` in ${activeCityName}` : ' in the Philippines'}`;
  const rentOrSaleDescription = activeCityName
    ? `Browse ${activeListingType === 'rent' ? 'rental' : 'for-sale'} property listings in ${activeCityName}, Philippines.`
    : `Browse ${activeListingType === 'rent' ? 'rental' : 'for-sale'} property listings across the Philippines.`;
  const rentOrSaleBreadcrumbSchema = {
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
        name: activeListingType === 'rent' ? 'For Rent' : 'For Sale',
        item: toAbsoluteUrl(activeListingType === 'rent' ? '/rent' : '/sale')
      }
    ]
  };

  const navigateWithFallback = (target, options = {}) => {
    const currentPath = `${location.pathname}${location.search || ''}`;
    navigate(target, options);

    if (!isPropertyRoute) return;

    window.setTimeout(() => {
      const nextPath = `${window.location.pathname}${window.location.search || ''}`;
      if (nextPath === currentPath) {
        window.location.assign(target);
      }
    }, 60);
  };

  const handleLogoHome = () => {
    navigateWithFallback('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    const targetListingType = lastSearchState?.listingType === 'rent' ? 'rent' : 'sale';
    navigateWithFallback(`/search?listingType=${targetListingType}`);
  };

  const handleOpenSavedSearches = () => {
    if (hasSearched && lastSearchState?.listingType === 'rent') {
      navigateWithFallback('/rent');
    } else {
      navigateWithFallback('/sale');
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigateWithFallback('/', { replace: true });
    }, 400);
  };

  const showSidebar = isDesktop && !path.startsWith('/chat/');
  const handleAcceptAnalytics = () => {
    setAnalyticsConsent(true);
    setShowConsentBanner(false);
  };
  const handleRejectAnalytics = () => {
    setAnalyticsConsent(false);
    setShowConsentBanner(false);
  };

  return (
    <div className={`app-layout-wrap ${showSidebar ? 'app-with-sidebar' : ''}`}>
      {isRentOrSaleRoute && (
        <Seo
          title={rentOrSaleTitle}
          description={rentOrSaleDescription}
          canonicalPath={activeListingType === 'rent' ? '/rent' : '/sale'}
          ogTitle={rentOrSaleTitle}
          ogDescription={rentOrSaleDescription}
          ogImage={DEFAULT_OG_IMAGE_PATH}
          jsonLd={rentOrSaleBreadcrumbSchema}
          jsonLdId="seo-rent-sale-json-ld"
        />
      )}
      {!isRentOrSaleRoute && isPrivateNoIndexPath && (
        <Seo
          title="Account Page"
          description="This page is intended for logged-in users."
          canonicalPath={path}
          noindex
        />
      )}
      {showSidebar && (
        <aside className="app-sidebar" aria-label="Main navigation">
          <div className="app-sidebar-brand" onClick={handleLogoHome} onKeyDown={(e) => e.key === 'Enter' && handleLogoHome()} role="button" tabIndex={0} aria-label="Home">
            <span className="app-sidebar-logo">BalhinBalay</span>
          </div>
          <nav className="app-sidebar-nav">
            <button
              type="button"
              className={`app-sidebar-item ${isHomeActive ? 'active' : ''}`}
              onClick={handleLogoHome}
              aria-current={isHomeActive ? 'page' : undefined}
            >
              <i className="fas fa-home" aria-hidden />
              <span>Home</span>
            </button>
            <button
              type="button"
              className={`app-sidebar-item ${isSavedActive ? 'active' : ''}`}
              onClick={() => navigateWithFallback('/saved')}
              aria-current={isSavedActive ? 'page' : undefined}
            >
              <i className="fas fa-heart" aria-hidden />
              <span>Saved</span>
              {favorites.length > 0 && <span className="app-sidebar-badge">{favorites.length}</span>}
            </button>
            <button
              type="button"
              className={`app-sidebar-item ${isMessagesActive ? 'active' : ''}`}
              onClick={() => (user ? navigateWithFallback('/messages') : openLogin())}
              aria-current={isMessagesActive ? 'page' : undefined}
            >
              <span className="app-sidebar-icon-wrap">
                <i className="fas fa-paper-plane" aria-hidden />
                {user && messagesPillData.count > 0 && (
                  <span className="app-sidebar-badge">{messagesPillData.count > 99 ? '99+' : messagesPillData.count}</span>
                )}
              </span>
              <span>Messages</span>
            </button>
            <button
              type="button"
              className={`app-sidebar-item ${isSearchActive ? 'active' : ''}`}
              onClick={handleSearch}
              aria-current={isSearchActive ? 'page' : undefined}
            >
              <i className="fas fa-search" aria-hidden />
              <span>Search</span>
            </button>
            {user ? (
              <>
                <div className="app-sidebar-section-label">Account</div>
                <button
                  type="button"
                  className={`app-sidebar-item ${isAddPropertyActive ? 'active' : ''}`}
                  onClick={() => navigateWithFallback('/add-property')}
                  aria-current={isAddPropertyActive ? 'page' : undefined}
                >
                  <i className="fas fa-plus" aria-hidden />
                  <span>Add property</span>
                </button>
                <button
                  type="button"
                  className={`app-sidebar-item ${isMyPropertiesView ? 'active' : ''}`}
                  onClick={() => navigateWithFallback('/my-properties')}
                  aria-current={isMyPropertiesView ? 'page' : undefined}
                >
                  <i className="fas fa-house" aria-hidden />
                  <span>My properties</span>
                </button>
                <button
                  type="button"
                  className="app-sidebar-item"
                  onClick={handleOpenSavedSearches}
                >
                  <i className="fas fa-bookmark" aria-hidden />
                  <span>Saved searches</span>
                </button>
                <button
                  type="button"
                  className={`app-sidebar-item ${isSettingsActive ? 'active' : ''}`}
                  onClick={() => navigateWithFallback('/settings')}
                  aria-current={isSettingsActive ? 'page' : undefined}
                >
                  <i className="fas fa-gear" aria-hidden />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="app-sidebar-item app-sidebar-item-logout"
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <i className="fas fa-spinner fa-spin" aria-hidden />
                  ) : (
                    <i className="fas fa-sign-out-alt" aria-hidden />
                  )}
                  <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
                </button>
              </>
            ) : (
              <>
                <div className="app-sidebar-section-label">Account</div>
                <button
                  type="button"
                  className="app-sidebar-item"
                  onClick={() => openLogin()}
                >
                  <i className="fas fa-sign-in-alt" aria-hidden />
                  <span>Log in</span>
                </button>
              </>
            )}
          </nav>
        </aside>
      )}

      <div className={`app-with-bottom-nav ${showBottomNav ? 'app-has-bottom-nav' : ''}`}>
        {/* Always app-main so flex:1 + min-height:0 chain works on mobile (scroll lives in .results-area) */}
        <div className="app-main">
          <Outlet key={`${location.pathname}${location.search || ''}`} />
        </div>
      </div>

      {showBottomNav && (
        <nav className="app-bottom-nav minimal-bottom-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`app-bottom-nav-item ${isHomeActive ? 'active' : ''}`}
            onClick={handleLogoHome}
            aria-label="Home"
            aria-current={isHomeActive ? 'page' : undefined}
          >
            <i className="fas fa-home" aria-hidden />
            <span className="app-bottom-nav-label">Home</span>
          </button>
          <button
            type="button"
            className={`app-bottom-nav-item ${isSearchActive ? 'active' : ''}`}
            onClick={handleSearch}
            aria-label="Search"
            aria-current={isSearchActive ? 'page' : undefined}
          >
            <i className="fas fa-search" aria-hidden />
            <span className="app-bottom-nav-label">Search</span>
          </button>
          <button
            type="button"
            className={`app-bottom-nav-item ${isMapActive ? 'active' : ''}`}
            onClick={() => {
              const listingType = lastSearchState?.listingType === 'rent' ? 'rent' : 'sale';
              navigateWithFallback(`/search/map?listingType=${listingType}`);
            }}
            aria-label="Map"
            aria-current={isMapActive ? 'page' : undefined}
          >
            <i className="fas fa-map-marker-alt" aria-hidden />
            <span className="app-bottom-nav-label">Map</span>
          </button>
          <button
            type="button"
            className={`app-bottom-nav-item ${favorites.length > 0 ? 'has-favorites' : ''} ${isSavedActive ? 'active' : ''}`}
            onClick={() => (user ? navigateWithFallback('/saved') : openLogin())}
            aria-label="Saved"
            aria-current={isSavedActive ? 'page' : undefined}
          >
            <i className="fas fa-heart" aria-hidden />
            <span className="app-bottom-nav-label">Saved</span>
          </button>
          <button
            type="button"
            className={`app-bottom-nav-item ${isMessagesActive ? 'active' : ''}`}
            onClick={() => (user ? navigateWithFallback('/messages') : openLogin())}
            aria-label="Messages"
            aria-current={isMessagesActive ? 'page' : undefined}
          >
            <span className="app-bottom-nav-messages-icon-wrap">
              <i className="fas fa-paper-plane" aria-hidden />
              {user && messagesPillData.count > 0 && (
                <span className="app-bottom-nav-messages-badge" aria-label={`${messagesPillData.count} unread`}>
                  {messagesPillData.count > 99 ? '99+' : messagesPillData.count}
                </span>
              )}
            </span>
            <span className="app-bottom-nav-label">Messages</span>
          </button>
        </nav>
      )}

      <ConfirmModal
        show={showLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <ConsentBanner
        open={showConsentBanner}
        hasBottomNav={showBottomNav}
        onAccept={handleAcceptAnalytics}
        onReject={handleRejectAnalytics}
      />
    </div>
  );
}
