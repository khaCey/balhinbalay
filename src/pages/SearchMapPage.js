import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

/**
 * Map search: no intermediate screen. Redirects straight to results in map view.
 * Kept so that /search/map?listingType=... still works (e.g. direct link).
 */
export default function SearchMapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || 'sale';
  const { submitSearch } = useSearch();

  useEffect(() => {
    submitSearch({
      listingType,
      view: 'map',
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
    });
    navigate(`/${listingType}`, { replace: true });
  }, [listingType, submitSearch, navigate]);

  return null;
}
