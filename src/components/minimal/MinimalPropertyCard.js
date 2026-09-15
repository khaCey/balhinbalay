import React from 'react';
import PropertyTile from '../ui/PropertyTile';
export default function MinimalPropertyCard({
  property,
  onOpen,
  className = '',
}) {
  return (
    <PropertyTile
      property={property}
      onOpen={onOpen}
      compact={!className.includes('--home')}
    />
  );
}
