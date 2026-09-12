import React from 'react';
import { CompareButton } from './Comparison';
import { getCityById } from '../../data/cities';
import FavoritesButton from '../FavoritesButton';
import { Icon } from './Controls';

export default function PropertyTile({ property, onOpen, compact = false }) {
  if (!property) return null;
  const city =
    getCityById(property.cityId)?.displayName ||
    property.city ||
    property.cityId;
  const rent = property.listingType === 'rent';
  return (
    <article className={`bb-property ${compact ? 'bb-property--compact' : ''}`}>
      <div className="bb-property-media">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${property.title}`}
        >
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title || 'Property'}
              loading="lazy"
            />
          ) : (
            <span className="bb-photo-empty">
              <Icon name="home" />
              Photo not provided
            </span>
          )}
        </button>
        <span className="bb-badge">For {rent ? 'rent' : 'sale'}</span>
        <FavoritesButton
          propertyId={property.id}
          className="bb-property-heart"
        />
      </div>
      <div className="bb-property-body">
        <p className="bb-price">
          {property.price != null
            ? `₱${Number(property.price).toLocaleString()}`
            : 'Price on request'}
          {rent && <small> / month</small>}
        </p>
        <button type="button" className="bb-property-title" onClick={onOpen}>
          {property.title || 'Property details'}
        </button>
        <p className="bb-property-location">
          {[property.location, city].filter(Boolean).join(', ') ||
            'Location not specified'}
        </p>
        <div className="bb-property-facts">
          {property.beds != null && (
            <span>
              <Icon name="bed" />
              {property.beds > 0
                ? `${property.beds} bed${property.beds > 1 ? 's' : ''}`
                : 'Studio'}
            </span>
          )}
          {property.baths != null && (
            <span>
              <Icon name="bath" />
              {property.baths} bath{property.baths > 1 ? 's' : ''}
            </span>
          )}
          {(property.size || property.sizeSqm) && (
            <span>
              <Icon name="size" />
              {property.size || `${property.sizeSqm} m²`}
            </span>
          )}
        </div>
        <div className="bb-property-footer">
          <span>{property.type}</span>
          <CompareButton property={property} />
        </div>
        {property.furnished && (
          <p className="bb-property-location">{property.furnished}</p>
        )}
        {(property.floorLevel || property.buildingAge) && (
          <p className="bb-property-location">
            {[
              property.floorLevel && `Floor ${property.floorLevel}`,
              property.buildingAge && `${property.buildingAge} years old`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {(property.status === 'pending' ||
          property.status === 'rejected' ||
          property.sold ||
          property.currentlyRented) && (
          <span className="bb-badge">
            {property.sold
              ? 'Sold'
              : property.currentlyRented
                ? 'Rented'
                : property.status === 'pending'
                  ? 'Pending approval'
                  : 'Rejected'}
          </span>
        )}
      </div>
    </article>
  );
}
