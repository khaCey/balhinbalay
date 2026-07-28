import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { baseUrl } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';

function MenuPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasSearched, lastSearchState } = useSearch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

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

  return (
    <div className="menu-page minimal-page">
      <div className="menu-page-body profile-drawer-body">
        <div className="prototype-home-topbar">
          <div className="minimal-wordmark">BalhinBalay</div>
          <button type="button" className="prototype-icon-button prototype-icon-button-clear" onClick={() => navigate('/settings')} aria-label="Settings">
            <i className="fas fa-cog" aria-hidden />
          </button>
        </div>

        <div className="saved-header">
          <h2>My account</h2>
          <p>Manage your searches, enquiries and preferences.</p>
        </div>

        <div className="account-card">
          <div className="avatar">
            {user.avatar_url ? (
              <img
                src={
                  user.avatar_url.startsWith('http')
                    ? user.avatar_url
                    : (baseUrl || '') + user.avatar_url
                }
                alt=""
              />
            ) : (
              (user.name || user.email || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3>{user.name || user.email || 'User'}</h3>
            <p>{user.email || 'Account'}</p>
          </div>
        </div>

        <div className="account-menu">
          <button type="button" onClick={() => navigate('/add-property')}>
            <span>Add property</span>
            <span>›</span>
          </button>
          <button type="button" onClick={() => navigate('/my-properties')}>
            <span>My properties</span>
            <span>›</span>
          </button>
          <button type="button" onClick={() => navigate('/saved')}>
            <span>Saved properties</span>
            <span>›</span>
          </button>
          <button type="button" onClick={handleOpenSavedSearches}>
            <span>Saved searches</span>
            <span>›</span>
          </button>
          <button type="button" onClick={() => navigate('/settings')}>
            <span>Settings</span>
            <span>›</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <span>Logging out...</span>
                <span>›</span>
              </>
            ) : (
              <>
                <span>Log out</span>
                <span>›</span>
              </>
            )}
          </button>
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
