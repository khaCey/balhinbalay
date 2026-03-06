import React from 'react';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import FavoritesButton from './FavoritesButton';

const PropertyListCard = ({ property, onViewDetails, index }) => {
  const cityName = getCityById(property.cityId)?.displayName || property.city || property.cityId || '';
  const locationLine = [property.location, cityName].filter(Boolean).join(', ') || '—';

  const isNew = () => {
    const postedDate = new Date(property.datePosted);
    const daysDiff = (new Date() - postedDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  return (
    <div className="card property-list-card h-100 position-relative" onClick={() => onViewDetails(index)}>
      <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
        <FavoritesButton propertyId={property.id} />
      </div>
      <div className="row g-0">
        <div className="col-12 col-md-4">
            <div className="position-relative">
              <img src={property.images[0]} className="card-img list-card-img" alt={property.title} />
              {isNew() && <span className="badge bg-success position-absolute top-0 start-0 m-2">New</span>}
            </div>
        </div>
        <div className="col-12 col-md-8">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="badge bg-primary me-2">{property.type}</span>
                  <span className="badge bg-info me-2">{cityName}</span>
                  {property.status === 'pending' && <span className="badge bg-warning text-dark me-2">Pending</span>}
                  {property.status === 'rejected' && <span className="badge bg-danger">Rejected</span>}
                </div>
                <p className="property-price mb-0">{formatPrice(property)}</p>
              </div>
              <h5 className="card-title">{property.title}</h5>
              <p className="card-text text-muted mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>{locationLine}
              </p>
              <div className="property-features mb-3">
                {property.beds > 0 && <span><i className="fas fa-bed feature-icon me-1"></i>{property.beds} Beds</span>}
                {property.baths > 0 && <span><i className="fas fa-bath feature-icon me-1"></i>{property.baths} Baths</span>}
                <span><i className="fas fa-ruler-combined feature-icon me-1"></i>{property.size}</span>
              </div>
              <button 
                className="btn btn-outline-primary" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(index);
                }}
              >
                <i className="fas fa-info-circle me-2"></i>View Details
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListCard;
