import React from 'react';

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'size-large', label: 'Size: largest first' },
  { value: 'size-small', label: 'Size: smallest first' }
];

export function getSortLabel(sortBy) {
  return SORT_OPTIONS.find((option) => option.value === sortBy)?.label || 'Newest first';
}

const SortBar = ({
  sortBy,
  onSortChange,
  totalResults,
  isMyProperties = false,
  compact = false,
  variant = 'default'
}) => {
  const effectiveVariant = variant !== 'default' ? variant : (compact ? 'compact' : 'default');

  const resultsText =
    effectiveVariant === 'compact' && !isMyProperties
      ? 'results'
      : isMyProperties
        ? (totalResults === 1 ? 'your property' : 'your properties')
        : (totalResults === 1 ? 'property' : 'properties');

  const barClass =
    effectiveVariant === 'compact'
      ? 'sort-bar sort-bar-compact'
      : effectiveVariant === 'portalStrip'
        ? 'sort-bar sort-bar-portal-strip'
        : 'sort-bar';

  const orderLabelClass =
    effectiveVariant === 'portalStrip' ? 'sort-bar-label visually-hidden' : 'sort-bar-label';

  return (
    <section className={barClass} aria-label="Results controls">
      <div className="sort-bar-left">
        {effectiveVariant === 'portalStrip' ? (
          <div className="results-count-portal" role="status" aria-live="polite">
            <span className="results-count-portal-prefix">Search results</span>
            <strong className="results-count-portal-num">{totalResults.toLocaleString()}</strong>
            <span className="results-count-portal-suffix">{resultsText}</span>
          </div>
        ) : (
          <div className="results-count-cluster" role="status" aria-live="polite">
            <strong className="results-count-number">{totalResults.toLocaleString()}</strong>
            <span className="results-count-text">{resultsText}</span>
          </div>
        )}
      </div>

      <div className="sort-bar-right">
        <label
          htmlFor="sort-dropdown"
          className={`sort-control${effectiveVariant === 'portalStrip' ? ' sort-control--portal' : ''}`}
        >
          <span className={orderLabelClass}>Order</span>
          {effectiveVariant === 'portalStrip' ? (
            <div className="sort-select-shell sort-select-shell--portal">
              <span className="sort-select-arrows" aria-hidden="true">
                <i className="fas fa-arrows-alt-v" />
              </span>
              <select
                id="sort-dropdown"
                className="form-select sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Sort results by"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <select
              id="sort-dropdown"
              className="form-select sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort results by"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
        </label>
      </div>
    </section>
  );
};

export default SortBar;
