import React from 'react';

export default function ConsentBanner({ open, hasBottomNav = false, onAccept, onReject }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Analytics consent"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: hasBottomNav
          ? 'calc(12px + var(--bb-bottom-nav-base) + env(safe-area-inset-bottom, 0px))'
          : 'calc(12px + env(safe-area-inset-bottom, 0px))',
        zIndex: 1200
      }}
    >
      <div className="card shadow-sm border-0">
        <div className="card-body py-3">
          <p className="mb-2 fw-semibold">Privacy choices</p>
          <p className="mb-3 text-muted small">
            Allow analytics cookies so we can understand how people use BalhinBalay and improve search and listings.
          </p>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={onAccept}>
              Allow analytics
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onReject}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
