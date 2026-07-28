import React from 'react';

export default function MinimalSearchSummary({
  heading = '',
  locationLabel = '',
  criteriaLabel = '',
  onOpenSearch,
  actionLabel = 'Search properties',
  className = ''
}) {
  return (
    <section className={`minimal-search-summary ${className}`.trim()} aria-label="Search summary">
      {heading && <p className="minimal-search-summary-kicker">{heading}</p>}
      <button type="button" className="minimal-search-summary-main search-input" onClick={onOpenSearch}>
        <span className="search-icon" aria-hidden>
          <i className="fas fa-search" />
        </span>
        <span className="label">
          <strong>{locationLabel || 'Philippines'}</strong>
          <span>{criteriaLabel || 'Any budget, any home'}</span>
        </span>
        <span aria-hidden>›</span>
      </button>
      {onOpenSearch && (
        <button type="button" className="minimal-search-summary-edit search-action" onClick={onOpenSearch}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}
