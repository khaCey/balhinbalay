import React from 'react';

export default function MinimalPropertyFacts({
  beds = 0,
  baths = 0,
  size = '',
  type = '',
  className = ''
}) {
  const facts = [
    beds > 0
      ? {
          key: 'beds',
          icon: 'fas fa-bed',
          label: `${beds} bed${beds > 1 ? 's' : ''}`
        }
      : null,
    baths > 0
      ? {
          key: 'baths',
          icon: 'fas fa-bath',
          label: `${baths} bath${baths > 1 ? 's' : ''}`
        }
      : null,
    size
      ? {
          key: 'size',
          icon: 'fas fa-ruler-combined',
          label: String(size)
        }
      : null,
    type
      ? {
          key: 'furnished',
          icon: 'fas fa-couch',
          label: type
        }
      : null
  ].filter(Boolean);

  if (!facts.length) return null;

  return (
    <div className={`minimal-facts ${className}`.trim()} aria-label="Property facts">
      {facts.map((fact) => (
        <span key={fact.key} className="minimal-fact">
          <i className={`${fact.icon} minimal-fact-icon`} aria-hidden />
          {fact.label}
        </span>
      ))}
    </div>
  );
}
