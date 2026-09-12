import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useListings } from '../context/ListingsContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useSavedSearches } from '../context/SavedSearchesContext';
import { useSearch } from '../context/SearchContext';
import PropertyTile from '../components/ui/PropertyTile';
import { EmptyState, Icon } from '../components/ui/Controls';

export default function SavedPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = ['searches', 'recent'].includes(params.get('tab'))
    ? params.get('tab')
    : 'properties';
  const { favorites } = useFavorites();
  const { listings, loading, error, refreshListings } = useListings();
  const { recentIds } = useRecentlyViewed();
  const { savedSearches, getSearch, deleteSearch } = useSavedSearches();
  const { submitSearch } = useSearch();
  const ids = tab === 'recent' ? recentIds : favorites;
  const properties = ids
    .map((id) => listings.find((item) => String(item.id) === String(id)))
    .filter(Boolean);
  const resume = (id) => {
    const state = getSearch(id);
    if (!state) return;
    submitSearch({ ...state, view: state.searchQuery ? 'keyword' : 'city' });
    navigate(state.listingType === 'rent' ? '/rent' : '/sale');
  };
  return (
    <div className="saved-page minimal-page">
      <div className="bb-page-heading">
        <h1>Your shortlist.</h1>
        <p>Keep the places and possibilities you love.</p>
      </div>
      <div className="bb-methods" role="group" aria-label="Saved items">
        {[
          ['properties', 'Properties'],
          ['searches', 'Searches'],
          ['recent', 'Recently viewed'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setParams({ tab: value })}
          >
            {label}
            {value === 'properties' && ` (${favorites.length})`}
          </button>
        ))}
      </div>
      {tab === 'searches' ? (
        savedSearches.length ? (
          <div className="bb-saved-search-grid">
            {savedSearches.map((search) => (
              <article className="bb-saved-search" key={search.id}>
                <div className="bb-section-heading">
                  <span className="bb-badge">
                    {search.listingType === 'rent' ? 'Rent' : 'Buy'}
                  </span>
                  <button
                    className="bb-icon-button"
                    type="button"
                    aria-label={`Delete saved search ${search.name}`}
                    onClick={() => deleteSearch(search.id)}
                  >
                    <Icon name="close" />
                  </button>
                </div>
                <h2>{search.name}</h2>
                <p className="bb-muted">
                  {[
                    search.propertyType || 'All property types',
                    search.searchQuery,
                    search.minBeds > 0 && `${search.minBeds}+ bedrooms`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <button
                  type="button"
                  className="bb-button bb-secondary bb-full"
                  onClick={() => resume(search.id)}
                >
                  Resume search <Icon name="arrow" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="A good search is worth keeping."
            action="Start a search"
            onAction={() => navigate('/search')}
          >
            Save your location and filters from the results page.
          </EmptyState>
        )
      ) : loading ? (
        <p role="status">Loading your places…</p>
      ) : error ? (
        <EmptyState
          title="We couldn’t load your places."
          action="Try again"
          onAction={refreshListings}
        >
          {error}
        </EmptyState>
      ) : properties.length ? (
        <div className="saved-page-list">
          {properties.map((property) => (
            <PropertyTile
              key={property.id}
              property={property}
              onOpen={() =>
                navigate(`/property/${property.id}`, {
                  state: { from: `/saved?tab=${tab}` },
                })
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            tab === 'recent'
              ? 'A fresh start.'
              : 'Your next home could be here.'
          }
          action="Explore places"
          onAction={() => navigate('/search')}
        >
          {tab === 'recent'
            ? 'The places you open will appear here.'
            : 'Tap a heart to keep a place here.'}
        </EmptyState>
      )}
    </div>
  );
}
