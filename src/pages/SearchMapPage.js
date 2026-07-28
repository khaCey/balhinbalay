import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useListings } from '../context/ListingsContext';
import { getCityById } from '../data/cities';
import MapView from '../components/MapView';
import MapSearchHeader from '../components/map/MapSearchHeader';
import MapFilterChips from '../components/map/MapFilterChips';
import MapPropertyPreview from '../components/map/MapPropertyPreview';
import Seo from '../components/Seo';

const defaultSearchState = {
  selectedRegion: 'all',
  selectedProvince: '',
  selectedCity: 'cebu-province',
  selectedCityIds: [],
  searchQuery: '',
  propertyType: '',
  priceRangeIndex: 0,
  minBeds: 0,
  minBaths: 0,
  sizeRange: { min: 0, max: Infinity },
  sortBy: 'newest',
  selectedSchoolId: ''
};

function toApiSort(sortByValue) {
  switch (sortByValue) {
    case 'price-low': return 'price-asc';
    case 'price-high': return 'price-desc';
    case 'size-large': return 'size-desc';
    case 'size-small': return 'size-asc';
    case 'newest':
    case 'recommended':
    default: return 'newest';
  }
}

export default function SearchMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || 'sale';
  const { submitSearch, hasSearched, lastSearchState, currentResultsState } = useSearch();
  const { listings, searchResults, fetchSearchListings } = useListings();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const lastViewportRef = useRef(null);

  const sourceState = useMemo(() => {
    const fromCurrent = currentResultsState?.[listingType];
    if (fromCurrent?.listingType === listingType) return fromCurrent;
    if (lastSearchState?.listingType === listingType) return lastSearchState;
    return null;
  }, [currentResultsState, lastSearchState, listingType]);

  useEffect(() => {
    if (sourceState?.listingType === listingType && sourceState?.view === 'map') return;
    const nextState = sourceState
      ? { ...sourceState, listingType, view: 'map' }
      : { listingType, view: 'map', ...defaultSearchState };
    submitSearch(nextState);
  }, [sourceState, submitSearch, listingType]);

  useEffect(() => {
    const state = sourceState || defaultSearchState;
    const selectedCityIds = Array.from(new Set(
      (Array.isArray(state.selectedCityIds) ? state.selectedCityIds : [])
        .filter((cityId) => cityId && cityId !== 'cebu-province')
    ));
    fetchSearchListings({
      listingType,
      cityId: selectedCityIds.length === 1
        ? selectedCityIds[0]
        : (selectedCityIds.length === 0 && state.selectedCity && state.selectedCity !== 'cebu-province'
          ? state.selectedCity
          : undefined),
      cityIds: selectedCityIds.length > 1 ? selectedCityIds : undefined,
      type: state.propertyType || undefined,
      minBeds: state.minBeds > 0 ? state.minBeds : undefined,
      minBaths: state.minBaths > 0 ? state.minBaths : undefined,
      q: state.searchQuery?.trim() || undefined,
      sort: toApiSort(state.sortBy)
    });
  }, [sourceState, listingType, fetchSearchListings]);

  const activeProperties = useMemo(() => {
    if (Array.isArray(searchResults) && searchResults.length > 0) return searchResults;
    return (Array.isArray(listings) ? listings : []).filter((item) => item.listingType === listingType);
  }, [searchResults, listings, listingType]);

  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return activeProperties.find((item) => item.id === selectedPropertyId) || null;
  }, [activeProperties, selectedPropertyId]);

  useEffect(() => {
    if (!selectedPropertyId) return;
    const stillExists = activeProperties.some((item) => item.id === selectedPropertyId);
    if (!stillExists) setSelectedPropertyId('');
  }, [activeProperties, selectedPropertyId]);

  const selectedCityData = useMemo(() => {
    const firstSelectedCityId = Array.isArray(sourceState?.selectedCityIds)
      ? sourceState.selectedCityIds[0]
      : '';
    return firstSelectedCityId
      ? getCityById(firstSelectedCityId)
      : (sourceState?.selectedCity ? getCityById(sourceState.selectedCity) : null);
  }, [sourceState?.selectedCityIds, sourceState?.selectedCity]);

  const chips = [
    { id: 'rent', label: 'Rent' },
    { id: 'sale', label: 'Buy' },
    { id: 'price', label: 'Price' },
    { id: 'beds', label: 'Beds' },
    { id: 'more', label: 'More' }
  ];

  const handleViewportChange = useCallback((viewport) => {
    if (!viewport?.center || !Number.isFinite(viewport?.zoom)) return;
    lastViewportRef.current = viewport;
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, []);

  return (
    <div className="map-search-page minimal-page" data-route={location.pathname}>
      <Seo
        title={`Map Search — ${listingType === 'rent' ? 'Rent' : 'Sale'} Listings`}
        description="Explore listings on the map and open details from a live preview card."
        canonicalPath="/search/map"
        noindex={!hasSearched}
      />
      <div className="map-search-floating">
        <MapSearchHeader
          title="Search this area"
          onFilter={() => navigate(`/${listingType}`)}
        />
        <MapFilterChips
          chips={chips}
          activeId={listingType}
          onSelect={(chip) => {
            if (chip.id === 'rent') navigate('/search/map?listingType=rent');
            if (chip.id === 'sale') navigate('/search/map?listingType=sale');
            if (chip.id === 'price' || chip.id === 'beds' || chip.id === 'more') navigate(`/${listingType}`);
          }}
        />
      </div>
      <MapView
        properties={activeProperties}
        selectedCity={selectedCityData}
        selectedPropertyId={selectedProperty?.id || ''}
        onSelectProperty={(property) => setSelectedPropertyId(property?.id || '')}
        initialViewport={lastViewportRef.current}
        onViewportChange={handleViewportChange}
      />
      {selectedProperty ? (
        <MapPropertyPreview
          property={selectedProperty}
          onOpen={() => navigate(`/property/${selectedProperty.id}`, { state: { from: `/search/map?listingType=${listingType}` } })}
          onClose={() => setSelectedPropertyId('')}
        />
      ) : (
        <div className="map-search-empty">No mapped listings found for this criteria.</div>
      )}
    </div>
  );
}
