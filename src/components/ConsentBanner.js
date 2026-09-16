import React from 'react';

export default function ConsentBanner({
  open,
  hasBottomNav = false,
  onAccept,
  onReject,
}) {
  if (!open) return null;

  return (
    <div
      className={`bb-consent-banner ${hasBottomNav ? 'bb-consent-banner--with-nav' : ''}`}
      role="dialog"
      aria-live="polite"
      aria-label="Analytics consent"
    >
      <div className="bb-consent-card">
        <p className="bb-consent-title">Privacy choices</p>
        <p className="bb-consent-copy">
          Allow analytics cookies so we can understand how people use
          BalhinBalay and improve search and listings.
        </p>
        <div className="bb-consent-actions">
          <button type="button" className="bb-button" onClick={onAccept}>
            Allow analytics
          </button>
          <button
            type="button"
            className="bb-button bb-secondary"
            onClick={onReject}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
