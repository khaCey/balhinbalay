import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useSearch } from '../context/SearchContext';
import {
  cebuCities,
  getCityById,
  getCitiesByRegionAndProvince,
  getProvincesByRegion,
  philippineRegions
} from '../data/cities';
import { schools, getSchoolById } from '../data/schools';
import { priceRanges } from '../data/listings';
import { trackEvent } from '../utils/analytics';
import './SearchModule.css';

const PROPERTY_TYPES = ['Condo', 'House', 'Apartment', 'Boarding House', 'Land'];
const KEYWORD_SUGGESTIONS = [
  'Studio',
  'Furnished',
  'Pet-friendly',
  'Near a mall',
  'With parking',
  'Boarding House'
];
const FALLBACK_POPULAR_CITY_IDS = [
  'cebu-city',
  'mandaue-city',
  'lapu-lapu-city',
  'iloilo-city',
  'davao-city',
  'manila'
];

const emptyFilters = {
  selectedRegion: 'all',
  selectedProvince: '',
  selectedCity: 'cebu-province',
  selectedCityIds: [],
  searchQuery: '',
  propertyType: '',
  priceRangeIndex: 0,
  priceMin: null,
  priceMax: null,
  furnishedFilter: '',
  minBeds: 0,
  minBaths: 0,
  sizeRange: { min: 0, max: Infinity },
  sortBy: 'newest',
  selectedSchoolId: ''
};

function selectedCityIdsFromState(state) {
  if (Array.isArray(state?.selectedCityIds)) {
    return Array.from(new Set(
      state.selectedCityIds.filter((cityId) => cityId && cityId !== 'cebu-province')
    ));
  }
  if (state?.selectedCity && state.selectedCity !== 'cebu-province') {
    return [state.selectedCity];
  }
  return [];
}

function initialSearchMode(state) {
  if (state?.view === 'keyword' || state?.view === 'school') return state.view;
  return 'city';
}

function sharedLocationFor(cityIds) {
  const cities = cityIds.map(getCityById).filter(Boolean);
  const regionIds = new Set(cities.map((city) => city.regionId).filter(Boolean));
  const provinces = new Set(cities.map((city) => city.province).filter(Boolean));
  return {
    regionId: regionIds.size === 1 ? [...regionIds][0] : 'all',
    province: provinces.size === 1 ? [...provinces][0] : ''
  };
}

/**
 * Shared city-first search experience for Home and /search.
 * Keyword, school, and map search remain available as deliberately secondary paths.
 */
