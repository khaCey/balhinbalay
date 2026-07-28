import React from 'react';
import MinimalPropertyCard from './minimal/MinimalPropertyCard';

const PropertyListCard = ({ property, onViewDetails, index }) => {
  return <MinimalPropertyCard property={property} onOpen={() => onViewDetails(index)} showDivider />;
};

export default PropertyListCard;
