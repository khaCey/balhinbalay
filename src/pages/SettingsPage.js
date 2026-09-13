import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
