import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useListings } from '../context/ListingsContext';
import { getCityById } from '../data/cities';
import { getSchoolById } from '../data/schools';
import { haversineKm } from '../utils/distance';
import { searchRequest } from '../utils/searchRequest';
import MapView from '../components/MapView';
import MapPropertyPreview from '../components/map/MapPropertyPreview';
import Seo from '../components/Seo';
import { Icon } from '../components/ui/Controls';

export default function SearchMapPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const listingType = params.get('listingType') === 'rent' ? 'rent' : 'sale';
  const {
    submitSearch,
    lastSearchState,
    currentResultsState,
    defaultSearchState,
    mapStates,
    updateMapState,
  } = useSearch();
  const { searchResults, searchLoading, searchError, fetchSearchListings } =
    useListings();
  const source =
    currentResultsState[listingType] ||
    (lastSearchState?.listingType === listingType
      ? lastSearchState
      : defaultSearchState);
  const initialViewport = useRef(mapStates[listingType]?.viewport || null);
  const selectedId = mapStates[listingType]?.selectedId;
  useEffect(() => {
    if (!currentResultsState[listingType])
      submitSearch({ ...source, listingType, view: 'map' });
  }, [currentResultsState, listingType, source, submitSearch]);
  useEffect(() => {
    fetchSearchListings(searchRequest(source, listingType));
  }, [source, listingType, fetchSearchListings]);
  const properties = useMemo(() => {
    const school =
      source.view === 'school' && getSchoolById(source.selectedSchoolId);
    return searchResults.filter(
      (item) =>
        item.coordinates &&
        (!school ||
          haversineKm(
            school.coordinates.lat,
            school.coordinates.lng,
            item.coordinates.lat,
            item.coordinates.lng,
          ) <= 10),
    );
  }, [searchResults, source.view, source.selectedSchoolId]);
  const selected = properties.find((item) => item.id === selectedId);
  const city = getCityById(source.selectedCityIds?.[0] || source.selectedCity);
  const viewportChange = useCallback(
    (viewport) => updateMapState(listingType, { viewport }),
    [listingType, updateMapState],
  );
  return (
    <div className="bb-map-page">
      <Seo
        title="Explore the map"
        description="Explore matching listings on the map."
        canonicalPath="/search/map"
        noindex
      />
      <div className="bb-page-heading bb-results-heading">
        <div>
          <h1>
            {city && city.id !== 'cebu-province'
              ? city.displayName
              : 'Explore the map'}
          </h1>
          <p>Places to {listingType === 'rent' ? 'rent' : 'buy'}</p>
        </div>
        <button
          type="button"
          className="bb-button bb-secondary"
          onClick={() => navigate(`/${listingType}`)}
        >
          List
        </button>
      </div>
      <div className="bb-map-tools">
        <button
          type="button"
          className="bb-chip"
          onClick={() => navigate(`/${listingType}?filters=1`)}
        >
          Filters <Icon name="down" />
        </button>
        <button
          type="button"
          className="bb-chip"
          onClick={() => navigate(`/search?listingType=${listingType}&edit=1`)}
        >
          Edit search
        </button>
        <span className="bb-muted" role="status">
          {searchLoading
            ? 'Loading places…'
            : `${properties.length} mapped places`}
        </span>
      </div>
      <div className="bb-map-wrap">
        <MapView
          properties={properties}
          selectedCity={city}
          selectedPropertyId={selected?.id || ''}
          onSelectProperty={(property) =>
            updateMapState(listingType, { selectedId: property.id })
          }
          initialViewport={initialViewport.current}
          onViewportChange={viewportChange}
        />
        {selected && (
          <MapPropertyPreview
            property={selected}
            onClose={() => updateMapState(listingType, { selectedId: null })}
            onOpen={() =>
              navigate(`/property/${selected.id}`, {
                state: { from: `/search/map?listingType=${listingType}` },
              })
            }
          />
        )}
        {searchError ? (
          <div className="bb-map-error" role="alert">
            {searchError}
            <button
              type="button"
              className="bb-text-button"
              onClick={() =>
                fetchSearchListings(searchRequest(source, listingType))
              }
            >
              Try again
            </button>
          </div>
        ) : (
          !searchLoading &&
          !properties.length && (
            <div className="bb-map-error">
              No mapped listings match this search.
            </div>
          )
        )}
      </div>
    </div>
  );
}
