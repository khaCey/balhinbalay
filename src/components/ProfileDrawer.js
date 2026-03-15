import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { baseUrl } from '../api/client';

function ProfileDrawer({ open, onClose, user, onAddProperty, onMyProperties, onOpenSavedProperties, onOpenSavedSearches, onSettings, onProfile, onDeleteAccount, onLogout, loggingOut, isNative }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleAction = (fn) => {
    if (fn) fn();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-drawer-scrim"
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
          className="profile-drawer-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); } }}
        />
      )}
      {open && (
        <motion.aside
          key="profile-drawer-panel"
          className="profile-drawer-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className="profile-drawer-header">
              <div className="profile-drawer-brand">
                <div className="profile-drawer-user-info">
                  <span className="profile-drawer-email">{user?.email || '—'}</span>
                </div>
              </div>
              <button
                type="button"
                className="profile-drawer-close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <i className="fas fa-times" aria-hidden />
              </button>
            </div>

            <div className="profile-drawer-body">
              <div className="profile-drawer-chip">
                <div className="profile-drawer-avatar">
                  {user?.avatar_url ? (
                    <img src={(user.avatar_url.startsWith('http') ? user.avatar_url : (baseUrl || '') + user.avatar_url)} alt="" />
                  ) : (
                    <i className="fas fa-user" aria-hidden />
                  )}
                </div>
                <div>
                  <span className="profile-drawer-name">{user?.name || user?.email || 'User'}</span>
                  <span className="profile-drawer-role">{user?.role === 'agent' ? 'Agent' : 'Account'}</span>
                </div>
              </div>

              <div className="profile-drawer-section-label">Main</div>
              <div className="profile-drawer-nav">
                <button type="button" onClick={() => handleAction(onAddProperty)}>
                  <i className="fas fa-plus" aria-hidden />
                  <span>Add property</span>
                </button>
                <button type="button" onClick={() => handleAction(onMyProperties)}>
                  <i className="fas fa-house" aria-hidden />
                  <span>My properties</span>
                </button>
                {onOpenSavedProperties && (
                  <button type="button" onClick={() => { handleAction(onOpenSavedProperties); onClose(); }}>
                    <i className="fas fa-heart" aria-hidden />
                    <span>Saved properties</span>
                  </button>
                )}
                {onOpenSavedSearches && (
                  <button type="button" onClick={() => { handleAction(onOpenSavedSearches); onClose(); }}>
                    <i className="fas fa-bookmark" aria-hidden />
                    <span>Saved searches</span>
                  </button>
                )}
              </div>

              <div className="profile-drawer-section-label profile-drawer-account">Account</div>
              <div className="profile-drawer-nav">
                {onSettings && (
                  <button type="button" onClick={() => { handleAction(onSettings); onClose(); }}>
                    <i className="fas fa-gear" aria-hidden />
                    <span>Settings</span>
                  </button>
                )}
                {onDeleteAccount && (
                  <button type="button" className="profile-drawer-item-danger" onClick={() => { handleAction(onDeleteAccount); onClose(); }}>
                    <i className="fas fa-trash-alt" aria-hidden />
                    <span>Delete account</span>
                  </button>
                )}
                <button type="button" onClick={() => handleAction(onProfile)}>
                  <i className="fas fa-circle-user" aria-hidden />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  className="profile-drawer-item-danger"
                  onClick={() => handleAction(onLogout)}
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
          </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default ProfileDrawer;
