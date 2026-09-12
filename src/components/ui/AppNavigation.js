import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useLoginModal } from '../../context/LoginModalContext';
import { Icon } from './Controls';

export default function AppNavigation({ hideBottomNav }) {
  const { user } = useAuth();
  const { openLogin } = useLoginModal();
  const { unreadChatCount } = useChat();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const items = [
    ['/', 'Home', 'home'],
    ['/search', 'Search', 'search'],
    ['/saved', 'Saved', 'heart'],
    ['/menu', 'Profile', 'user'],
  ];
  const active = (path) =>
    path === '/search'
      ? /^\/(search|rent|sale|map|property)/.test(pathname)
      : path === '/menu'
        ? /^\/(menu|profile|settings|my-properties|add-property)/.test(pathname)
        : pathname === path;
  const links = items.map(([path, label, icon]) => (
    <NavLink
      key={path}
      to={path}
      className={active(path) ? 'active' : ''}
      aria-current={active(path) ? 'page' : undefined}
      onClick={(event) => {
        if (path === '/menu' && !user) {
          event.preventDefault();
          openLogin();
        }
      }}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  ));
  return (
    <>
      <header className="bb-header">
        <div className="bb-header-inner">
          <NavLink className="bb-brand" to="/" aria-label="BalhinBalay home">
            <span>
              <Icon name="home" />
            </span>
            BalhinBalay
          </NavLink>
          <nav className="bb-desktop-navigation" aria-label="Main navigation">
            {links}
          </nav>
          <button
            type="button"
            className="bb-icon-button bb-inbox"
            onClick={() => (user ? navigate('/messages') : openLogin())}
            aria-label={`Messages${unreadChatCount > 0 ? `, ${unreadChatCount} unread` : ''}`}
          >
            <Icon name="message" />
            {unreadChatCount > 0 && <span className="bb-unread" />}
          </button>
          <button
            type="button"
            className="bb-avatar"
            aria-label={user ? 'Your profile' : 'Log in'}
            onClick={() => (user ? navigate('/menu') : openLogin())}
          >
            {user ? (
              (user.name || user.email)
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')
            ) : (
              <Icon name="user" />
            )}
          </button>
        </div>
      </header>
      {!hideBottomNav && (
        <nav className="bb-bottom-navigation" aria-label="Main navigation">
          {links}
        </nav>
      )}
    </>
  );
}