export default function SearchModule({
  variant = 'compact',
  initialListingType = 'sale',
  initialState = null,
  autoFocus = false,
  defaultSuggestionsOpen = false,
  className = ''
}) {
  const navigate = useNavigate();
  const { listings } = useListings();
  const { submitSearch } = useSearch();
  const rootRef = useRef(null);
  const cityInputRef = useRef(null);
  const keywordInputRef = useRef(null);

  const initialCityIds = useMemo(() => selectedCityIdsFromState(initialState), [initialState]);
  const initialCity = getCityById(initialCityIds[0]);
  const [listingType, setListingType] = useState(
    initialState?.listingType === 'rent' || initialListingType === 'rent' ? 'rent' : 'sale'
  );
  const [searchMode, setSearchMode] = useState(() => initialSearchMode(initialState));
  const [selectedCityIds, setSelectedCityIds] = useState(initialCityIds);
  const [selectedRegion, setSelectedRegion] = useState(
    initialState?.selectedRegion && initialState.selectedRegion !== 'all'
      ? initialState.selectedRegion
      : (initialCity?.regionId || 'region-vii')
  );
  const [selectedProvince, setSelectedProvince] = useState(
    initialState?.selectedProvince || initialCity?.province || 'Cebu'
  );
  const [cityQuery, setCityQuery] = useState('');
  const [keywordQuery, setKeywordQuery] = useState(
    initialState?.view === 'keyword' ? initialState.searchQuery || '' : ''
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState(initialState?.selectedSchoolId || '');
  const [propertyType, setPropertyType] = useState(initialState?.propertyType || '');
  const [priceRangeIndex, setPriceRangeIndex] = useState(initialState?.priceRangeIndex ?? 0);
  const [minBeds, setMinBeds] = useState(initialState?.minBeds ?? 0);
  const [cityPickerOpen, setCityPickerOpen] = useState(Boolean(defaultSuggestionsOpen));
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (!initialState) return;
    const nextCityIds = selectedCityIdsFromState(initialState);
    const nextCity = getCityById(nextCityIds[0]);
    setListingType(initialState.listingType === 'rent' ? 'rent' : 'sale');
    setSearchMode(initialSearchMode(initialState));
    setSelectedCityIds(nextCityIds);
    setSelectedRegion(
      initialState.selectedRegion && initialState.selectedRegion !== 'all'
        ? initialState.selectedRegion
        : (nextCity?.regionId || 'region-vii')
    );
    setSelectedProvince(initialState.selectedProvince || nextCity?.province || 'Cebu');
    setKeywordQuery(initialState.view === 'keyword' ? initialState.searchQuery || '' : '');
    setSelectedSchoolId(initialState.selectedSchoolId || '');
    setPropertyType(initialState.propertyType || '');
    setPriceRangeIndex(initialState.priceRangeIndex ?? 0);
    setMinBeds(initialState.minBeds ?? 0);
  }, [initialState]);

  useEffect(() => {
    if (!autoFocus) return;
    const target = searchMode === 'keyword' ? keywordInputRef.current : cityInputRef.current;
    if (target) target.focus();
    if (searchMode === 'city') setCityPickerOpen(true);
  }, [autoFocus, searchMode]);

  useEffect(() => {
    const onDocumentPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setCityPickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDocumentPointerDown);
    return () => document.removeEventListener('pointerdown', onDocumentPointerDown);
  }, []);

  const cityCounts = useMemo(() => {
    const counts = new Map();
    (Array.isArray(listings) ? listings : []).forEach((listing) => {
      if (listing.listingType !== listingType || !listing.cityId) return;
      counts.set(listing.cityId, (counts.get(listing.cityId) || 0) + 1);
    });
    return counts;
  }, [listings, listingType]);

  const popularCities = useMemo(() => {
    const fromListings = [...cityCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cityId]) => getCityById(cityId))
      .filter(Boolean);
    const fallback = FALLBACK_POPULAR_CITY_IDS.map(getCityById).filter(Boolean);
    return [...new Map([...fromListings, ...fallback].map((city) => [city.id, city])).values()].slice(0, 6);
  }, [cityCounts]);

  const regionsWithCities = useMemo(() => {
    const regionIds = new Set(
      cebuCities
        .filter((city) => city.id !== 'cebu-province' && city.regionId)
        .map((city) => city.regionId)
    );
    return philippineRegions.filter((region) => region.id !== 'all' && regionIds.has(region.id));
  }, []);

  const provinces = useMemo(
    () => getProvincesByRegion(selectedRegion),
    [selectedRegion]
  );

  const visibleCities = useMemo(() => {
    const normalized = cityQuery.trim().toLowerCase();
    const allCities = cebuCities.filter((city) => city.id !== 'cebu-province');
    if (normalized) {
      return allCities
        .filter((city) => {
          const haystack = `${city.displayName || city.name} ${city.province || ''}`.toLowerCase();
          return haystack.includes(normalized);
        })
        .slice(0, 14);
    }
    const scoped = getCitiesByRegionAndProvince(selectedRegion, selectedProvince);
    return scoped.slice(0, 14);
  }, [cityQuery, selectedProvince, selectedRegion]);

  const priceOptions = priceRanges[listingType] || priceRanges.sale;
  const selectedCities = selectedCityIds.map(getCityById).filter(Boolean);
  const selectedLocationLabel = selectedCities.length === 0
    ? 'Search a city or municipality'
    : selectedCities.length === 1
      ? selectedCities[0].displayName
      : `${selectedCities[0].displayName} + ${selectedCities.length - 1} more`;

  const setMode = (nextMode) => {
    setSearchMode(nextMode);
    setLocationError('');
    if (nextMode === 'city') setCityPickerOpen(true);
  };

  const changeListingType = (nextListingType) => {
    setListingType(nextListingType);
    setPriceRangeIndex(0);
  };

  const selectRegion = (regionId) => {
    const nextProvinces = getProvincesByRegion(regionId);
    setSelectedRegion(regionId);
    setSelectedProvince(nextProvinces[0] || '');
    setCityQuery('');
  };

  const toggleCity = (cityId) => {
    setSelectedCityIds((current) => {
      if (current.includes(cityId)) return current.filter((id) => id !== cityId);
      return [...current, cityId];
    });
    setLocationError('');
  };

  const buildPayload = (view, overrides = {}) => {
    const location = sharedLocationFor(selectedCityIds);
    return {
      ...emptyFilters,
      listingType,
      view,
      selectedRegion: location.regionId,
      selectedProvince: location.province,
      selectedCity: selectedCityIds.length === 1 ? selectedCityIds[0] : 'cebu-province',
      selectedCityIds,
      propertyType,
      priceRangeIndex,
      minBeds,
      ...overrides
    };
  };

  const runSearch = (payload) => {
    trackEvent('search_submit', {
      listing_type: payload.listingType,
      search_mode: payload.view,
      selected_city_count: payload.selectedCityIds?.length || 0
    });
    submitSearch(payload);
    if (payload.view === 'map') {
      navigate(`/search/map?listingType=${payload.listingType}`);
      return;
    }
    navigate(`/${payload.listingType}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (searchMode === 'city') {
      if (selectedCityIds.length === 0) {
        setLocationError('Choose at least one city to continue.');
        setCityPickerOpen(true);
        cityInputRef.current?.focus();
        return;
      }
      runSearch(buildPayload('city', {
        searchQuery: '',
        selectedSchoolId: ''
      }));
      return;
    }

    if (searchMode === 'school') {
      if (!selectedSchoolId) {
        setLocationError('Choose a school or university to continue.');
        return;
      }
      runSearch(buildPayload('school', {
        selectedCity: 'cebu-province',
        selectedCityIds: [],
        selectedRegion: 'all',
        selectedProvince: '',
        searchQuery: '',
        selectedSchoolId
      }));
      return;
    }

    const trimmedKeyword = keywordQuery.trim();
    if (!trimmedKeyword) {
      setLocationError('Enter a keyword to continue.');
      keywordInputRef.current?.focus();
      return;
    }
    runSearch(buildPayload('keyword', {
      selectedCity: 'cebu-province',
      selectedCityIds: [],
      selectedRegion: 'all',
      selectedProvince: '',
      searchQuery: trimmedKeyword,
      selectedSchoolId: ''
    }));
  };

  const handleMap = () => {
    runSearch(buildPayload('map', {
      searchQuery: '',
      selectedSchoolId: ''
    }));
  };

  return (
    <section
      ref={rootRef}
      className={`bb-search-module bb-search-module--${variant} ${className}`.trim()}
      aria-label="Search homes"
      data-search-mode={searchMode}
    >
      <form className="bb-search-module-form" onSubmit={handleSubmit}>
        <div className="bb-search-module-command">
          <div className="bb-search-module-location">
            <div className="bb-search-module-step-heading">
              <span className="bb-search-module-step">1</span>
              <div>
                <p>Start with location</p>
                <h2>{searchMode === 'city' ? 'Choose where you want to live' : searchMode === 'school' ? 'Find homes near a school' : 'Search by keyword'}</h2>
              </div>
            </div>

            {searchMode === 'city' && (
              <>
                <label className="bb-search-module-city-field" htmlFor="bb-city-query">
                  <i className="fas fa-search" aria-hidden />
                  <input
                    id="bb-city-query"
                    ref={cityInputRef}
                    type="search"
                    value={cityQuery}
                    onChange={(event) => {
                      setCityQuery(event.target.value);
                      setCityPickerOpen(true);
                    }}
                    onFocus={() => setCityPickerOpen(true)}
                    placeholder={selectedLocationLabel}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={cityPickerOpen}
                    aria-controls="bb-city-picker"
                  />
                  <span className="bb-search-module-field-summary" aria-hidden>
                    {selectedCities.length > 0 ? `${selectedCities.length} selected` : 'City first'}
                  </span>
                </label>

                {cityPickerOpen && (
                  <div id="bb-city-picker" className="bb-search-module-picker" aria-label="Choose cities">
                    <div className="bb-search-module-picker-top">
                      <div>
                        <p className="bb-search-module-picker-eyebrow">
                          {cityQuery.trim() ? 'Matching places' : 'Browse Region → Province → City'}
                        </p>
                        <strong>{cityQuery.trim() ? 'Search results' : 'Choose one or more cities'}</strong>
                      </div>
                      <button
                        type="button"
                        className="bb-search-module-picker-close"
                        onClick={() => setCityPickerOpen(false)}
                        aria-label="Close city picker"
                      >
                        <i className="fas fa-times" aria-hidden />
                      </button>
                    </div>

                    {selectedCities.length > 0 && (
                      <div className="bb-search-module-selected" aria-label="Selected cities">
                        {selectedCities.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            className="bb-search-module-selected-chip"
                            onClick={() => toggleCity(city.id)}
                            aria-label={`Remove ${city.displayName}`}
                          >
                            <i className="fas fa-check" aria-hidden />
                            {city.displayName}
                            <i className="fas fa-times" aria-hidden />
                          </button>
                        ))}
                        <button
                          type="button"
                          className="bb-search-module-clear-cities"
                          onClick={() => setSelectedCityIds([])}
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {!cityQuery.trim() && (
                      <div className="bb-search-module-popular" aria-label="Popular cities">
                        <span>Popular</span>
                        {popularCities.slice(0, 4).map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            className={selectedCityIds.includes(city.id) ? 'is-selected' : ''}
                            onClick={() => toggleCity(city.id)}
                          >
                            {city.displayName}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="bb-search-module-picker-grid">
                      {!cityQuery.trim() && (
                        <nav className="bb-search-module-region-list" aria-label="Regions">
                          {regionsWithCities.map((region) => (
                            <button
                              key={region.id}
                              type="button"
                              className={selectedRegion === region.id ? 'is-active' : ''}
                              onClick={() => selectRegion(region.id)}
                            >
                              {region.displayName.replace(/^Region [IVX]+(?:-[A-Z])?\s*[–-]\s*/i, '')}
                            </button>
                          ))}
                        </nav>
                      )}

                      <div className="bb-search-module-city-list">
                        {!cityQuery.trim() && (
                          <div className="bb-search-module-browse-controls">
                            <label>
                              <span>Region</span>
                              <select value={selectedRegion} onChange={(event) => selectRegion(event.target.value)}>
                                {regionsWithCities.map((region) => (
                                  <option key={region.id} value={region.id}>{region.displayName}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>Province</span>
                              <select
                                value={selectedProvince}
                                onChange={(event) => setSelectedProvince(event.target.value)}
                              >
                                {provinces.map((province) => (
                                  <option key={province} value={province}>{province}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )}

                        <div className="bb-search-module-city-options" role="listbox" aria-multiselectable="true">
                          {visibleCities.map((city) => {
                            const selected = selectedCityIds.includes(city.id);
                            const count = cityCounts.get(city.id) || 0;
                            return (
                              <button
                                key={city.id}
                                type="button"
                                className={selected ? 'is-selected' : ''}
                                role="option"
                                aria-selected={selected}
                                onClick={() => toggleCity(city.id)}
                              >
                                <span className="bb-search-module-checkbox" aria-hidden>
                                  {selected && <i className="fas fa-check" />}
                                </span>
                                <span className="bb-search-module-city-name">
                                  <strong>{city.displayName}</strong>
                                  <small>{city.province}</small>
                                </span>
                                <span className="bb-search-module-city-count">
                                  {count > 0 ? `${count} listed` : 'Explore'}
                                </span>
                              </button>
                            );
                          })}
                          {visibleCities.length === 0 && (
                            <p className="bb-search-module-no-cities">No cities match that search yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {searchMode === 'keyword' && (
              <div className="bb-search-module-secondary-panel">
                <label htmlFor="bb-keyword-query">What kind of place are you looking for?</label>
                <div className="bb-search-module-secondary-input">
                  <i className="fas fa-tag" aria-hidden />
                  <input
                    id="bb-keyword-query"
                    ref={keywordInputRef}
                    type="search"
                    value={keywordQuery}
                    onChange={(event) => {
                      setKeywordQuery(event.target.value);
                      setLocationError('');
                    }}
                    placeholder="Studio, furnished, near a mall…"
                  />
                </div>
                <div className="bb-search-module-keywords">
                  {KEYWORD_SUGGESTIONS.map((keyword) => (
                    <button type="button" key={keyword} onClick={() => setKeywordQuery(keyword)}>
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchMode === 'school' && (
              <div className="bb-search-module-secondary-panel">
                <label htmlFor="bb-school-select">School or university</label>
                <div className="bb-search-module-secondary-input">
                  <i className="fas fa-school" aria-hidden />
                  <select
                    id="bb-school-select"
                    value={selectedSchoolId}
                    onChange={(event) => {
                      setSelectedSchoolId(event.target.value);
                      setLocationError('');
                    }}
                  >
                    <option value="">Choose a school…</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                {selectedSchoolId && (
                  <p className="bb-search-module-school-note">
                    Searching within the current 10 km school radius for {getSchoolById(selectedSchoolId)?.name}.
                  </p>
                )}
              </div>
            )}

            {locationError && (
              <p className="bb-search-module-error" role="alert">{locationError}</p>
            )}
          </div>

          <aside className="bb-search-module-essentials" aria-label="Essential filters">
            <div className="bb-search-module-step-heading">
              <span className="bb-search-module-step">2</span>
              <div>
                <p>Set the essentials</p>
                <h2>Build your search</h2>
              </div>
            </div>

            <div className="bb-search-module-modes" role="tablist" aria-label="Listing type">
              <button
                type="button"
                className={listingType === 'rent' ? 'active' : ''}
                role="tab"
                aria-selected={listingType === 'rent'}
                onClick={() => changeListingType('rent')}
              >
                Rent
              </button>
              <button
                type="button"
                className={listingType === 'sale' ? 'active' : ''}
                role="tab"
                aria-selected={listingType === 'sale'}
                onClick={() => changeListingType('sale')}
              >
                Buy
              </button>
            </div>

            <fieldset className="bb-search-module-filter-group">
              <legend>Property type</legend>
              <div className="bb-search-module-option-row">
                <button
                  type="button"
                  className={!propertyType ? 'is-selected' : ''}
                  onClick={() => setPropertyType('')}
                >
                  Any
                </button>
                {PROPERTY_TYPES.slice(0, 3).map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={propertyType === type ? 'is-selected' : ''}
                    onClick={() => setPropertyType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="bb-search-module-filter-group">
              <label htmlFor="bb-price-range">Price</label>
              <select
                id="bb-price-range"
                value={priceRangeIndex}
                onChange={(event) => setPriceRangeIndex(Number(event.target.value))}
              >
                {priceOptions.map((option, index) => (
                  <option key={option.label} value={index}>{option.label}</option>
                ))}
              </select>
            </div>

            <fieldset className="bb-search-module-filter-group">
              <legend>Bedrooms</legend>
              <div className="bb-search-module-option-row bb-search-module-option-row--beds">
                {[0, 1, 2, 3].map((beds) => (
                  <button
                    type="button"
                    key={beds}
                    className={minBeds === beds ? 'is-selected' : ''}
                    onClick={() => setMinBeds(beds)}
                  >
                    {beds === 0 ? 'Any' : `${beds}+`}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="bb-search-module-submit-wrap">
              <p>
                {searchMode === 'city' && selectedCities.length > 0
                  ? selectedLocationLabel
                  : searchMode === 'school' && selectedSchoolId
                    ? getSchoolById(selectedSchoolId)?.name
                    : searchMode === 'keyword' && keywordQuery.trim()
                      ? `“${keywordQuery.trim()}”`
                      : 'Choose your search criteria'}
              </p>
              <button type="submit" className="bb-search-module-submit">
                Search properties
                <i className="fas fa-arrow-right" aria-hidden />
              </button>
            </div>
          </aside>
        </div>

        <div className="bb-search-module-alternatives" aria-label="Other ways to search">
          <span>Other ways to search</span>
          <button
            type="button"
            className={searchMode === 'city' ? 'is-active' : ''}
            onClick={() => setMode('city')}
          >
            <i className="fas fa-map-marker-alt" aria-hidden /> City
          </button>
          <button
            type="button"
            className={searchMode === 'keyword' ? 'is-active' : ''}
            onClick={() => setMode('keyword')}
          >
            <i className="fas fa-tag" aria-hidden /> Keyword
          </button>
          <button
            type="button"
            className={searchMode === 'school' ? 'is-active' : ''}
            onClick={() => setMode('school')}
          >
            <i className="fas fa-school" aria-hidden /> School
          </button>
          <button type="button" onClick={handleMap}>
            <i className="fas fa-map" aria-hidden /> Map
          </button>
        </div>
      </form>
    </section>
  );
}
