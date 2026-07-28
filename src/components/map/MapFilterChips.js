import React from 'react';
import MinimalFilterChips from '../minimal/MinimalFilterChips';

export default function MapFilterChips({ chips, activeId, onSelect }) {
  return (
    <MinimalFilterChips
      chips={chips}
      activeId={activeId}
      onSelect={onSelect}
      className="map-filter-chips"
      ariaLabel="Active map filters"
    />
  );
}
