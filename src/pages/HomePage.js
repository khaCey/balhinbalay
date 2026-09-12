import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { Icon, SectionHeading, EmptyState } from '../components/ui/Controls';
import SearchModule from '../components/SearchModule';
import MinimalPropertyCard from '../components/minimal/MinimalPropertyCard';
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  SITE_DESCRIPTION,
  toAbsoluteUrl,
} from '../seo/siteSeo';
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
    : state.selectedCity && state.selectedCity !== 'cebu-province'
      ? [state.selectedCity]
      : [];
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
  const { listings, loading, error, refreshListings } = useListings();
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
      logo: toAbsoluteUrl('/logo.png'),
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
        'query-input': 'required name=listingType',
      },
    },
  ];

  const [listingType, setListingType] = useState(
    lastSearchState?.listingType || 'rent',
  );
  const featured = useMemo(
    () =>
      listings
        .filter(
          (item) =>
            item.listingType === listingType &&
            !item.sold &&
            !item.currentlyRented &&
            (!item.status || item.status === 'approved'),
        )
        .slice(0, 6),
    [listings, listingType],
  );

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
    const byId = new Map(
      (Array.isArray(listings) ? listings : []).map((item) => [
        String(item.id),
        item,
      ]),
    );
    return recentIds
      .map((id) => byId.get(String(id)))
      .filter(Boolean)
      .slice(0, 6);
  }, [listings, recentIds]);

  const continueSearch = () => {
    if (!lastSearchState) {
      navigate('/search');
      return;
    }
    if (lastSearchState.view === 'map') {
      navigate(
        `/search/map?listingType=${lastSearchState.listingType || 'sale'}`,
      );
      return;
    }
    navigate(`/${lastSearchState.listingType === 'rent' ? 'rent' : 'sale'}`);
  };

  const searchPopularCity = (city) => {
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
      selectedSchoolId: '',
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
      <div className="bb-home">
        <div className="bb-home-hero">
          <div>
            <div className="bb-eyebrow">
              <Icon name="pin" />A place to call yours
            </div>
            <h1>
              Where do you
              <br />
              want to <span>live?</span>
            </h1>
            <p>
              Find your city. Explore the possibilities.
              <br />
              Feel a little closer to home.
            </p>
          </div>
          <SearchModule
            initialListingType={listingType}
            onListingTypeChange={setListingType}
          />
        </div>
        {hasSearched && lastSearchState && (
          <section className="bb-section">
            <button
              className="bb-continue"
              type="button"
              onClick={continueSearch}
            >
              <span>
                <strong>Pick up where you left off</strong>
                <small>{continueLabel(lastSearchState)}</small>
              </span>
              <Icon name="arrow" />
            </button>
          </section>
        )}
        <section className="bb-section">
          <SectionHeading
            title="Popular places"
            action="All cities"
            onAction={() => navigate(`/search?listingType=${listingType}`)}
          >
            A familiar city. A fresh start.
          </SectionHeading>
          <div className="bb-rail bb-city-rail">
            {(popularAreas.length
              ? popularAreas
              : cebuCities
                  .filter((city) =>
                    [
                      'cebu-city',
                      'mandaue-city',
                      'danao-city',
                      'lapu-lapu-city',
                    ].includes(city.id),
                  )
                  .map((city) => ({ city }))
            ).map(({ city, count }) => (
              <button
                key={city.id}
                className="bb-city-card"
                type="button"
                onClick={() => searchPopularCity(city)}
              >
                <strong>{city.displayName.replace(' City', '')}</strong>
                <p>
                  {count
                    ? `${count} places to explore.`
                    : city.id === 'cebu-city'
                      ? 'City living, with more possibilities.'
                      : city.id === 'mandaue-city'
                        ? 'A little closer to everything.'
                        : 'Room for a fresh start.'}
                </p>
                <span>
                  <Icon name="arrow" />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="bb-section">
          <SectionHeading
            title="Places to explore"
            action="See more"
            onAction={() => {
              submitSearch({
                listingType,
                view: 'city',
                selectedCity: 'cebu-province',
                selectedCityIds: [],
                sortBy: 'newest',
              });
              navigate(`/${listingType}`);
            }}
          >
            Homes worth a closer look.
          </SectionHeading>
          {loading ? (
            <p role="status" className="bb-muted">
              Loading homes…
            </p>
          ) : error ? (
            <EmptyState
              title="We couldn’t load homes."
              action="Try again"
              onAction={refreshListings}
            >
              {error}
            </EmptyState>
          ) : featured.length ? (
            <div className="bb-rail">
              {featured.map((property) => (
                <MinimalPropertyCard
                  key={property.id}
                  property={property}
                  className="minimal-property-card--home"
                  onOpen={() =>
                    navigate(`/property/${property.id}`, {
                      state: { from: '/' },
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="A fresh start."
              action="Start a search"
              onAction={() => navigate('/search')}
            >
              No listings available for this choice yet.
            </EmptyState>
          )}
        </section>
        {recentListings.length > 0 && (
          <section className="bb-section">
            <SectionHeading
              title="Recently viewed"
              action="View all"
              onAction={() => navigate('/saved?tab=recent')}
            />
            <div className="bb-rail">
              {recentListings.map((property) => (
                <MinimalPropertyCard
                  key={property.id}
                  property={property}
                  className="minimal-property-card--home"
                  onOpen={() =>
                    navigate(`/property/${property.id}`, {
                      state: { from: '/' },
                    })
                  }
                />
              ))}
            </div>
          </section>
        )}
        <section className="bb-owner-banner">
          <span className="bb-owner-icon">
            <Icon name="key" />
          </span>
          <div>
            <h2>Someone is looking for your place.</h2>
            <p>Make your next tenant’s search a little easier.</p>
            <button
              type="button"
              className="bb-button bb-secondary"
              onClick={() => (user ? navigate('/add-property') : openLogin())}
            >
              List a property <Icon name="arrow" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
