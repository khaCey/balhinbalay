import React from 'react';
import PropertyTile from './ui/PropertyTile';
export default function PropertyCard({ property, onViewDetails, index }) {
  return (
    <PropertyTile property={property} onOpen={() => onViewDetails(index)} />
  );
}
