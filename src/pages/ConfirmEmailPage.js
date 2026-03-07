import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { baseUrl } from '../api/client';

function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error | invalid
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !token.trim()) {
      setStatus('invalid');
      setMessage('Invalid confirmation link.');
      return;
    }
    const url = `${baseUrl}/api/auth/confirm-email?token=${encodeURIComponent(token)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success');
          setMessage(data.message || 'Email confirmed. You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Confirmation failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not confirm. Please try again or request a new link.');
      });
  }, [token]);

  const handleGoToLogin = () => {
    navigate('/sale', { state: { openLogin: true } });
  };

  return (
    <div className="confirm-email-page">
      <div className="confirm-email-card">
        {status === 'loading' && (
          <>
            <div className="confirm-email-spinner">
              <i className="fas fa-spinner fa-spin" aria-hidden />
            </div>
            <p>Confirming your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="confirm-email-icon success">
              <i className="fas fa-check-circle" aria-hidden />
            </div>
            <h1>Email confirmed</h1>
            <p>{message}</p>
            <button type="button" className="btn btn-primary confirm-email-btn" onClick={handleGoToLogin}>
              Log in
            </button>
          </>
        )}
        {(status === 'error' || status === 'invalid') && (
          <>
            <div className="confirm-email-icon error">
              <i className="fas fa-exclamation-circle" aria-hidden />
            </div>
            <h1>Confirmation failed</h1>
            <p>{message}</p>
            <button type="button" className="btn btn-primary confirm-email-btn" onClick={handleGoToLogin}>
              Go to log in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmEmailPage;
