import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useChat } from '../context/ChatContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useSearch } from '../context/SearchContext';
import { useSliderDrag } from '../context/SliderDragContext';
import ConfirmModal from './ConfirmModal';

const NAV_PADDING_BOTTOM = 'calc(72px + env(safe-area-inset-bottom))';
const DESKTOP_BREAKPOINT = 768;

const SWIPE_ROUTES = ['/', '/saved', '/messages', '/search'];
const SWIPE_THRESHOLD_PX = 50;
const NAV_BLOCK_AFTER_SWIPE_MS = 350;

function getSwipeRouteIndex(pathname) {
  if (pathname === '/') return 0;
  if (pathname === '/saved') return 1;
  if (pathname === '/messages') return 2;
  if (pathname === '/search' || pathname === '/sale' || pathname === '/rent') return 3;
  return -1;
}

function getIsDesktop() {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openLogin } = useLoginModal();
  const { favorites } = useFavorites();
  const { unreadChatCount } = useChat();
  const { hasSearched, lastSearchState } = useSearch();
  const { isSliding } = useSliderDrag();

  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [navBlockedAfterSwipe, setNavBlockedAfterSwipe] = useState(false);
  const navBlockTimeoutRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (navBlockTimeoutRef.current) clearTimeout(navBlockTimeoutRef.current);
    };
  }, []);

  const handleLogoHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleOpenSavedSearches = () => {
    if (hasSearched && lastSearchState?.listingType === 'rent') {
      navigate('/rent');
    } else {
      navigate('/sale');
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigate('/', { replace: true });
    }, 400);
  };

  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleSwipeStart = useCallback((e) => {
    if (isDesktop) return;
    const t = e.touches?.[0];
    if (t) {
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
  }, [isDesktop]);
  const handleSwipeEnd = useCallback(
    (e) => {
      if (isDesktop || isSliding) return;
      const t = e.changedTouches?.[0];
      if (!t || !showNav) return;
      const idx = getSwipeRouteIndex(path);
      if (idx < 0) return;
      const deltaX = t.clientX - touchStartRef.current.x;
      const deltaY = t.clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (deltaX < 0 && idx < SWIPE_ROUTES.length - 1) {
        const nextIdx = idx + 1;
        navigate(SWIPE_ROUTES[nextIdx]);
        document.activeElement?.blur?.();
        if (navBlockTimeoutRef.current) clearTimeout(navBlockTimeoutRef.current);
        setNavBlockedAfterSwipe(true);
        navBlockTimeoutRef.current = setTimeout(() => {
          navBlockTimeoutRef.current = null;
          setNavBlockedAfterSwipe(false);
        }, NAV_BLOCK_AFTER_SWIPE_MS);
      } else if (deltaX > 0 && idx > 0) {
        navigate(SWIPE_ROUTES[idx - 1]);
        document.activeElement?.blur?.();
        if (navBlockTimeoutRef.current) clearTimeout(navBlockTimeoutRef.current);
        setNavBlockedAfterSwipe(true);
        navBlockTimeoutRef.current = setTimeout(() => {
          navBlockTimeoutRef.current = null;
          setNavBlockedAfterSwipe(false);
        }, NAV_BLOCK_AFTER_SWIPE_MS);
      }
    },
    [isDesktop, path, showNav, navigate, isSliding]
  );

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
              onClick={() => navigate('/saved')}
              aria-current={isSavedActive ? 'page' : undefined}
            >
              <i className="fas fa-heart" aria-hidden />
              <span>Saved</span>
              {favorites.length > 0 && <span className="app-sidebar-badge">{favorites.length}</span>}
            </button>
            <button
              type="button"
              className={`app-sidebar-item ${isMessagesActive ? 'active' : ''}`}
              onClick={() => (user ? navigate('/messages') : openLogin())}
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
                  onClick={() => navigate('/add-property')}
                  aria-current={isAddPropertyActive ? 'page' : undefined}
                >
                  <i className="fas fa-plus" aria-hidden />
                  <span>Add property</span>
                </button>
                <button
                  type="button"
                  className={`app-sidebar-item ${isMyPropertiesView ? 'active' : ''}`}
                  onClick={() => navigate('/my-properties')}
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
                  onClick={() => navigate('/settings')}
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

      <div
        className={`app-with-bottom-nav ${!isDesktop && showNav ? 'app-has-bottom-nav' : ''}`}
        style={{ paddingBottom: !isDesktop && showNav ? NAV_PADDING_BOTTOM : 0 }}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <div className={showSidebar ? 'app-main' : ''}>
          <Outlet />
        </div>
      </div>

      {!isDesktop && showNav && (
        <nav
          className={`app-bottom-nav ${navBlockedAfterSwipe ? 'app-bottom-nav-blocked' : ''}`}
          aria-label="Main navigation"
        >
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
            onClick={() => navigate('/saved')}
            aria-label="Saved properties"
            aria-current={isSavedActive ? 'page' : undefined}
          >
            <i className="fas fa-heart" aria-hidden />
            <span className="app-bottom-nav-label">Saved</span>
          </button>
          <button
            type="button"
            className={`app-bottom-nav-item ${user && messagesPillData.count > 0 ? 'has-favorites' : ''} ${isMessagesActive ? 'active' : ''}`}
            onClick={() => (user ? navigate('/messages') : openLogin())}
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
              onClick={() => navigate('/menu')}
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
