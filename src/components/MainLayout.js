import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useChat } from '../context/ChatContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useSearch } from '../context/SearchContext';
import { useSliderDrag } from '../context/SliderDragContext';

const NAV_PADDING_BOTTOM = 'calc(72px + env(safe-area-inset-bottom))';

const SWIPE_ROUTES = ['/', '/saved', '/messages', '/sale'];
const SWIPE_THRESHOLD_PX = 50;
const NAV_BLOCK_AFTER_SWIPE_MS = 350;

function getSwipeRouteIndex(pathname) {
  if (pathname === '/') return 0;
  if (pathname === '/saved') return 1;
  if (pathname === '/messages') return 2;
  if (pathname === '/sale' || pathname === '/rent') return 3;
  return -1;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();
  const { favorites } = useFavorites();
  const { unreadChatCount } = useChat();
  const { hasSearched, lastSearchState } = useSearch();
  const { isSliding } = useSliderDrag();

  const messagesPillData = useMemo(
    () => ({ count: typeof unreadChatCount === 'number' ? unreadChatCount : 0 }),
    [unreadChatCount]
  );

  const path = location.pathname;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showNav = !path.startsWith('/chat/');
  const isHomeActive = path === '/';
  const isSavedActive = path === '/saved';
  const isMessagesActive = path === '/messages';
  const isSearchActive = path === '/sale' || path === '/rent';

  const [navBlockedAfterSwipe, setNavBlockedAfterSwipe] = useState(false);
  const navBlockTimeoutRef = useRef(null);

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
    if (hasSearched && lastSearchState?.listingType === 'rent') {
      navigate('/rent');
    } else {
      navigate('/sale');
    }
  };


  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleSwipeStart = useCallback((e) => {
    const t = e.touches?.[0];
    if (t) {
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
  }, []);
  const handleSwipeEnd = useCallback(
    (e) => {
      if (isSliding) return;
      const t = e.changedTouches?.[0];
      if (!t || !showNav) return;
      const idx = getSwipeRouteIndex(path);
      if (idx < 0) return;
      const deltaX = t.clientX - touchStartRef.current.x;
      const deltaY = t.clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (deltaX < 0 && idx < SWIPE_ROUTES.length - 1) {
        const nextIdx = idx + 1;
        if (nextIdx === 3) {
          navigate(hasSearched && lastSearchState?.listingType === 'rent' ? '/rent' : '/sale');
        } else {
          navigate(SWIPE_ROUTES[nextIdx]);
        }
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
    [path, showNav, navigate, hasSearched, lastSearchState, isSliding]
  );

  return (
    <div className="app-layout-wrap">
      <div
        className={`app-with-bottom-nav ${showNav ? 'app-has-bottom-nav' : ''}`}
        style={{ paddingBottom: showNav ? NAV_PADDING_BOTTOM : 0 }}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <Outlet />
      </div>
      {showNav && (
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
              className="app-bottom-nav-item"
              onClick={() => navigate('/menu')}
              aria-label="Account menu"
            >
              <i className="fas fa-bars" aria-hidden />
              <span className="app-bottom-nav-label">Menu</span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
