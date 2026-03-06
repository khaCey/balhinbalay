import React, { useState } from 'react';
import { priceRanges } from '../data/listings';
import { cebuCities } from '../data/cities';
import SearchBar from './SearchBar';

const HeroSection = ({
  listingType,
  propertyType,
  priceRangeIndex,
  selectedCity,
  selectedCityData,
  searchQuery,
  minBeds,
  minBaths,
  sizeRange,
  isMobile,
  filtersOpen,
  onListingTypeChange,
  onPropertyTypeChange,
  onPriceRangeChange,
  onCityChange,
  onSearchChange,
  onSearchClear,
  onAdvancedFiltersChange,
  onToggleFilters,
  onCloseFilters
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const currentPriceRanges = priceRanges[listingType] || [];
  const showFiltersPanel = !isMobile || filtersOpen;
  const listingTypeLabel = listingType === 'sale' ? 'For Sale' : 'For Rent';
  const cityLabel = selectedCityData?.displayName || 'All Cities';

  return (
    <section className="hero-section">
      <div className="container-fluid px-2 px-md-4">
        <div className="row justify-content-center">
          <div className="col-md-10 text-center">
            <h1 className="hero-title mb-4">Find Your Dream Home in Cebu</h1>
            {isMobile && (
              <div className="mobile-filter-bar">
                <div className="mobile-filter-summary">
                  <div className="mobile-filter-chip">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {cityLabel}
                  </div>
                  <div className="mobile-filter-chip">
                    <i className="fas fa-tag me-2"></i>
                    {listingTypeLabel}
                  </div>
                </div>
                <button
                  className="btn btn-primary mobile-filter-toggle"
                  onClick={onToggleFilters}
                >
                  <i className={`fas fa-sliders-h me-2`}></i>
                  {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            )}
            {showFiltersPanel && (
              <div className={`search-box ${isMobile ? 'mobile-filters-panel' : ''}`}>
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  onClear={onSearchClear}
                />
                <form className="row g-3 mt-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="col-12 col-md-3">
                    <label className="form-label filter-label">City</label>
                    <select
                      className="form-select"
                      value={selectedCity}
                      onChange={(e) => onCityChange(e.target.value)}
                    >
                      {cebuCities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label filter-label">Listing Type</label>
                    <select
                      className="form-select"
                      value={listingType}
                      onChange={(e) => onListingTypeChange(e.target.value)}
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label filter-label">Property Type</label>
                    <select
                      className="form-select"
                      value={propertyType}
                      onChange={(e) => onPropertyTypeChange(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Condo">Condo</option>
                      <option value="Land">Land</option>
                      <option value="Boarding House">Boarding House</option>
                      <option value="Room">Room</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label filter-label">Price Range</label>
                    <select
                      className="form-select"
                      value={priceRangeIndex}
                      onChange={(e) => onPriceRangeChange(parseInt(e.target.value))}
                    >
                      {currentPriceRanges.map((range, idx) => (
                        <option key={idx} value={idx}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
                <div className="mt-3">
                  <button
                    className="btn btn-link text-decoration-none advanced-filters-toggle"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-2`}></i>
                    Advanced Filters
                  </button>
                  {showAdvancedFilters && (
                    <div className="advanced-filters-panel mt-3 p-3">
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <label className="form-label">Min Bedrooms</label>
                          <select
                            className="form-select"
                            value={minBeds}
                            onChange={(e) => onAdvancedFiltersChange('minBeds', parseInt(e.target.value))}
                          >
                            <option value={0}>Any</option>
                            <option value={1}>1+</option>
                            <option value={2}>2+</option>
                            <option value={3}>3+</option>
                            <option value={4}>4+</option>
                            <option value={5}>5+</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label">Min Bathrooms</label>
                          <select
                            className="form-select"
                            value={minBaths}
                            onChange={(e) => onAdvancedFiltersChange('minBaths', parseInt(e.target.value))}
                          >
                            <option value={0}>Any</option>
                            <option value={1}>1+</option>
                            <option value={2}>2+</option>
                            <option value={3}>3+</option>
                            <option value={4}>4+</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label">Size Range (sqm)</label>
                          <div className="d-flex gap-2">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Min"
                              value={sizeRange.min || ''}
                              onChange={(e) => onAdvancedFiltersChange('sizeRange', { ...sizeRange, min: e.target.value ? parseInt(e.target.value) : 0 })}
                            />
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Max"
                              value={sizeRange.max === Infinity ? '' : sizeRange.max || ''}
                              onChange={(e) => onAdvancedFiltersChange('sizeRange', { ...sizeRange, max: e.target.value ? parseInt(e.target.value) : Infinity })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {isMobile && (
                  <button className="btn btn-outline-primary w-100 mt-3" onClick={onCloseFilters}>
                    <i className="fas fa-check me-2"></i>
                    Apply Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
