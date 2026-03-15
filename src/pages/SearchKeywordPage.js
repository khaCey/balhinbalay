import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import PageHeader from '../components/PageHeader';

export default function SearchKeywordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || 'sale';
  const { submitSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => navigate(-1);
  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch({
      listingType,
      view: 'keyword',
      searchQuery: searchQuery.trim(),
      selectedRegion: 'all',
      selectedProvince: '',
      selectedCity: 'cebu-province',
      propertyType: '',
      priceRangeIndex: 0,
      minBeds: 0,
      minBaths: 0,
      sizeRange: { min: 0, max: Infinity },
      sortBy: 'newest',
      selectedSchoolId: ''
    });
    navigate(`/${listingType}`);
  };

  return (
    <div className="search-filter-page">
      <PageHeader title="Search by Keyword" onBack={handleBack} />
      <main className="search-filter-page-main">
        <p className="search-filter-page-subtitle">House, condo, furnished, pet-friendly</p>
        <form onSubmit={handleSubmit} className="search-filter-page-form">
          <div className="search-filter-page-field">
            <label htmlFor="search-keyword-input" className="form-label filter-label">Keyword</label>
            <input
              id="search-keyword-input"
              type="text"
              className="form-control"
              placeholder="Search location, name, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="search-filter-page-submit btn btn-primary">
            <i className="fas fa-search me-2" aria-hidden />
            Search
          </button>
        </form>
      </main>
    </div>
  );
}
