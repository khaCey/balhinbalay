import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingTypeToggle from '../components/ListingTypeToggle';
import { useSearch } from '../context/SearchContext';

const CARDS = [
  { id: 'city', title: 'City', description: 'Choose a city or area', icon: 'fa-map-marker-alt', path: 'city' },
  { id: 'map', title: 'Map', description: 'Search visually on the map', icon: 'fa-map', path: 'map' },
  { id: 'keyword', title: 'Keyword', description: 'House, condo, furnished, pet-friendly', icon: 'fa-search', path: 'keyword' },
  { id: 'school', title: 'School', description: 'Search near a school or university', icon: 'fa-school', path: 'school' }
];

const defaultSearchState = {
  selectedRegion: 'all',
  selectedProvince: '',
  selectedCity: 'cebu-province',
  searchQuery: '',
  propertyType: '',
  priceRangeIndex: 0,
  minBeds: 0,
  minBaths: 0,
  sizeRange: { min: 0, max: Infinity },
  sortBy: 'newest',
  selectedSchoolId: ''
};

export default function SearchPage() {
  const navigate = useNavigate();
  const { submitSearch } = useSearch();
  const [listingType, setListingType] = useState('sale');

  const handleCardClick = (path) => {
    if (path === 'map') {
      submitSearch({
        listingType,
        view: 'map',
        ...defaultSearchState
      });
      navigate(`/${listingType}`);
      return;
    }
    navigate(`/search/${path}?listingType=${listingType}`);
  };

  return (
    <div className="home-page search-page">
      <div className="home-page-inner">
        <div className="home-page-toggle-wrap">
          <ListingTypeToggle value={listingType} onChange={setListingType} />
        </div>
        <div className="home-search-cards" role="list">
          {CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              className="home-search-card"
              onClick={() => handleCardClick(card.path)}
              role="listitem"
            >
              <span className="home-search-card-icon-wrap">
                <i className={`fas ${card.icon}`} aria-hidden />
              </span>
              <span className="home-search-card-text">
                <span className="home-search-card-title">{card.title}</span>
                <span className="home-search-card-desc">{card.description}</span>
              </span>
              <i className="fas fa-chevron-right home-search-card-chevron" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
