import React, { useState } from 'react';
import { priceRanges } from '../data/listings';
import { philippineRegions, getCitiesByRegion, getCitiesByRegionAndProvince } from '../data/cities';
import SearchBar from './SearchBar';
import { useSavedSearches } from '../context/SavedSearchesContext';

const FilterSidebar = ({
  listingType,
  propertyType,
  priceRangeIndex,
  selectedRegion,
  selectedProvince = '',
  selectedCity,
  availableRegionIds = [],
  availableProvinces = [],
  availableCityIds = [],
  searchQuery,
  minBeds,
  minBaths,
  sizeRange,
  onListingTypeChange,
  onRegionChange,
  onProvinceChange,
  onPropertyTypeChange,
  onPriceRangeChange,
  onCityChange,
  onSearchChange,
  onSearchClear,
  onAdvancedFiltersChange,
  onApply,
  onApplySavedState,
  currentFilterState,
  isMobile,
  hideHeader = false
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const { savedSearches, saveSearch, getSearch, deleteSearch } = useSavedSearches();

  const handleSaveCurrent = () => {
    if (!currentFilterState) return;
    saveSearch(saveName.trim() || 'My filters', currentFilterState);
    setSaveName('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleApplySaved = (id) => {
    const state = getSearch(id);
    if (state) onApplySavedState?.(state);
  };
  const currentPriceRanges = priceRanges[listingType] || [];
  const citiesFromRegionAndProvince = getCitiesByRegionAndProvince(selectedRegion || 'all', selectedProvince || null);
  const allCitiesEntry = getCitiesByRegion(selectedRegion || 'all').find((c) => c.id === 'cebu-province');
  const citiesWithAll = allCitiesEntry
    ? [allCitiesEntry, ...citiesFromRegionAndProvince.filter((c) => c.id !== 'cebu-province')]
    : citiesFromRegionAndProvince;
  const citiesForDropdown = citiesWithAll.filter(
    (c) => c.id === 'cebu-province' || availableCityIds.includes(c.id)
  );
  const selectedCityValid = citiesForDropdown.some(c => c.id === selectedCity);
  const effectiveCity = selectedCityValid ? selectedCity : 'cebu-province';
  const visibleRegions = philippineRegions.filter(
    (r) => r.id === 'all' || availableRegionIds.includes(r.id)
  );
  const showProvince = selectedRegion && selectedRegion !== 'all' && availableProvinces.length > 0;

  return (
    <div className="filter-sidebar-content" onClick={(e) => e.stopPropagation()}>
      {!hideHeader && (
        <div className="filter-sidebar-header">
          <h2>Search Filters</h2>
          <button className="filter-close-btn" onClick={onApply} aria-label="Close filters">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onClear={onSearchClear}
      />

      <div className="filter-saved-presets">
        <div className="filter-saved-save-row">
          <label htmlFor="filter-saved-name" className="visually-hidden">Filter preset name</label>
          <input
            id="filter-saved-name"
            type="text"
            className="form-control filter-saved-name-input"
            placeholder="Save current as..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrent()}
          />
          <button
            type="button"
            className="btn btn-primary filter-saved-save-btn"
            onClick={(e) => { e.stopPropagation(); handleSaveCurrent(); }}
            disabled={!currentFilterState}
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <h3 className="filter-saved-list-title">Your saved filters</h3>
        {savedSearches.length === 0 ? (
          <div className="filter-saved-empty">
            <i className="fas fa-bookmark fa-2x text-muted mb-2" aria-hidden />
            <p className="mb-0 text-muted small">No saved filters yet. Save your current filters above.</p>
          </div>
        ) : (
          <ul className="filter-saved-list">
            {savedSearches.map((s) => (
              <li key={s.id} className="filter-saved-item">
                <span className="filter-saved-item-name">{s.name}</span>
                <div className="filter-saved-item-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => { e.stopPropagation(); handleApplySaved(s.id); }}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => { e.stopPropagation(); deleteSearch(s.id); }}
                    aria-label={`Delete ${s.name}`}
                  >
                    <i className="fas fa-trash" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="row g-3 mt-3" onSubmit={(e) => e.preventDefault()}>
        <div className="col-12">
          <label className="form-label filter-label">Region</label>
          <select
            className="form-select"
            value={selectedRegion || 'all'}
            onChange={(e) => onRegionChange(e.target.value)}
          >
            {visibleRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.displayName}
              </option>
            ))}
          </select>
        </div>
        {showProvince && (
          <div className="col-12">
            <label className="form-label filter-label">Province</label>
            <select
              className="form-select"
              value={selectedProvince}
              onChange={(e) => onProvinceChange(e.target.value)}
            >
              <option value="">All Provinces</option>
              {availableProvinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="col-12">
          <label className="form-label filter-label">City</label>
          <select
            className="form-select"
            value={effectiveCity}
            onChange={(e) => onCityChange(e.target.value)}
          >
            {citiesForDropdown.map((city) => (
              <option key={city.id} value={city.id}>
                {city.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
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
        <div className="col-12">
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
        <div className="col-12">
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
          onClick={(e) => { e.stopPropagation(); setShowAdvancedFilters(!showAdvancedFilters); }}
        >
          <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-2`}></i>
          Advanced Filters
        </button>
        {showAdvancedFilters && (
          <div className="advanced-filters-panel mt-3 p-3">
            <div className="row g-3">
              <div className="col-12">
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
              <div className="col-12">
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
              <div className="col-12">
                <label className="form-label">Size Range (sqm)</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min"
                    value={sizeRange.min || ''}
                    onChange={(e) =>
                      onAdvancedFiltersChange('sizeRange', {
                        ...sizeRange,
                        min: e.target.value ? parseInt(e.target.value) : 0
                      })
                    }
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max"
                    value={sizeRange.max === Infinity ? '' : sizeRange.max || ''}
                    onChange={(e) =>
                      onAdvancedFiltersChange('sizeRange', {
                        ...sizeRange,
                        max: e.target.value ? parseInt(e.target.value) : Infinity
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="button" className="btn-apply-filters" onClick={(e) => { e.stopPropagation(); onApply?.(); }}>
        <i className="fas fa-search me-2"></i>
        Search Properties
      </button>
    </div>
  );
};

export default FilterSidebar;
