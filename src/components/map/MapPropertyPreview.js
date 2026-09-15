import React from 'react';
import { getCityById } from '../../data/cities';
import FavoritesButton from '../FavoritesButton';
import { Icon } from '../ui/Controls';

export default function MapPropertyPreview({ property, onOpen, onClose }) {
  if (!property) return null;
  const city =
    getCityById(property.cityId)?.displayName ||
    property.city ||
    property.cityId;
  const beds = property.bedrooms ?? property.beds;
  const area = property.floorArea
    ? `${property.floorArea} m²`
    : property.size || (property.sizeSqm ? `${property.sizeSqm} m²` : '');
  return (
    <section
      className="bb-map-preview"
      aria-label={`${property.title} property preview`}
    >
      <div className="bb-map-preview-actions">
        <FavoritesButton propertyId={property.id} className="bb-icon-button" />
        <button
          className="bb-icon-button"
          type="button"
          aria-label="Close property preview"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <button
        type="button"
        className="bb-map-preview-main"
        onClick={onOpen}
        aria-label={`View ${property.title}`}
      >
        {property.images?.[0] && <img src={property.images[0]} alt="" />}
        <span>
          <strong className="bb-price">
            ₱{Number(property.price).toLocaleString()}
            {property.listingType === 'rent' && <small> / month</small>}
          </strong>
          <strong className="bb-property-title">{property.title}</strong>
          <small>{[property.location, city].filter(Boolean).join(', ')}</small>
          <small>
            {[
              property.type,
              beds != null && (beds ? `${beds} beds` : 'Studio'),
              area,
              property.landmark,
            ]
              .filter(Boolean)
              .join(' · ')}
          </small>
          <span className="bb-text-button">
            View property <Icon name="arrow" />
          </span>
        </span>
      </button>
    </section>
  );
}
