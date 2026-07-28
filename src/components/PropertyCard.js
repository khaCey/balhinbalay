import React from 'react';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import FavoritesButton from './FavoritesButton';

const PropertyCard = ({ property, onViewDetails, index }) => {
  const cityName = getCityById(property.cityId)?.displayName || property.city || property.cityId || '';
  const locationLine = [property.location, cityName].filter(Boolean).join(', ') || '—';
  const listingLabel = property.listingType === 'rent' ? 'For rent' : 'For sale';
  const furnishingLabel = property.furnished
    ? property.furnished.charAt(0).toUpperCase() + property.furnished.slice(1)
    : null;
  const moveInFees = [
    property.keyMoney,
    property.securityDeposit,
    property.advancePay,
    property.brokerFee,
    property.associationFee,
    property.reservationFee
  ].reduce((total, value) => total + (Number(value) || 0), 0);
  const tags = [
    property.type,
    cityName,
    listingLabel,
    furnishingLabel
  ].filter(Boolean);
  const optionalSpecs = [
    property.floorLevel ? `Floor ${property.floorLevel}` : null,
    property.buildingAge ? `${property.buildingAge} yrs old` : null
  ].filter(Boolean);

  const isNew = () => {
    if (!property.datePosted) return false;
    const postedDate = new Date(property.datePosted);
    const daysDiff = (new Date() - postedDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  return (
    <article className="card property-card h-100 position-relative">
      <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
        <FavoritesButton propertyId={property.id} />
      </div>
      <div className="position-relative">
        <img src={property.images?.[0]} className="card-img-top" alt={property.title} />
        {isNew() && <span className="badge bg-success position-absolute top-0 start-0 m-2">New</span>}
      </div>
      <div className="card-body">
        <div className="property-card-tag-row">
          {tags.map((tag) => (
            <span key={tag} className="badge property-card-tag">{tag}</span>
          ))}
        </div>
        <h5 className="card-title">{property.title}</h5>
        <p className={`property-price mb-1${property.listingType === 'rent' ? ' price-rent' : ''}`}>{formatPrice(property)}</p>
        {property.listingType === 'rent' && moveInFees > 0 && (
          <p className="property-card-fees">Move-in from ₱{moveInFees.toLocaleString()}</p>
        )}
        <p className="card-text text-muted mb-3 property-card-location">
          <i className="fas fa-map-marker-alt me-2" aria-hidden />
          {locationLine}
        </p>
        <div className="property-features mb-3">
          {property.beds > 0 && <span><i className="fas fa-bed feature-icon me-1" aria-hidden />{property.beds} Beds</span>}
          {property.baths > 0 && <span><i className="fas fa-bath feature-icon me-1" aria-hidden />{property.baths} Baths</span>}
          <span><i className="fas fa-ruler-combined feature-icon me-1" aria-hidden />{property.size}</span>
          {optionalSpecs.map((spec) => <span key={spec}>{spec}</span>)}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary w-100 mb-2 property-card-cta"
          onClick={() => onViewDetails(index)}
        >
          <span>View details</span>
          <i className="fas fa-chevron-right" aria-hidden />
        </button>
      </div>
    </article>
  );
};

export default PropertyCard;
