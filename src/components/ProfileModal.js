import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

const MIN_PASSWORD_LENGTH = 8;

const ProfileModal = ({ show, onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [editingProfileField, setEditingProfileField] = useState(null); // null | 'name' | 'email'
  const [showChangePasswordConfirm, setShowChangePasswordConfirm] = useState(false);

  useEffect(() => {
    if (show && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setError('');
      setSuccess(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess(false);
      setEditingProfileField(null);
      setShowChangePasswordConfirm(false);
    }
  }, [show, user]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const result = await updateProfile({ name: name.trim(), email: user?.email || '' });
      if (result.ok) {
        setSuccess(true);
        setEditingProfileField(null);
      } else {
        setError(result.message || 'Update failed.');
      }
    } catch (err) {
      setError(err?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const newEmail = email.trim();
    if (!newEmail) return;
    setLoading(true);
    try {
      const result = await updateProfile({ name: user?.name || '', email: newEmail });
      if (result.ok) {
        setSuccess(true);
        setEditingProfileField(null);
      } else {
        setError(result.message || 'Update failed.');
      }
    } catch (err) {
      setError(err?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setShowChangePasswordConfirm(true);
  };

  const doChangePassword = async () => {
    setShowChangePasswordConfirm(false);
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.ok) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || 'Could not change password.');
      }
    } catch (err) {
      setPasswordError(err?.message || 'Could not change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!show || !user) return null;

  return (
    <>
    <div className="modal auth-modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-backdrop fade show" onClick={onClose} aria-hidden />
      <div className="modal-dialog modal-dialog-centered profile-modal-dialog">
        <div className="modal-content login-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Account</h5>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
          <div className="modal-body profile-modal-body">
            <section className="profile-section">
              <h6 className="profile-section-title">Profile</h6>
              <p className="profile-section-hint">Tap the pencil next to a field to edit it.</p>
              <div className="profile-readonly-fields">
                {/* Name row */}
                <div className={`profile-info-row profile-info-row-single ${editingProfileField === 'name' ? 'profile-info-row-editing' : 'profile-info-row-readonly'}`}>
                  <div className="profile-info-row-label">Name</div>
                  <div className="profile-info-row-slot">
                    {editingProfileField === 'name' ? (
                      <form onSubmit={handleSaveName} className="profile-info-row-form profile-info-row-form-inline">
                        <input
                          type="text"
                          className="form-control form-control-sm profile-inline-input"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                        />
                        <button type="button" className="profile-cancel-edit-btn" onClick={() => { setEditingProfileField(null); setError(''); setName(user?.name || ''); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? '...' : 'Save'}</button>
                      </form>
                    ) : (
                      <>
                        <span className="profile-readonly-value">{name || '—'}</span>
                        <button type="button" className="profile-edit-btn profile-edit-btn-inline" onClick={() => setEditingProfileField('name')} aria-label="Edit name">
                          <i className="fas fa-pencil-alt" aria-hidden />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Email row - single field */}
                <div className={`profile-info-row profile-info-row-single ${editingProfileField === 'email' ? 'profile-info-row-editing' : 'profile-info-row-readonly'}`}>
                  <div className="profile-info-row-label">Email</div>
                  <div className="profile-info-row-slot">
                    {editingProfileField === 'email' ? (
                      <form onSubmit={handleSaveEmail} className="profile-info-row-form profile-info-row-form-inline">
                        <input
                          type="email"
                          className="form-control form-control-sm profile-inline-input"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                        <button type="button" className="profile-cancel-edit-btn" onClick={() => { setEditingProfileField(null); setError(''); setEmail(user?.email || ''); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? '...' : 'Save'}</button>
                      </form>
                    ) : (
                      <>
                        <span className="profile-readonly-value">{email || '—'}</span>
                        <button type="button" className="profile-edit-btn profile-edit-btn-inline" onClick={() => setEditingProfileField('email')} aria-label="Edit email">
                          <i className="fas fa-pencil-alt" aria-hidden />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {editingProfileField !== 'email' && error && <p className="text-danger small mt-2">{error}</p>}
              {success && editingProfileField === null && <p className="text-success small mt-2">Profile updated.</p>}
            </section>

            <section className="profile-section profile-section-password">
              <h6 className="profile-section-title">Change password</h6>
              <p className="profile-section-hint">Enter your current password and choose a new one (at least 8 characters).</p>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label">Current password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm new password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && <p className="text-danger small mb-2">{passwordError}</p>}
                {passwordSuccess && <p className="text-success small mb-2">Password changed.</p>}
                <button type="submit" className="btn btn-outline-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Change password'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
    <ConfirmModal
      show={showChangePasswordConfirm}
      title="Change password"
      message="Are you sure you want to change your password?"
      confirmLabel="Confirm"
      cancelLabel="Cancel"
      onConfirm={doChangePassword}
      onCancel={() => setShowChangePasswordConfirm(false)}
    />
    </>
  );
};

export default ProfileModal;
