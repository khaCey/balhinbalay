import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useListings } from '../context/ListingsContext';
import MinimalPropertyCard from '../components/minimal/MinimalPropertyCard';

export default function SavedPage() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { listings } = useListings();
  const allListings = useMemo(
    () => (Array.isArray(listings) ? listings : []),
    [listings]
  );
  const favoriteListings = useMemo(
    () => allListings.filter((l) => favorites.includes(l.id)),
    [allListings, favorites]
  );

  const handleSelectProperty = (property) => {
    navigate(`/property/${property.id}`, { state: { from: '/saved' } });
  };

  return (
    <div className="saved-page minimal-page">
      <main className="page-content">
        <div className="prototype-home-topbar">
          <div className="minimal-wordmark">BalhinBalay</div>
          <button type="button" className="link-button">Edit</button>
        </div>
        <div className="saved-header">
          <h2>Saved properties</h2>
          <p>{favoriteListings.length > 0 ? `${favoriteListings.length} home${favoriteListings.length > 1 ? 's' : ''} saved for later.` : 'No saved properties yet.'}</p>
        </div>
        {favoriteListings.length === 0 ? (
          <div className="saved-page-empty">
            <i className="fas fa-heart fa-3x text-muted mb-3" aria-hidden />
            <p className="mb-0">No saved properties yet.</p>
            <p className="text-muted small mb-0">Tap the heart on a listing to save it here.</p>
          </div>
        ) : (
          <div className="saved-page-list">
            {favoriteListings.map((property, index) => (
              <MinimalPropertyCard
                key={property.id || index}
                property={property}
                onOpen={() => handleSelectProperty(property)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
