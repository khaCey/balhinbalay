import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const { login, register, resendConfirmation, requestPasswordReset, resetPassword } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStep, setResetStep] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  useEffect(() => {
    if (!show) setResetStep(null);
  }, [show]);
  const passwordsMatch = tab === 'register' && password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = tab === 'register' && password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

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

  const handleForgotPassword = () => {
    setResetStep('email');
    setResetEmail(email.trim() || '');
    setResetCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Email is required.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await requestPasswordReset(resetEmail);
      if (result.ok) {
        setSuccess(result.message || 'Check your email for the reset code.');
        setResetStep('code');
      } else {
        setError(result.message || 'Failed to send code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(resetEmail, resetCode, resetNewPassword);
      if (result.ok) {
        setSuccess(result.message || 'Password updated. You can log in now.');
        setResetStep(null);
        setResetCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
      } else {
        setError(result.message || 'Reset failed.');
      }
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
            <h5 className="modal-title">
              {resetStep === 'email' ? 'Reset password' : resetStep === 'code' ? 'Enter code' : tab === 'login' ? 'Log in' : 'Sign up'}
            </h5>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
          <div className="modal-body">
            {resetStep !== null ? (
              <>
                {resetStep === 'email' && (
                  <form onSubmit={handleRequestResetCode}>
                    <p className="text-muted small mb-3">Enter your email and we&apos;ll send you a 5-digit code.</p>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    {success && <p className="text-success small mb-2">{success}</p>}
                    {error && <p className="text-danger small mb-2">{error}</p>}
                    <button type="submit" className="btn btn-primary w-100 btn-loading" disabled={loading}>
                      {loading ? <><i className="fas fa-spinner fa-spin auth-spinner" aria-hidden /><span>Sending...</span></> : 'Send code'}
                    </button>
                  </form>
                )}
                {resetStep === 'code' && (
                  <form onSubmit={handleResetPasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={resetEmail} readOnly disabled aria-readonly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">5-digit code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="12345"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        maxLength={5}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New password</label>
                      <div className="password-input-wrap">
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="••••••••"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button type="button" className="password-toggle-btn" onClick={() => setShowResetPassword((v) => !v)} aria-label={showResetPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
                          <i className={showResetPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden />
                        </button>
                      </div>
                      <p className="form-text small text-muted mb-0">At least 8 characters.</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm password</label>
                      <div className="password-input-wrap">
                        <input
                          type={showResetConfirmPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="••••••••"
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button type="button" className="password-toggle-btn" onClick={() => setShowResetConfirmPassword((v) => !v)} aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
                          <i className={showResetConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden />
                        </button>
                      </div>
                    </div>
                    {success && <p className="text-success small mb-2">{success}</p>}
                    {error && <p className="text-danger small mb-2">{error}</p>}
                    <button type="submit" className="btn btn-primary w-100 btn-loading" disabled={loading}>
                      {loading ? <><i className="fas fa-spinner fa-spin auth-spinner" aria-hidden /><span>Resetting...</span></> : 'Reset password'}
                    </button>
                  </form>
                )}
                <button type="button" className="btn btn-link btn-sm p-0 mt-2 text-secondary" onClick={() => { setResetStep(null); setError(''); setSuccess(''); }}>
                  Back to login
                </button>
              </>
            ) : (
            <>
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
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={tab === 'register' ? 8 : undefined}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden />
                  </button>
                </div>
                {tab === 'register' && (
                  <p className="form-text small text-muted mb-0">At least 8 characters.</p>
                )}
              </div>
              {tab === 'register' && (
                <div className="mb-3">
                  <label className="form-label">Confirm password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden />
                    </button>
                  </div>
                  {passwordsMatch && (
                    <p className="form-text small text-success mb-0 mt-1" role="status">Passwords match.</p>
                  )}
                  {passwordsMismatch && (
                    <p className="form-text small text-danger mb-0 mt-1" role="status">Passwords do not match.</p>
                  )}
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
              {tab === 'login' && (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 mb-2 text-primary d-block"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
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
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
