import React from 'react';
import { useFavorites } from '../context/FavoritesContext';

const FavoritesButton = ({ propertyId, className = '' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(propertyId);

  return (
    <button
      className={`btn-favorite ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(propertyId);
      }}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <i className={`fas fa-heart ${favorite ? 'favorite-active' : ''}`}></i>
    </button>
  );
};

export default FavoritesButton;
