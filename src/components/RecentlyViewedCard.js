import React from 'react';
import { formatPrice } from '../utils/helpers';

const RecentlyViewedCard = ({ property, onClick }) => {
  const img = property.images?.[0];

  return (
    <button
      type="button"
      className="recently-viewed-card"
      onClick={() => onClick(property)}
      aria-label={`View ${property.title}`}
    >
      {img && (
        <div className="recently-viewed-card-img">
          <img src={img} alt="" />
        </div>
      )}
      <div className="recently-viewed-card-body">
        <span className="recently-viewed-card-title">{property.title}</span>
        <span className="recently-viewed-card-price">{formatPrice(property)}</span>
      </div>
    </button>
  );
};

export default RecentlyViewedCard;
