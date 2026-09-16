import React from 'react';
import { Icon } from './ui/Controls';
import { useFavorites } from '../context/FavoritesContext';

const FavoritesButton = ({ propertyId, className = '' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(propertyId);

  return (
    <button
      type="button"
      aria-pressed={favorite}
      className={`btn-favorite ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(propertyId);
      }}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Icon name="heart" className={favorite ? 'favorite-active' : ''} fill={favorite ? 'currentColor' : 'none'} />
    </button>
  );
};

export default FavoritesButton;
