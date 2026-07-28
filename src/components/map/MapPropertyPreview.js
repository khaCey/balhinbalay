import React from 'react';
import './MapPropertyPreview.css';
import { getCityById } from '../../data/cities';
import { useFavorites } from '../../context/FavoritesContext';

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ filled = false }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="23" height="23" fill={filled ? 'currentColor' : 'none'}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none">
      <path
        d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M8 7h2M8 11h2M8 15h2M13 7h1M13 11h1M13 15h1M3 21h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none">
      <path
        d="M3 18v-7M21 18v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5M3 15h18M7 11V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none">
      <path
        d="M7 3 3 7l14 14 4-4L7 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m8 8 2-2M11 11l2-2M14 14l2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price) {
  if (!Number.isFinite(Number(price))) return 'Price on request';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(Number(price));
}

export default function MapPropertyPreview({ property, onOpen, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  if (!property) return null;

  const isSaved = isFavorite(property.id);
  const isRental = property.listingType !== 'sale';
  const cityName = getCityById(property.cityId)?.displayName || property.city || property.cityId || '';
  const locationLabel = [property.location, cityName].filter(Boolean).join(', ') || 'Location not specified';
  const landmarkLabel = property.landmark || '';
  const bedroomCount = Number.isFinite(Number(property.bedrooms)) ? Number(property.bedrooms) : Number(property.beds || 0);
  const areaValue = Number.isFinite(Number(property.floorArea))
    ? Number(property.floorArea)
    : (property.size ? String(property.size).replace(/[^0-9.]/g, '') : '');

  return (
    <section
      className="map-property-preview"
      role="dialog"
      aria-modal="false"
      aria-label={`${property.title || 'Property'} property preview`}
    >
      <div className="map-property-preview__handle" />

      <div className="map-property-preview__top-actions">
        <button type="button" className="map-property-preview__icon-button" onClick={onClose} aria-label="Close property preview">
          <CloseIcon />
        </button>

        <button
          type="button"
          className={`map-property-preview__icon-button ${isSaved ? 'map-property-preview__icon-button--saved' : ''}`}
          onClick={() => toggleFavorite(property.id)}
          aria-label={isSaved ? 'Remove property from saved properties' : 'Save property'}
        >
          <HeartIcon filled={isSaved} />
        </button>
      </div>

      <div className="map-property-preview__content">
        <div className="map-property-preview__type">
          <BuildingIcon />
          <span>{property.type || 'Property'}</span>
        </div>

        <h2 className="map-property-preview__title">{property.title || 'Untitled property'}</h2>

        <div className="map-property-preview__location">
          <LocationIcon />
          <span>
            {locationLabel}
            {landmarkLabel ? (
              <>
                <span className="map-property-preview__separator">•</span>
                {landmarkLabel}
              </>
            ) : null}
          </span>
        </div>

        <div className="map-property-preview__price-row">
          <strong className={isRental ? 'map-property-preview__price map-property-preview__price--rent' : 'map-property-preview__price map-property-preview__price--sale'}>
            {formatPrice(property.price)}
          </strong>
          <span className="map-property-preview__price-period">{isRental ? '/month' : ''}</span>
        </div>

        <div className="map-property-preview__facts">
          <div className="map-property-preview__fact">
            <BedIcon />
            <span>{bedroomCount === 0 ? 'Studio' : `${bedroomCount} ${bedroomCount === 1 ? 'Bed' : 'Beds'}`}</span>
          </div>
          <div className="map-property-preview__fact">
            <AreaIcon />
            <span>{areaValue || 'N/A'} sqm</span>
          </div>
          {landmarkLabel ? (
            <div className="map-property-preview__fact">
              <LocationIcon />
              <span>{landmarkLabel}</span>
            </div>
          ) : null}
        </div>

        <button type="button" className="map-property-preview__details-button" onClick={onOpen}>
          <span>View details</span>
          <ArrowIcon />
        </button>
      </div>
    </section>
  );
}
