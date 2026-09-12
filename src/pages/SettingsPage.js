import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePush } from '../context/PushContext';
import { api } from '../api/client';
import BottomSheet from '../components/ui/BottomSheet';
import { Icon } from '../components/ui/Controls';
import { useLoginModal } from '../context/LoginModalContext';

function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLogin } = useLoginModal();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pushEnabled, setPushEnabled, triggerRegister } = usePush();
  const [pushLoading, setPushLoading] = useState(false);
  const [syncingFromServer, setSyncingFromServer] = useState(true);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const isNative = false;

  useEffect(() => {
    if (location.hash === '#delete-account' && user) setDeleteOpen(true);
  }, [location.hash, user]);

  const closeDelete = () => {
    if (deleteLoading) return;
    setDeleteOpen(false);
    setDeletePassword('');
    setDeleteError('');
    if (location.hash === '#delete-account')
      navigate('/settings', { replace: true });
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    if (!deletePassword.trim() || deleteLoading) return;
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await api.delete('/api/users/me', { password: deletePassword });
      logout();
      setDeletePassword('');
      navigate('/sale', { replace: true });
    } catch (err) {
      setDeleteError(
        err?.userMessage || err?.message || 'Could not delete account.',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isNative) {
      setSyncingFromServer(false);
      return;
    }
    api
      .get('/api/users/me')
      .then((data) => {
        if (data && typeof data.push_enabled === 'boolean') {
          setPushEnabled(data.push_enabled);
        }
      })
      .catch(() => {})
      .finally(() => setSyncingFromServer(false));
  }, [user, isNative, setPushEnabled]);

  const handlePushToggle = async (enabled) => {
    if (!user || pushLoading) return;
    setPushLoading(true);
    try {
      await setPushEnabled(enabled);
      await api.patch('/api/users/me', { push_enabled: enabled });
      if (!enabled) {
        await api.delete('/api/users/me/push-token');
      } else {
        triggerRegister?.();
      }
    } catch (err) {
      console.warn('[Settings] Push toggle failed:', err?.message || err);
    } finally {
      setPushLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="settings-page bb-account-page">
        <div className="bb-page-heading">
          <h1>Just how you like it.</h1>
        </div>
        <main className="page-content settings-page-content">
          <div className="settings-card settings-card-gate">
            <p className="text-muted">Log in to change settings.</p>
            <button type="button" className="bb-button" onClick={openLogin}>
              Log in
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-page bb-account-page">
      <button
        type="button"
        className="bb-text-button bb-back-link"
        onClick={() => navigate('/menu')}
      >
        ← Your profile
      </button>
      <div className="bb-page-heading">
        <h1>Just how you like it.</h1>
      </div>
      <main className="page-content settings-page-content">
        <section
          className="settings-block"
          aria-labelledby="settings-notifications-heading"
        >
          <h2
            id="settings-notifications-heading"
            className="settings-block-title"
          >
            Notifications
          </h2>
          <div className="settings-card">
            {isNative ? (
              <div className="settings-row settings-row--interactive">
                <label
                  htmlFor="settings-push-toggle"
                  className="settings-row-label"
                >
                  <i className="fas fa-bell settings-row-icon" aria-hidden />
                  Push notifications
                </label>
                <button
                  id="settings-push-toggle"
                  type="button"
                  role="switch"
                  aria-checked={pushEnabled}
                  aria-busy={pushLoading || syncingFromServer}
                  disabled={pushLoading || syncingFromServer}
                  className={`settings-toggle ${pushEnabled ? 'settings-toggle--on' : ''}`}
                  onClick={() => handlePushToggle(!pushEnabled)}
                >
                  <span className="settings-toggle-thumb" />
                </button>
              </div>
            ) : (
              <>
                <div className="settings-row">
                  <span className="settings-row-label">
                    <i className="fas fa-bell settings-row-icon" aria-hidden />
                    Push notifications
                  </span>
                  <span className="settings-row-meta">
                    Not available on the web
                  </span>
                </div>
                <p className="settings-hint">
                  You can read and reply to property enquiries in Messages.
                </p>
              </>
            )}
          </div>
        </section>

        <div className="bb-panel bb-account-actions">
          <button type="button" onClick={() => navigate('/profile')}>
            <Icon name="user" />
            <span>Your profile</span>
            <Icon name="arrow" />
          </button>
          <button type="button" onClick={() => navigate('/profile#password')}>
            <Icon name="key" />
            <span>Reset password</span>
            <Icon name="arrow" />
          </button>
          <button
            type="button"
            className="bb-danger-text"
            onClick={() => setDeleteOpen(true)}
          >
            <Icon name="trash" />
            <span>Delete account</span>
            <Icon name="arrow" />
          </button>
        </div>
        <BottomSheet
          open={deleteOpen}
          title="Delete your account?"
          onClose={closeDelete}
          footer={
            <button
              type="submit"
              form="bb-delete-account"
              className="bb-button bb-danger"
              disabled={!deletePassword.trim() || deleteLoading}
            >
              {deleteLoading ? 'Deleting…' : 'Delete my account'}
            </button>
          }
        >
          <p className="bb-notice">
            Permanently delete your account and all associated data (listings,
            saved searches, favourites and messages). This cannot be undone.
          </p>
          <form id="bb-delete-account" onSubmit={handleDelete}>
            <label className="bb-field">
              <span>Confirm your password</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                disabled={deleteLoading}
                autoComplete="current-password"
                required
              />
            </label>
            {deleteError && (
              <p role="alert" className="bb-form-error">
                {deleteError}
              </p>
            )}
          </form>
        </BottomSheet>
      </main>
    </div>
  );
}

export default SettingsPage;
