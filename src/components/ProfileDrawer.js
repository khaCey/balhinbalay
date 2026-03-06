import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function ProfileDrawer({ open, onClose, user, onAddProperty, onMyProperties, onProfile, onLogout, loggingOut }) {
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
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="profile-drawer-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            tabIndex={-1}
          />
          <motion.aside
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
                  <i className="fas fa-user" aria-hidden />
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
              </div>

              <div className="profile-drawer-section-label profile-drawer-account">Account</div>
              <div className="profile-drawer-nav">
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
        </>
      )}
    </AnimatePresence>
  );
}

export default ProfileDrawer;
