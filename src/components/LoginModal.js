import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const { login, register, resendConfirmation } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowResend(false);
    if (tab === 'register') {
      if (email.trim() !== confirmEmail.trim()) {
        setError('Email and confirm email do not match.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and confirm password do not match.');
        return;
      }
    }
    setLoading(true);
    try {
      const result = tab === 'login' ? await login(email, password) : await register(email, password, name);
      if (result.ok) {
        if (result.requiresConfirmation) {
          setSuccess(result.message || 'Check your email to confirm your account.');
          setTab('login');
          setPassword('');
          setConfirmPassword('');
        } else if (result.user) {
          onClose();
          if (result.user.role === 'admin') {
            navigate('/admin');
          }
          setEmail('');
          setConfirmEmail('');
          setPassword('');
          setConfirmPassword('');
          setName('');
        }
      } else {
        setError(result.message || 'Something went wrong.');
        setShowResend(result.code === 'EMAIL_NOT_VERIFIED');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) return;
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const result = await resendConfirmation(email);
      if (result.ok) {
        setSuccess(result.message || 'Confirmation email sent. Check your inbox.');
      } else {
        setError(result.message || 'Failed to resend.');
      }
    } finally {
      setResending(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal auth-modal login-modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-backdrop fade show" onClick={onClose} aria-hidden />
      <div className="modal-dialog modal-dialog-centered login-modal-dialog">
        <div className="modal-content login-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{tab === 'login' ? 'Log in' : 'Sign up'}</h5>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
          <div className="modal-body">
            <ul className="login-tabs">
              <li>
                <button
                  type="button"
                  className={tab === 'login' ? 'active' : ''}
                  onClick={() => { setTab('login'); setError(''); setSuccess(''); setShowResend(false); setConfirmEmail(''); setConfirmPassword(''); }}
                >
                  Log in
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={tab === 'register' ? 'active' : ''}
                  onClick={() => { setTab('register'); setError(''); setSuccess(''); setShowResend(false); setConfirmEmail(''); setConfirmPassword(''); }}
                >
                  Sign up
                </button>
              </li>
            </ul>
            <form onSubmit={handleSubmit}>
              {tab === 'register' && (
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              {tab === 'register' && (
                <div className="mb-3">
                  <label className="form-label">Confirm email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={tab === 'register' ? 8 : undefined}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                {tab === 'register' && (
                  <p className="form-text small text-muted mb-0">At least 8 characters.</p>
                )}
              </div>
              {tab === 'register' && (
                <div className="mb-3">
                  <label className="form-label">Confirm password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              )}
              {success && <p className="text-success small mb-2">{success}</p>}
              {error && <p className="text-danger small mb-2">{error}</p>}
              {showResend && tab === 'login' && (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 mb-2 text-primary"
                  onClick={handleResendConfirmation}
                  disabled={resending || !email.trim()}
                >
                  {resending ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
              <button type="submit" className="btn btn-primary w-100 btn-loading" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin auth-spinner" aria-hidden />
                    <span>{tab === 'login' ? 'Logging in...' : 'Signing up...'}</span>
                  </>
                ) : (
                  tab === 'login' ? 'Log in' : 'Create account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
