import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../context/LoginModalContext';
import { Icon } from '../components/ui/Controls';
import { api, baseUrl } from '../api/client';

const MIN_PASSWORD_LENGTH = 8;
const AVATAR_MAX_DIM = 400;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function resizeImageToDataUrl(dataUrl, maxDim) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passwordSectionRef = useRef(null);
  const {
    user,
    updateProfile,
    refreshUser,
    requestPasswordReset,
    resetPassword,
  } = useAuth();
  const { openLogin } = useLoginModal();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);
  const [resetStep, setResetStep] = useState(null);
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (location.hash === '#password' && user)
      passwordSectionRef.current?.scrollIntoView({ block: 'start' });
  }, [location.hash, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const result = await updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      if (result.ok) setSuccess(true);
      else setError(result.message || 'Update failed.');
    } catch (err) {
      setError(err?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = user?.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : (baseUrl || '') + user.avatar_url
    : null;

  const handleAvatarChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    setAvatarError('');
    setAvatarLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const resized = await resizeImageToDataUrl(dataUrl, AVATAR_MAX_DIM);
      if (!resized) throw new Error('Image could not be processed.');
      const { avatar_url: newUrl } = await api.post('/api/users/me/avatar', {
        image: resized,
      });
      await refreshUser();
      if (!newUrl) setAvatarError('Image could not be processed.');
    } catch (err) {
      setAvatarError(err?.message || 'Upload failed.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarError('');
    setAvatarLoading(true);
    try {
      await api.delete('/api/users/me/avatar');
      await refreshUser();
    } catch (err) {
      setAvatarError(err?.message || 'Remove failed.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    const emailToUse = (user?.email || '').trim();
    if (!emailToUse) {
      setResetError('Email is required.');
      return;
    }
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      const result = await requestPasswordReset(emailToUse);
      if (result.ok) {
        setResetSuccess(
          result.message || 'Check your email for the reset code.',
        );
        setResetStep('code');
      } else {
        setResetError(result.message || 'Failed to send code.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    if (resetNewPassword.length < MIN_PASSWORD_LENGTH) {
      setResetError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    setResetLoading(true);
    try {
      const result = await resetPassword(
        user?.email || '',
        resetCode,
        resetNewPassword,
      );
      if (result.ok) {
        setResetSuccess(result.message || 'Password updated.');
        setResetStep(null);
        setResetCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
      } else {
        setResetError(result.message || 'Reset failed.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page page-with-header minimal-page">
        <div className="bb-page-heading">
          <h1>Your profile</h1>
        </div>
        <main className="page-content">
          <div className="page-section page-section-gate">
            <p className="page-gate-text">Log in to view your profile.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openLogin}
            >
              Log in
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="profile-page bb-account-page">
        <button
          type="button"
          className="bb-text-button bb-back-link"
          onClick={() => navigate('/menu')}
        >
          ← Your profile
        </button>
        <div className="bb-page-heading">
          <h1>Make yourself at home.</h1>
        </div>
        <main className="page-content">
          <form
            className="bb-panel bb-profile-form"
            onSubmit={handleSaveProfile}
          >
            <div className="bb-upload-zone">
              {avatarUrl ? (
                <img
                  className="bb-profile-photo"
                  src={avatarUrl}
                  alt="Your profile"
                />
              ) : (
                <Icon name="user" />
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="bb-visually-hidden"
                aria-label="Profile photo"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
              />
              <button
                type="button"
                className="bb-text-button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
              >
                {avatarLoading ? 'Updating…' : 'Change profile photo'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  className="bb-text-button"
                  onClick={handleAvatarRemove}
                  disabled={avatarLoading}
                >
                  Remove photo
                </button>
              )}
            </div>
            {avatarError && (
              <p role="alert" className="bb-form-error">
                {avatarError}
              </p>
            )}
            <label className="bb-field">
              <span>Name</span>
              <input
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSuccess(false);
                }}
                autoComplete="name"
              />
            </label>
            <label className="bb-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSuccess(false);
                }}
                required
                autoComplete="email"
              />
            </label>
            {error && (
              <p role="alert" className="bb-form-error">
                {error}
              </p>
            )}
            {success && <p role="status">Profile updated.</p>}
            <button
              type="submit"
              className="bb-button bb-full"
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </form>

          <section
            ref={passwordSectionRef}
            id="password"
            className="page-section profile-page-section profile-section-password"
          >
            <h2 className="profile-section-title">Change password</h2>
            <p className="profile-section-hint">
              We’ll send a 5-digit code to your email. Enter the code and choose
              a new password (at least 8 characters).
            </p>
            {resetStep === null && resetSuccess && (
              <p role="status">{resetSuccess}</p>
            )}
            {resetStep === null && (
              <button
                type="button"
                className="bb-button bb-secondary"
                onClick={() => {
                  setResetStep('email');
                  setResetError('');
                  setResetSuccess('');
                }}
              >
                Send reset code to my email
              </button>
            )}
            {resetStep === 'email' && (
              <form onSubmit={handleRequestResetCode}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="reset-email">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-control"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    aria-readonly
                  />
                </div>
                {resetSuccess && (
                  <p className="text-success small mb-2">{resetSuccess}</p>
                )}
                {resetError && (
                  <p className="text-danger small mb-2">{resetError}</p>
                )}
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending...' : 'Send code'}
                </button>
                <button
                  type="button"
                  className="btn btn-link btn-sm ms-2"
                  onClick={() => {
                    setResetStep(null);
                    setResetError('');
                    setResetSuccess('');
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
            {resetStep === 'code' && (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="reset-email">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-control"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    aria-readonly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="reset-code">
                    5-digit code
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    className="form-control"
                    placeholder="12345"
                    value={resetCode}
                    onChange={(e) =>
                      setResetCode(
                        e.target.value.replace(/\D/g, '').slice(0, 5),
                      )
                    }
                    maxLength={5}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="reset-password">
                    New password
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id="reset-password"
                      type={showResetPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowResetPassword((v) => !v)}
                      aria-label={
                        showResetPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <i
                        className={
                          showResetPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                        }
                        aria-hidden
                      />
                    </button>
                  </div>
                  <p className="form-text small text-muted mb-0">
                    At least 8 characters.
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="reset-confirm">
                    Confirm password
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id="reset-confirm"
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowResetConfirmPassword((v) => !v)}
                      aria-label={
                        showResetConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      <i
                        className={
                          showResetConfirmPassword
                            ? 'fas fa-eye-slash'
                            : 'fas fa-eye'
                        }
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>
                {resetSuccess && (
                  <p className="text-success small mb-2">{resetSuccess}</p>
                )}
                {resetError && (
                  <p className="text-danger small mb-2">{resetError}</p>
                )}
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : 'Reset password'}
                </button>
                <button
                  type="button"
                  className="btn btn-link btn-sm ms-2"
                  onClick={() => {
                    setResetStep('email');
                    setResetCode('');
                    setResetNewPassword('');
                    setResetConfirmPassword('');
                    setResetError('');
                    setResetSuccess('');
                  }}
                >
                  Back
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default ProfilePage;
