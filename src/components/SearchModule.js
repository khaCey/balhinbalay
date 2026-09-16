import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useSearch } from '../context/SearchContext';
import { getCityById } from '../data/cities';
import { schools, getSchoolById } from '../data/schools';
import { priceRanges } from '../data/listings';
import { trackEvent } from '../utils/analytics';
import { Icon, SegmentedControl } from './ui/Controls';
import CitySelector from './ui/CitySelector';

export default function SearchModule({
  variant = 'compact',
  initialListingType = 'rent',
  initialState,
  onListingTypeChange,
}) {
  const navigate = useNavigate();
  const { listings } = useListings();
  const { submitSearch } = useSearch();
  const [listingType, setListingType] = useState(
    initialState?.listingType || initialListingType,
  );
  const [mode, setMode] = useState(
    ['keyword', 'school'].includes(initialState?.view)
      ? initialState.view
      : 'city',
  );
  const [cityIds, setCityIds] = useState(
    initialState?.selectedCityIds ||
      (initialState?.selectedCity &&
      initialState.selectedCity !== 'cebu-province'
        ? [initialState.selectedCity]
        : []),
  );
  const [picker, setPicker] = useState(false);
  const [keyword, setKeyword] = useState(initialState?.searchQuery || '');
  const [schoolId, setSchoolId] = useState(
    initialState?.selectedSchoolId || '',
  );
  const [error, setError] = useState('');
  const [type, setType] = useState(initialState?.propertyType || '');
  const [priceIndex, setPriceIndex] = useState(
    initialState?.priceRangeIndex || 0,
  );
  const [beds, setBeds] = useState(initialState?.minBeds || 0);
  const counts = useMemo(() => {
    const value = new Map();
    listings
      .filter((item) => item.listingType === listingType && item.cityId)
      .forEach((item) =>
        value.set(item.cityId, (value.get(item.cityId) || 0) + 1),
      );
    return value;
  }, [listings, listingType]);
  const quickCities = ['cebu-city', 'mandaue-city', 'danao-city']
    .map(getCityById)
    .filter(Boolean);
  const changeType = (value) => {
    setListingType(value);
    setPriceIndex(0);
    onListingTypeChange?.(value);
  };
  const runSearch = (searchMode) => {
    if (searchMode === 'city' && !cityIds.length) {
      setPicker(true);
      return;
    }
    if (searchMode === 'keyword' && !keyword.trim()) {
      setError('Enter a keyword to continue.');
      return;
    }
    if (searchMode === 'school' && !schoolId) {
      setError('Choose a school or university to continue.');
      return;
    }
    const cities = cityIds.map(getCityById).filter(Boolean);
    const sameRegion = new Set(cities.map((city) => city.regionId));
    const sameProvince = new Set(cities.map((city) => city.province));
    const payload = {
      minBaths: 0,
      sizeRange: { min: 0, max: Infinity },
      sortBy: 'newest',
      ...initialState,
      listingType,
      view: searchMode,
      propertyType: type,
      priceRangeIndex: priceIndex,
      minBeds: beds,
      ...(priceIndex !== initialState?.priceRangeIndex ||
      listingType !== initialState?.listingType
        ? { priceMin: null, priceMax: null }
        : {}),
      selectedCityIds:
        searchMode === 'city' || searchMode === 'map' ? cityIds : [],
      selectedCity:
        (searchMode === 'city' || searchMode === 'map') && cityIds.length === 1
          ? cityIds[0]
          : 'cebu-province',
      selectedRegion:
        searchMode === 'city' && sameRegion.size === 1
          ? cities[0].regionId
          : 'all',
      selectedProvince:
        searchMode === 'city' && sameProvince.size === 1
          ? cities[0].province
          : '',
      searchQuery: searchMode === 'keyword' ? keyword.trim() : '',
      selectedSchoolId: searchMode === 'school' ? schoolId : '',
    };
    trackEvent('search_submit', {
      listing_type: listingType,
      search_mode: searchMode,
      selected_city_count: payload.selectedCityIds.length,
    });
    submitSearch(payload);
    navigate(
      searchMode === 'map'
        ? `/search/map?listingType=${listingType}`
        : `/${listingType}`,
    );
  };
  const methods = [
    ['city', 'pin', 'City'],
    ['keyword', 'spark', 'Keyword'],
    ['school', 'school', 'School'],
    ['map', 'map', 'Map'],
  ];
  return (
    <section className="bb-search" aria-label="Search homes">
      {variant !== 'compact' && (
        <div className="bb-methods" role="group" aria-label="Search method">
          {methods.map(([value, icon, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => {
                setError('');
                if (value === 'map') runSearch('map');
                else setMode(value);
              }}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </div>
      )}
      <form
        className="bb-search-card"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(mode);
        }}
      >
        <div className="bb-search-top">
          <SegmentedControl
            label="Rent or buy"
            value={listingType}
            onChange={changeType}
            options={[
              { value: 'rent', label: 'Rent' },
              { value: 'sale', label: 'Buy' },
            ]}
          />
          <span>Your next chapter</span>
        </div>
        {mode === 'city' && (
          <>
            <button
              type="button"
              className="bb-city-field"
              onClick={() => setPicker(true)}
              aria-haspopup="dialog"
            >
              <Icon name="pin" />
              <span>
                {cityIds.length
                  ? cityIds
                      .map((id) => getCityById(id)?.displayName || id)
                      .join(' + ')
                  : 'Choose a city'}
                <small>
                  {cityIds.length
                    ? 'Add a city or change your location'
                    : 'Where would you like to live?'}
                </small>
              </span>
              <Icon name="down" />
            </button>
            <div className="bb-chips">
              {quickCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className={`bb-chip ${cityIds.includes(city.id) ? 'active' : ''}`}
                  aria-pressed={cityIds.includes(city.id)}
                  onClick={() =>
                    setCityIds((value) =>
                      value.includes(city.id)
                        ? value.filter((id) => id !== city.id)
                        : [...value, city.id],
                    )
                  }
                >
                  {city.displayName.replace(' City', '')}
                </button>
              ))}
            </div>
          </>
        )}
        {mode === 'keyword' && (
          <>
            <label className="bb-field">
              What matters to you?
              <input
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setError('');
                }}
                placeholder="Furnished, pet-friendly, near a mall…"
              />
            </label>
            <div className="bb-chips">
              {[
                'Studio',
                'Furnished',
                'Pet-friendly',
                'Near a mall',
                'With parking',
                'Boarding House',
              ].map((word) => (
                <button
                  type="button"
                  className="bb-chip"
                  key={word}
                  onClick={() => setKeyword(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        )}
        {mode === 'school' && (
          <label className="bb-field">
            School or university
            <select
              value={schoolId}
              onChange={(event) => {
                setSchoolId(event.target.value);
                setError('');
              }}
            >
              <option value="">Choose a school…</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <small>
              Within the existing 10 km radius
              {schoolId ? ` of ${getSchoolById(schoolId)?.name}` : ''}. Distance
              is measured in a straight line.
            </small>
          </label>
        )}
        {error && (
          <p role="alert" className="bb-error">
            {error}
          </p>
        )}
        <button className="bb-button bb-full bb-search-submit" type="submit">
          <Icon name="search" />
          Find a place
        </button>
        <div className="bb-alternatives">
          {(mode === 'city'
            ? [
                ['school', 'school', 'Near school'],
                ['map', 'map', 'Map'],
                ['keyword', 'spark', 'Keyword'],
              ]
            : methods.filter(([value]) => value !== mode)
          ).map(([value, icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setError('');
                if (value === 'map') runSearch('map');
                else setMode(value);
              }}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </div>
        {variant !== 'compact' && (
          <details className="bb-search-essentials">
            <summary>Essential filters</summary>
            <div className="bb-field-row">
              <label className="bb-field">
                Property type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="">Any</option>
                  {[
                    'Condo',
                    'House',
                    'Apartment',
                    'Boarding House',
                    'Land',
                    'Room',
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="bb-field">
                Price
                <select
                  value={priceIndex}
                  onChange={(event) =>
                    setPriceIndex(Number(event.target.value))
                  }
                >
                  {priceRanges[listingType].map((option, index) => (
                    <option key={option.label} value={index}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="bb-field">
                Bedrooms
                <select
                  value={beds}
                  onChange={(event) => setBeds(Number(event.target.value))}
                >
                  {[0, 1, 2, 3, 4].map((item) => (
                    <option key={item} value={item}>
                      {item ? `${item}+` : 'Any'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </details>
        )}
      </form>
      {picker && (
        <CitySelector
          selectedIds={cityIds}
          counts={counts}
          onClose={() => setPicker(false)}
          onApply={(value) => {
            setCityIds(value);
            setPicker(false);
          }}
        />
      )}
    </section>
  );
}
