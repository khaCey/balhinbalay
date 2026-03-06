import React from 'react';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import FavoritesButton from './FavoritesButton';

const PropertyCard = ({ property, onViewDetails, index }) => {
  const cityName = getCityById(property.cityId)?.displayName || property.city || property.cityId || '';
  const locationLine = [property.location, cityName].filter(Boolean).join(', ') || '—';

  const isNew = () => {
    if (!property.datePosted) return false;
    const postedDate = new Date(property.datePosted);
    const daysDiff = (new Date() - postedDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  return (
    <div className="card property-card h-100 position-relative">
        <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
          <FavoritesButton propertyId={property.id} />
        </div>
        <div className="position-relative">
          <img src={property.images[0]} className="card-img-top" alt={property.title} />
          {isNew() && <span className="badge bg-success position-absolute top-0 start-0 m-2">New</span>}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-1">
            <span className="badge bg-primary">{property.type}</span>
            <span className="badge bg-info">{cityName}</span>
            {property.status === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
            {property.status === 'rejected' && <span className="badge bg-danger">Rejected</span>}
          </div>
          <h5 className="card-title">{property.title}</h5>
          <p className="property-price mb-2">{formatPrice(property)}</p>
          <p className="card-text text-muted mb-3">
            <i className="fas fa-map-marker-alt me-2"></i>{locationLine}
          </p>
          <div className="property-features mb-3">
            {property.beds > 0 && <span><i className="fas fa-bed feature-icon me-1"></i>{property.beds} Beds</span>}
            {property.baths > 0 && <span><i className="fas fa-bath feature-icon me-1"></i>{property.baths} Baths</span>}
            <span><i className="fas fa-ruler-combined feature-icon me-1"></i>{property.size}</span>
          </div>
          <button 
            className="btn btn-outline-primary w-100 mb-2" 
            onClick={() => onViewDetails(index)}
          >
            <i className="fas fa-info-circle me-2"></i>View Details
          </button>
        </div>
      </div>
  );
};

export default PropertyCard;
