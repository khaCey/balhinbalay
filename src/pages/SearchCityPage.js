import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useSearch } from '../context/SearchContext';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';
import {
  philippineRegions,
  getCitiesByRegion,
  getCitiesByRegionAndProvince,
  getProvincesByRegion,
  getRegionIdsWithListings,
  getCityIdsWithListings
} from '../data/cities';

export default function SearchCityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || 'sale';
  const { submitSearch } = useSearch();
  const { listings } = useListings();

  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('cebu-province');

  const listingsByType = useMemo(
    () => (Array.isArray(listings) ? listings.filter((l) => l.listingType === listingType) : []),
    [listings, listingType]
  );
  const availableRegionIds = useMemo(() => getRegionIdsWithListings(listingsByType), [listingsByType]);
  const availableCityIds = useMemo(() => getCityIdsWithListings(listingsByType), [listingsByType]);
  const availableProvinces = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'all') return [];
    return getProvincesByRegion(selectedRegion).filter((prov) =>
      getCitiesByRegionAndProvince(selectedRegion, prov).some((c) => availableCityIds.includes(c.id))
    );
  }, [selectedRegion, availableCityIds]);

  const citiesFromRegionAndProvince = getCitiesByRegionAndProvince(selectedRegion || 'all', selectedProvince || null);
  const allCitiesEntry = getCitiesByRegion(selectedRegion || 'all').find((c) => c.id === 'cebu-province');
  const citiesWithAll = allCitiesEntry
    ? [allCitiesEntry, ...citiesFromRegionAndProvince.filter((c) => c.id !== 'cebu-province')]
    : citiesFromRegionAndProvince;
  const citiesForDropdown = citiesWithAll.filter(
    (c) => c.id === 'cebu-province' || availableCityIds.includes(c.id)
  );
  const selectedCityValid = citiesForDropdown.some((c) => c.id === selectedCity);
  const effectiveCity = selectedCityValid ? selectedCity : 'cebu-province';
  const visibleRegions = philippineRegions.filter((r) => r.id === 'all' || availableRegionIds.includes(r.id));

  const handleBack = () => navigate(-1);
  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch({
      listingType,
      view: 'city',
      selectedRegion,
      selectedProvince,
      selectedCity: effectiveCity,
      propertyType: '',
      priceRangeIndex: 0,
      searchQuery: '',
      minBeds: 0,
      minBaths: 0,
      sizeRange: { min: 0, max: Infinity },
      sortBy: 'newest',
      selectedSchoolId: ''
    });
    navigate(`/${listingType}`);
  };
  const seoTitle = `Search ${listingType === 'rent' ? 'Rent' : 'Sale'} Listings by City`;
  const seoDescription = `Choose a region, province, and city to find ${listingType === 'rent' ? 'rental' : 'for-sale'} properties in the Philippines.`;
  const searchCityJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoTitle,
      description: seoDescription,
      url: toAbsoluteUrl('/search/city')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: toAbsoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Search', item: toAbsoluteUrl('/search') },
        { '@type': 'ListItem', position: 3, name: 'Search by City', item: toAbsoluteUrl('/search/city') }
      ]
    }
  ];

  return (
    <div className="search-filter-page minimal-page">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/search/city"
        ogTitle={seoTitle}
        ogDescription={`Filter ${listingType === 'rent' ? 'rent' : 'sale'} listings by region and city.`}
        ogImage={DEFAULT_OG_IMAGE_PATH}
        jsonLd={searchCityJsonLd}
        jsonLdId="seo-search-city-json-ld"
      />
      <PageHeader title="Search by City" onBack={handleBack} />
      <main className="search-filter-page-main">
        <p className="search-filter-page-subtitle">Choose a city or area</p>
        <form onSubmit={handleSubmit} className="search-filter-page-form">
          <div className="search-filter-page-field">
            <label htmlFor="search-city-region" className="form-label filter-label">Region</label>
            <select
              id="search-city-region"
              className="form-select"
              value={selectedRegion || 'all'}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedProvince('');
                setSelectedCity('cebu-province');
              }}
            >
              {visibleRegions.map((r) => (
                <option key={r.id} value={r.id}>{r.displayName}</option>
              ))}
            </select>
          </div>
          <div className="search-filter-page-field">
            <label htmlFor="search-city-province" className="form-label filter-label">Province</label>
            <select
              id="search-city-province"
              className="form-select"
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity('cebu-province');
              }}
              disabled={!selectedRegion || selectedRegion === 'all'}
            >
              <option value="">All Provinces</option>
              {availableProvinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="search-filter-page-field">
            <label htmlFor="search-city-city" className="form-label filter-label">City</label>
            <select
              id="search-city-city"
              className="form-select"
              value={effectiveCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {citiesForDropdown.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
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
