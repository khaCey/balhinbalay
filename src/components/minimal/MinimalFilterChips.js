import React from 'react';

export default function MinimalFilterChips({
  chips = [],
  onSelect,
  activeId = '',
  className = '',
  ariaLabel = 'Quick filters'
}) {
  if (!Array.isArray(chips) || chips.length === 0) return null;

  return (
    <div className={`minimal-filter-chips ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          role="tab"
          aria-selected={chip.id === activeId}
          className={`minimal-chip ${chip.id === activeId ? 'is-active' : ''}`}
          onClick={() => onSelect?.(chip)}
        >
          {chip.icon && <i className={`fas ${chip.icon}`} aria-hidden />}
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
}
