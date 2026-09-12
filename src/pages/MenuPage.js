import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseUrl } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import { Icon } from '../components/ui/Controls';

function MenuItem({ icon, title, description, onClick, danger = false }) {
  return (
    <button
      type="button"
      className={danger ? 'bb-account-menu-item bb-danger-text' : 'bb-account-menu-item'}
      onClick={onClick}
    >
      <Icon name={icon} />
      <span className="bb-account-menu-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <span className="bb-account-chevron">›</span>
    </button>
  );
}

function MenuPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigate('/', { replace: true });
    }, 400);
  };

  const avatarUrl = user.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : (baseUrl || '') + user.avatar_url
    : null;

  return (
    <div className="menu-page minimal-page bb-account-page">
      <div className="menu-page-body profile-drawer-body">
        <div className="bb-page-heading">
          <h1>Your corner.</h1>
        </div>
        <div className="account-card bb-account-summary">
          <div className="avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              (user.name || user.email || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="bb-account-summary-copy">
            <h2>{user.name || user.email || 'User'}</h2>
            <p>{user.email || 'Account'}</p>
            <button
              type="button"
              className="bb-text-button"
              onClick={() => navigate('/profile')}
            >
              Edit profile
            </button>
          </div>
        </div>

        <div className="account-menu bb-account-menu-group">
          <MenuItem
            icon="heart"
            title="Saved places"
            description="All your possibilities, together"
            onClick={() => navigate('/saved')}
          />
          <MenuItem
            icon="message"
            title="Messages"
            description="Keep your property enquiries in view"
            onClick={() => navigate('/messages')}
          />
          <MenuItem
            icon="home"
            title="My properties"
            description="Manage your listings"
            onClick={() => navigate('/my-properties')}
          />
          <MenuItem
            icon="plus"
            title="List a property"
            description="Help someone find their next home"
            onClick={() => navigate('/add-property')}
          />
        </div>

        <div className="account-menu bb-account-menu-group">
          <MenuItem
            icon="user"
            title="Settings"
            description="Notifications, privacy and account"
            onClick={() => navigate('/settings')}
          />
          <MenuItem
            icon="logout"
            title={loggingOut ? 'Logging out…' : 'Log out'}
            description="Sign out of this account"
            danger
            onClick={() => {
              if (!loggingOut) setShowLogoutConfirm(true);
            }}
          />
        </div>
      </div>

      <ConfirmModal
        show={showLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

export default MenuPage;
