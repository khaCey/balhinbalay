import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { baseUrl } from '../api/client';
import PageHeader from '../components/PageHeader';
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
    <div className="menu-page page-with-header">
      <PageHeader title="Menu" onBack={() => navigate(-1)} />
      <div className="menu-page-body profile-drawer-body">
        <div className="profile-drawer-chip">
          <div className="profile-drawer-avatar">
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
              <i className="fas fa-user" aria-hidden />
            )}
          </div>
          <div>
            <span className="profile-drawer-name">{user.name || user.email || 'User'}</span>
            <span className="profile-drawer-role">{user.role === 'agent' ? 'Agent' : 'Account'}</span>
          </div>
        </div>

        <div className="profile-drawer-section-label">Main</div>
        <div className="profile-drawer-nav">
          <button type="button" onClick={() => navigate('/add-property')}>
            <i className="fas fa-plus" aria-hidden />
            <span>Add property</span>
          </button>
          <button type="button" onClick={() => navigate('/sale')}>
            <i className="fas fa-house" aria-hidden />
            <span>My properties</span>
          </button>
          <button type="button" onClick={() => navigate('/saved')}>
            <i className="fas fa-heart" aria-hidden />
            <span>Saved properties</span>
          </button>
          <button type="button" onClick={handleOpenSavedSearches}>
            <i className="fas fa-bookmark" aria-hidden />
            <span>Saved searches</span>
          </button>
        </div>

        <div className="profile-drawer-section-label profile-drawer-account">Account</div>
        <div className="profile-drawer-nav">
          <button type="button" onClick={() => navigate('/settings')}>
            <i className="fas fa-gear" aria-hidden />
            <span>Settings</span>
          </button>
          <button
            type="button"
            className="profile-drawer-item-danger"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <i className="fas fa-spinner fa-spin" aria-hidden />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <i className="fas fa-sign-out-alt" aria-hidden />
                <span>Log out</span>
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
