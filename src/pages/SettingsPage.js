import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePush } from '../context/PushContext';
import { useTheme } from '../context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const deleteSectionRef = useRef(null);
  const { user, logout } = useAuth();
  const { pushEnabled, setPushEnabled, triggerRegister } = usePush();
  const { theme, setTheme, isDesktop } = useTheme();
  const [pushLoading, setPushLoading] = useState(false);
  const [syncingFromServer, setSyncingFromServer] = useState(true);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (location.hash === '#delete-account' && deleteSectionRef.current && user) {
      deleteSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, user]);

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!user || !isNative) {
      setSyncingFromServer(false);
      return;
    }
    api.get('/api/users/me')
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
      <div className="settings-page">
        <PageHeader title="Settings" onBack={() => navigate('/sale')} />
        <main className="page-content settings-page-content">
          <div className="settings-card" style={{ padding: '1.5rem 1.25rem' }}>
            <p className="text-muted mb-0">Log in to change settings.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <PageHeader title="Settings" onBack={handleBack} />
      <main className="page-content settings-page-content">
        {!isDesktop && (
        <section className="settings-block" aria-labelledby="settings-appearance-heading">
          <h2 id="settings-appearance-heading" className="settings-block-title">Appearance</h2>
          <div className="settings-card">
            <div className="settings-row">
              <span className="settings-row-label">
                <i className="fas fa-palette settings-row-icon" aria-hidden />
                Theme
              </span>
            </div>
            <div className="settings-theme-options" role="group" aria-label="Theme">
              <button
                type="button"
                className={`settings-theme-btn ${theme === 'system' ? 'settings-theme-btn--active' : ''}`}
                onClick={() => setTheme('system')}
                aria-pressed={theme === 'system'}
                title="Use device setting"
              >
                <i className="fas fa-circle-half-stroke" aria-hidden />
                <span>System</span>
              </button>
              <button
                type="button"
                className={`settings-theme-btn ${theme === 'light' ? 'settings-theme-btn--active' : ''}`}
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                title="Light mode"
              >
                <i className="fas fa-sun" aria-hidden />
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`settings-theme-btn ${theme === 'dark' ? 'settings-theme-btn--active' : ''}`}
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                title="Dark mode"
              >
                <i className="fas fa-moon" aria-hidden />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </section>
        )}

        <section className="settings-block" aria-labelledby="settings-notifications-heading">
          <h2 id="settings-notifications-heading" className="settings-block-title">Notifications</h2>
          <div className="settings-card">
            {isNative ? (
              <div className="settings-row settings-row--interactive">
                <label htmlFor="settings-push-toggle" className="settings-row-label">
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
                  <span className="settings-row-meta">Available on device</span>
                </div>
                <p className="settings-hint">Enable or disable in the app on your phone or tablet.</p>
              </>
            )}
          </div>
        </section>

        <section className="settings-block" aria-labelledby="settings-account-heading">
          <h2 id="settings-account-heading" className="settings-block-title">Account</h2>
          <div className="settings-card">
            <button
              type="button"
              className="settings-row settings-row--interactive settings-row--link"
              onClick={() => navigate('/profile')}
            >
              <span className="settings-row-label">
                <i className="fas fa-user settings-row-icon" aria-hidden />
                Profile & password
              </span>
              <i className="fas fa-chevron-right settings-row-chevron" aria-hidden />
            </button>
          </div>
        </section>

        <section id="delete-account-section" ref={deleteSectionRef} className="settings-block settings-block--danger" aria-labelledby="settings-danger-heading">
          <h2 id="settings-danger-heading" className="settings-block-title settings-block-title--danger">Danger zone</h2>
          <div className="settings-card settings-card--danger">
            <h3 className="settings-danger-heading">Delete account</h3>
            <p className="settings-danger-desc">
              Permanently delete your account and all associated data (listings, saved searches, favorites, messages). This cannot be undone.
            </p>
            <div className="settings-delete-form">
              <label htmlFor="settings-delete-password" className="form-label">Confirm your password</label>
              <input
                id="settings-delete-password"
                type="password"
                className="form-control settings-delete-input"
                placeholder="Your password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                disabled={deleteLoading}
                autoComplete="current-password"
              />
              {deleteError && <p className="text-danger small mt-1 mb-0">{deleteError}</p>}
              <button
                type="button"
                className="settings-delete-btn"
                disabled={!deletePassword.trim() || deleteLoading}
                onClick={async () => {
                  if (!deletePassword.trim()) return;
                  setDeleteError('');
                  setDeleteLoading(true);
                  try {
                    await api.delete('/api/users/me', { password: deletePassword });
                    logout();
                    setDeletePassword('');
                    navigate('/sale', { replace: true });
                  } catch (err) {
                    setDeleteError(err?.userMessage || err?.message || 'Could not delete account.');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2" aria-hidden />
                    Deleting…
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt me-2" aria-hidden />
                    Delete my account
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SettingsPage;
