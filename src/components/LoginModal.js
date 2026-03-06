import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        onClose();
        if (result.user && result.user.role === 'admin') {
          navigate('/admin');
        }
        setEmail('');
        setConfirmEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      } else {
        setError(result.message || 'Something went wrong.');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
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
                  onClick={() => { setTab('login'); setError(''); setConfirmEmail(''); setConfirmPassword(''); }}
                >
                  Log in
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={tab === 'register' ? 'active' : ''}
                  onClick={() => { setTab('register'); setError(''); setConfirmEmail(''); setConfirmPassword(''); }}
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
              {error && <p className="text-danger small mb-2">{error}</p>}
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
