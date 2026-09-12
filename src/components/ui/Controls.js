import React from 'react';

export function Icon({ name, ...props }) {
  const paths = {
    trash: 'M3 6h18M9 3h6M6 6l1 15h10l1-15M10 10v7m4-7v7',
    edit: 'm4 15 12-12 5 5L9 20l-6 1 1-6m9-9 5 5',
    home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    heart:
      'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    message: 'M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z',
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    close: 'm6 6 12 12M6 18 18 6',
    logout: 'M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4m4-4H8',
    map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15M15 6v15',
    school: 'm2 9 10-6 10 6-10 6ZM5 11v7l7 4 7-4v-7M22 9v8',
    spark: 'm12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z',
    bed: 'M3 18v3M21 18v3M3 10v8h18v-8M3 14h18M5 10V5h14v5M7 10V8h3v2M14 10V8h3v2',
    bath: 'M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM6 12V5a3 3 0 0 1 6 0M6 20v2M18 20v2',
    size: 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6',
    plus: 'M12 5v14M5 12h14',
    check: 'm5 12 4 4L19 6',
    down: 'm6 9 6 6 6-6',
    key: 'M15 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-2 4 8 8m-3-3 3-3',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}

export function SegmentedControl({
  value,
  onChange,
  options,
  label,
  className = '',
}) {
  return (
    <div className={`bb-segment ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value === option.value}
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, children, action, onAction }) {
  return (
    <div className="bb-empty">
      <Icon name="search" />
      <h2>{title}</h2>
      <p>{children}</p>
      {action && (
        <button type="button" className="bb-button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function SectionHeading({ title, children, action, onAction }) {
  return (
    <div className="bb-section-heading">
      <div>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {action && (
        <button type="button" className="bb-text-button" onClick={onAction}>
          {action} <Icon name="arrow" />
        </button>
      )}
    </div>
  );
}
