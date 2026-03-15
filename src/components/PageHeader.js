import React from 'react';

/**
 * Unified page header: back (left) + title (center) + optional actions (right).
 * @param {string|React.ReactNode} title - Header title text or node
 * @param {function} [onBack] - If provided, shows back button and calls on Back click
 * @param {React.ReactNode} [right] - Optional node for right-side actions
 * @param {string} [className] - Optional extra class(es) for the header element
 */
function PageHeader({ title, onBack, right, className }) {
  return (
    <header className={`page-header ${className || ''}`.trim()}>
      {onBack != null ? (
        <button
          type="button"
          className="page-header-back"
          onClick={onBack}
          aria-label="Back"
        >
          <i className="fas fa-arrow-left" aria-hidden />
        </button>
      ) : (
        <span className="page-header-back-placeholder" aria-hidden />
      )}
      <h1 className="page-header-title">{title}</h1>
      {right != null ? (
        <div className="page-header-right">{right}</div>
      ) : (
        <span className="page-header-right-placeholder" aria-hidden />
      )}
    </header>
  );
}

export default PageHeader;
