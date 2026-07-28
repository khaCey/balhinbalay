import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import SearchModule from '../components/SearchModule';
import MinimalPropertyCard from '../components/minimal/MinimalPropertyCard';
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, SITE_DESCRIPTION, toAbsoluteUrl } from '../seo/siteSeo';
import { useListings } from '../context/ListingsContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { cebuCities, getCityById } from '../data/cities';
import { getSchoolById } from '../data/schools';

function continueLabel(state) {
  if (!state) return '';
  const type = state.listingType === 'rent' ? 'Rent' : 'Buy';
  if (state.view === 'school' && state.selectedSchoolId) {
    return `${type} near ${getSchoolById(state.selectedSchoolId)?.name || 'school'}`;
  }
  const selectedCityIds = Array.isArray(state.selectedCityIds)
    ? state.selectedCityIds
    : (state.selectedCity && state.selectedCity !== 'cebu-province' ? [state.selectedCity] : []);
  if (state.view === 'city' && selectedCityIds.length > 0) {
    const firstCity = getCityById(selectedCityIds[0])?.displayName || 'city';
    return selectedCityIds.length === 1
      ? `${type} in ${firstCity}`
      : `${type} in ${firstCity} + ${selectedCityIds.length - 1} more`;
  }
  if (state.searchQuery?.trim()) {
    return `${type} · “${state.searchQuery.trim()}”`;
  }
  if (state.view === 'map') return `${type} on map`;
  return `${type} search`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { listings } = useListings();
  const { lastSearchState, hasSearched, submitSearch } = useSearch();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();
  const { recentIds } = useRecentlyViewed();

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: toAbsoluteUrl('/'),
      logo: toAbsoluteUrl('/logo.png')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: toAbsoluteUrl('/'),
      description: SITE_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${toAbsoluteUrl('/search')}?listingType={listingType}`,
        'query-input': 'required name=listingType'
      }
    }
  ];

  const popularAreas = useMemo(() => {
    const cityCounts = new Map();
    (Array.isArray(listings) ? listings : []).forEach((item) => {
      if (!item.cityId || item.cityId === 'cebu-province') return;
      const city = getCityById(item.cityId);
      if (!city) return;
      const prev = cityCounts.get(item.cityId) || { city, count: 0 };
      prev.count += 1;
      cityCounts.set(item.cityId, prev);
    });
    return Array.from(cityCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [listings]);

  const recentListings = useMemo(() => {
    const byId = new Map((Array.isArray(listings) ? listings : []).map((item) => [String(item.id), item]));
    return recentIds.map((id) => byId.get(String(id))).filter(Boolean).slice(0, 6);
  }, [listings, recentIds]);

  const continueSearch = () => {
    if (!lastSearchState) {
      navigate('/search');
      return;
    }
    if (lastSearchState.view === 'map') {
      navigate(`/search/map?listingType=${lastSearchState.listingType || 'sale'}`);
      return;
    }
    navigate(`/${lastSearchState.listingType === 'rent' ? 'rent' : 'sale'}`);
  };

  const searchPopularCity = (city) => {
    const listingType = lastSearchState?.listingType === 'rent' ? 'rent' : 'sale';
    submitSearch({
      listingType,
      view: 'city',
      selectedRegion: city.regionId || 'all',
      selectedProvince: city.province || '',
      selectedCity: city.id,
      selectedCityIds: [city.id],
      searchQuery: '',
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
    <div className="home-page home-page-landing home-page-scrollable minimal-page">
      <Seo
        title="Find Homes for Sale and Rent in the Philippines"
        description="Discover homes, condos, apartments, and land listings for sale and rent across the Philippines. Browse by city, keyword, map, or school on BalhinBalay."
        canonicalPath="/"
        ogTitle="Find Homes for Sale and Rent in the Philippines"
        ogDescription="Browse properties across the Philippines and search by city, keyword, map, or school."
        ogImage={DEFAULT_OG_IMAGE_PATH}
        jsonLd={homeJsonLd}
        jsonLdId="seo-home-json-ld"
      />
      <div className="minimal-home-wrap minimal-home-wrap--city-first">
        <div className="prototype-home-topbar">
          <button
            type="button"
            className="prototype-home-brand"
            onClick={() => navigate('/')}
            aria-label="BalhinBalay home"
          >
            <img src="/logo.png" alt="" aria-hidden />
            <span className="minimal-wordmark">BalhinBalay</span>
          </button>
          <nav className="prototype-home-nav" aria-label="Primary">
            <button type="button" onClick={() => navigate('/saved')}>Saved</button>
            <button type="button" onClick={() => (user ? navigate('/messages') : openLogin())}>Messages</button>
            <button type="button" onClick={() => (user ? navigate('/add-property') : openLogin())}>List a property</button>
          </nav>
          <button
            type="button"
            className="prototype-home-account-btn"
            onClick={() => (user ? navigate('/menu') : openLogin())}
            aria-label={user ? 'Account' : 'Log in'}
          >
            <i className="fas fa-user-circle" aria-hidden />
          </button>
        </div>
        <div className="prototype-home-intro">
          <p className="prototype-home-small">City-first property search</p>
          <h1 className="minimal-hero-title">Where do you want to live?</h1>
          <p className="prototype-home-lede">
            Choose the places that matter first. Then decide whether to rent or buy and set the essentials.
          </p>
        </div>

        <SearchModule
          variant="compact"
          initialListingType={lastSearchState?.listingType === 'rent' ? 'rent' : 'sale'}
          defaultSuggestionsOpen
        />

        {hasSearched && lastSearchState && (
          <section className="bb-home-section" aria-label="Continue your search">
            <div className="section-heading">
              <h3>Continue your search</h3>
            </div>
            <button type="button" className="bb-home-continue" onClick={continueSearch}>
              <span className="bb-home-continue-label">{continueLabel(lastSearchState)}</span>
              <i className="fas fa-chevron-right" aria-hidden />
            </button>
          </section>
        )}

        {popularAreas.length > 0 && (
          <section className="bb-home-section" aria-label="Popular places">
            <div className="section-heading">
              <h3>Popular places</h3>
            </div>
            <div className="area-grid">
              {popularAreas.map(({ city, count }) => (
                <button
                  key={city.id}
                  type="button"
                  className="area-card"
                  onClick={() => searchPopularCity(city)}
                >
                  <span className="count">{count} listing{count === 1 ? '' : 's'}</span>
                  <h4>{(city.displayName || city.name || '').replace(/\s+City$/i, '')}</h4>
                </button>
              ))}
            </div>
          </section>
        )}

        {popularAreas.length === 0 && cebuCities.some((c) => c.id === 'cebu-city') && (
          <section className="bb-home-section" aria-label="Popular places">
            <div className="section-heading">
              <h3>Popular places</h3>
            </div>
            <div className="area-grid">
              {cebuCities
                .filter((c) => ['cebu-city', 'mandaue-city', 'lapu-lapu-city', 'talisay-city'].includes(c.id))
                .map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    className="area-card"
                    onClick={() => searchPopularCity(city)}
                  >
                    <span className="count">Explore</span>
                    <h4>{(city.displayName || city.name || '').replace(/\s+City$/i, '')}</h4>
                  </button>
                ))}
            </div>
          </section>
        )}

        {recentListings.length > 0 && (
          <section className="bb-home-section" aria-label="Recently viewed">
            <h2 className="minimal-home-section-title">Recently viewed</h2>
            <div className="minimal-results-list">
              {recentListings.map((property, index) => (
                <MinimalPropertyCard
                  key={property.id || `recent-${index}`}
                  property={property}
                  className="minimal-property-card--home"
                  showDivider={index < recentListings.length - 1}
                  onOpen={() => navigate(`/property/${property.id}`, { state: { from: '/' } })}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
