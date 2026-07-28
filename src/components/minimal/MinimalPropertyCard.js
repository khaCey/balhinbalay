import React from 'react';
import { formatPrice } from '../../utils/helpers';
import FavoritesButton from '../FavoritesButton';
import MinimalPropertyFacts from './MinimalPropertyFacts';
import { getCityById } from '../../data/cities';
import { DEFAULT_OG_IMAGE_PATH } from '../../seo/siteSeo';

export default function MinimalPropertyCard({
  property,
  onOpen,
  className = '',
  showDivider = false
}) {
  if (!property) return null;
  const isHomeVariant = className.includes('minimal-property-card--home');

  const cityName = getCityById(property.cityId)?.displayName || property.city || property.cityId || '';
  const locationLine = [property.location, cityName].filter(Boolean).join(', ') || 'Location not specified';
  const typeLabel = property.type || 'Property';
  const titleLabel = property.title || 'Untitled property';
  const isRent = property.listingType === 'rent';
  const listingModeLabel = isRent ? 'Rent' : 'Buy';
  const imageSrc = Array.isArray(property.images) && property.images[0] ? property.images[0] : DEFAULT_OG_IMAGE_PATH;

  return (
    <article className={`minimal-property-card ${showDivider ? 'with-divider' : ''} ${className}`.trim()}>
      <button type="button" className="minimal-property-hit" onClick={onOpen} aria-label={`View ${property.title}`}>
        <div className="property-card-top">
          {!isHomeVariant && (
            <div className="property-type-row">
              <span className="property-type">{typeLabel}</span>
              <span className={`property-type property-type--mode ${isRent ? 'is-rent' : 'is-buy'}`}>{listingModeLabel}</span>
            </div>
          )}
        </div>
        <div className="minimal-property-main">
          {isHomeVariant ? (
            <div className="minimal-property-media">
              <img className="minimal-property-image" src={imageSrc} alt={titleLabel} loading="lazy" />
              <p className={`minimal-property-price ${isRent ? 'is-rent' : ''}`}>
                {formatPrice(property)}
              </p>
            </div>
          ) : (
            <img className="minimal-property-image" src={imageSrc} alt={titleLabel} loading="lazy" />
          )}
          <div className="minimal-property-body">
            <h3 className="minimal-property-title">{titleLabel}</h3>
            <p className="minimal-property-location">{locationLine}</p>
            {isHomeVariant && (
              <div className="property-type-row property-type-row--home-inline">
                <span className="property-type">{typeLabel}</span>
                <span className={`property-type property-type--mode ${isRent ? 'is-rent' : 'is-buy'}`}>{listingModeLabel}</span>
              </div>
            )}
            <MinimalPropertyFacts
              beds={property.beds}
              baths={property.baths}
              size={property.size}
              type={property.furnished}
            />
            {!isHomeVariant && (
              <div className="property-bottom">
                <div>
                  <p className={`minimal-property-price ${isRent ? 'is-rent' : ''}`}>
                    {formatPrice(property)}
                  </p>
                </div>
                <i className="fas fa-chevron-right home-search-card-chevron" aria-hidden />
              </div>
            )}
          </div>
        </div>
        {isHomeVariant && (
          <i className="fas fa-chevron-right home-search-card-chevron arrow--home-floating" aria-hidden />
        )}
      </button>
      <div className="minimal-property-fav">
        <FavoritesButton propertyId={property.id} />
      </div>
    </article>
  );
}
