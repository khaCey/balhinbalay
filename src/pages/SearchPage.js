import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import SearchModule from '../components/SearchModule';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';
import { useSearch } from '../context/SearchContext';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lastSearchState, hasSearched } = useSearch();

  const listingTypeParam = searchParams.get('listingType');
  const modeParam = searchParams.get('mode');
  const editParam = searchParams.get('edit');
  const listingType = listingTypeParam === 'rent' ? 'rent' : (lastSearchState?.listingType === 'rent' ? 'rent' : 'sale');
  const isEdit = editParam === '1' || modeParam === 'edit';

  const initialState = useMemo(() => {
    if (!isEdit || !lastSearchState) {
      return {
        listingType,
        view: modeParam === 'school' || modeParam === 'keyword' ? modeParam : 'city',
        selectedRegion: 'all',
        selectedProvince: '',
        selectedCity: 'cebu-province',
        selectedCityIds: [],
        searchQuery: '',
        propertyType: '',
        priceRangeIndex: 0,
        selectedSchoolId: ''
      };
    }
    return {
      ...lastSearchState,
      listingType: listingTypeParam === 'rent' || listingTypeParam === 'sale'
        ? listingTypeParam
        : lastSearchState.listingType
    };
  }, [isEdit, lastSearchState, listingType, listingTypeParam, modeParam]);

  const searchLandingTitle = 'Choose where you want to live';
  const searchLandingDescription =
    'Start with a Philippine city, then refine homes for rent or sale by property type, price, and bedrooms.';
  const searchJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: searchLandingTitle,
      description: searchLandingDescription,
      url: toAbsoluteUrl('/search')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: toAbsoluteUrl('/')
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Search',
          item: toAbsoluteUrl('/search')
        }
      ]
    }
  ];

  return (
    <div className="home-page search-page search-page-landing search-page-scrollable minimal-page">
      <Seo
        title={searchLandingTitle}
        description={searchLandingDescription}
        canonicalPath="/search"
        ogTitle={searchLandingTitle}
        ogDescription={searchLandingDescription}
        ogImage={DEFAULT_OG_IMAGE_PATH}
        jsonLd={searchJsonLd}
        jsonLdId="seo-search-json-ld"
      />
      <div className="minimal-home-wrap minimal-home-wrap--city-first">
        <div className="prototype-home-topbar">
          <button
            type="button"
            className="prototype-icon-button prototype-icon-button-clear"
            onClick={() => navigate(hasSearched ? `/${listingType}` : '/')}
            aria-label={hasSearched ? 'Back to results' : 'Home'}
          >
            <i className={`fas ${hasSearched ? 'fa-arrow-left' : 'fa-home'}`} aria-hidden />
          </button>
          <p className="minimal-wordmark">BalhinBalay</p>
          <button
            type="button"
            className="prototype-icon-button prototype-icon-button-clear"
            onClick={() => navigate(`/search/map?listingType=${listingType}`)}
            aria-label="Map"
          >
            <i className="fas fa-map-marker-alt" aria-hidden />
          </button>
        </div>

        <div className="prototype-home-intro">
          <p className="prototype-home-small">City-first property search</p>
          <h1 className="minimal-hero-title">Where do you want to live?</h1>
          <p className="prototype-home-lede">
            Pick one or more places, then set only the essentials before viewing results.
          </p>
        </div>

        <SearchModule
          variant="expanded"
          initialListingType={listingType}
          initialState={initialState}
          autoFocus
          defaultSuggestionsOpen
        />
      </div>
    </div>
  );
}
