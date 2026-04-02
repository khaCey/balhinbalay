import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useListings } from '../context/ListingsContext';
import { usePropertyModal } from '../context/PropertyModalContext';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import FavoritesButton from '../components/FavoritesButton';
import PageHeader from '../components/PageHeader';

export default function SavedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const { listings } = useListings();
  const { openProperty } = usePropertyModal();
  const allListings = useMemo(
    () => (Array.isArray(listings) ? listings : []),
    [listings]
  );
  const favoriteListings = useMemo(
    () => allListings.filter((l) => favorites.includes(l.id)),
    [allListings, favorites]
  );

  const handleBack = () => navigate(-1);
  const handleSelectProperty = (property) => {
    openProperty(property, { from: `${location.pathname}${location.search || ''}` });
  };

  return (
    <div className="saved-page page-with-header">
      <PageHeader title="Saved properties" onBack={handleBack} />
      <main className="page-content">
        {favoriteListings.length === 0 ? (
          <div className="saved-page-empty">
            <i className="fas fa-heart fa-3x text-muted mb-3" aria-hidden />
            <p className="mb-0">No saved properties yet.</p>
            <p className="text-muted small mb-0">Tap the heart on a listing to save it here.</p>
          </div>
        ) : (
          <ul className="saved-page-list">
            {favoriteListings.map((property, index) => (
              <li key={property.id || index} className="saved-page-item">
                <div
                  role="button"
                  tabIndex={0}
                  className="saved-page-card"
                  onClick={() => handleSelectProperty(property)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectProperty(property);
                    }
                  }}
                >
                  <div className="saved-page-card-img-wrap">
                    <img src={property.images?.[0]} alt={property.title} />
                  </div>
                  <div className="saved-page-card-fav" onClick={(e) => e.stopPropagation()}>
                    <FavoritesButton propertyId={property.id} />
                  </div>
                  <div className="saved-page-card-body">
                    <span className="badge bg-primary me-2">{property.type}</span>
                    <span className="badge bg-info me-2">{getCityById(property.cityId)?.displayName || property.city || property.cityId || '—'}</span>
                    <h5 className="saved-page-card-title">{property.title}</h5>
                    <p className="saved-page-card-price mb-0">{formatPrice(property)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
