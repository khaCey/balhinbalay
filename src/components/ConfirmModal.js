import React from 'react';

const ConfirmModal = ({
  show,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant,
  alertOnly = false,
}) => {
  if (!show) return null;

  const confirmClass = variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
  const handleDismiss = onCancel || onConfirm;

  return (
    <div className="modal auth-modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-backdrop fade show" onClick={handleDismiss} aria-hidden />
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content login-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="modal-close-btn" onClick={handleDismiss} aria-label="Close">
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
            <div className="d-flex gap-2 mt-3 justify-content-end">
              {!alertOnly && (
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                  {cancelLabel}
                </button>
              )}
              <button type="button" className={confirmClass} onClick={alertOnly ? handleDismiss : onConfirm}>
                {alertOnly ? 'OK' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
