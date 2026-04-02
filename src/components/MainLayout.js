import React, { useState, useMemo, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useChat } from '../context/ChatContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useSearch } from '../context/SearchContext';
import ConfirmModal from './ConfirmModal';
import { getIsDesktop } from './MainLayout.constants';

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

  useEffect(() => {
    const onResize = () => setIsDesktop(getIsDesktop());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const messagesPillData = useMemo(
    () => ({ count: typeof unreadChatCount === 'number' ? unreadChatCount : 0 }),
    [unreadChatCount]
  );

  const path = location.pathname;
  const showNav = !path.startsWith('/chat/');
  const isMyPropertiesView = path === '/my-properties';
  const isHomeActive = path === '/';
  const isSavedActive = path === '/saved';
  const isMessagesActive = path === '/messages';
  const isSearchActive = path === '/search' || ((path === '/sale' || path === '/rent') && !isMyPropertiesView);
  const isMenuActive = path === '/menu';
  const isSettingsActive = path === '/settings';
  const isAddPropertyActive = path === '/add-property' || path.startsWith('/add-property/');
  const isPropertyRoute = path.startsWith('/property/');

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
    navigateWithFallback('/search');
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

  const showSidebar = isDesktop && showNav;

  return (
    <div className={`app-layout-wrap ${showSidebar ? 'app-with-sidebar' : ''}`}>
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

      <div className={`app-with-bottom-nav ${!isDesktop && showNav ? 'app-has-bottom-nav' : ''}`}>
        {/* Always app-main so flex:1 + min-height:0 chain works on mobile (scroll lives in .results-area) */}
        <div className="app-main">
          <Outlet key={`${location.pathname}${location.search || ''}`} />
        </div>
      </div>

      {!isDesktop && showNav && (
        <nav className="app-bottom-nav" aria-label="Main navigation">
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
            className={`app-bottom-nav-item ${favorites.length > 0 ? 'has-favorites' : ''} ${isSavedActive ? 'active' : ''}`}
            onClick={() => navigateWithFallback('/saved')}
            aria-label="Saved properties"
            aria-current={isSavedActive ? 'page' : undefined}
          >
            <i className="fas fa-heart" aria-hidden />
            <span className="app-bottom-nav-label">Saved</span>
          </button>
          <button
            type="button"
            className={`app-bottom-nav-item ${user && messagesPillData.count > 0 ? 'has-favorites' : ''} ${isMessagesActive ? 'active' : ''}`}
            onClick={() => (user ? navigateWithFallback('/messages') : openLogin())}
            aria-label={user ? `Messages${messagesPillData.count > 0 ? `, ${messagesPillData.count} unread` : ''}` : 'Log in to view messages'}
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
          <button
            type="button"
            className={`app-bottom-nav-item ${isSearchActive ? 'active' : ''}`}
            onClick={handleSearch}
            aria-label="Search and filters"
            aria-current={isSearchActive ? 'page' : undefined}
          >
            <i className="fas fa-search" aria-hidden />
            <span className="app-bottom-nav-label">Search</span>
          </button>
          {!user ? (
            <button
              type="button"
              className="app-bottom-nav-item"
              onClick={() => openLogin()}
              aria-label="Log in"
            >
              <i className="fas fa-sign-in-alt" aria-hidden />
              <span className="app-bottom-nav-label">Log in</span>
            </button>
          ) : (
            <button
              type="button"
              className={`app-bottom-nav-item ${isMenuActive ? 'active' : ''}`}
              onClick={() => navigateWithFallback('/menu')}
              aria-label="Account menu"
              aria-current={isMenuActive ? 'page' : undefined}
            >
              <i className="fas fa-bars" aria-hidden />
              <span className="app-bottom-nav-label">Menu</span>
            </button>
          )}
        </nav>
      )}

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
