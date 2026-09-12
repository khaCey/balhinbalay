import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import SearchModule from '../components/SearchModule';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';
import { useSearch } from '../context/SearchContext';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { lastSearchState } = useSearch();

  const listingTypeParam = searchParams.get('listingType');
  const modeParam = searchParams.get('mode');
  const editParam = searchParams.get('edit');
  const listingType = ['rent', 'sale'].includes(listingTypeParam)
    ? listingTypeParam
    : lastSearchState?.listingType || 'rent';
  const isEdit = editParam === '1' || modeParam === 'edit';

  const initialState = useMemo(() => {
    if (!isEdit || !lastSearchState) {
      return {
        listingType,
        view:
          modeParam === 'school' || modeParam === 'keyword'
            ? modeParam
            : 'city',
        selectedRegion: 'all',
        selectedProvince: '',
        selectedCity: 'cebu-province',
        selectedCityIds: [],
        searchQuery: '',
        propertyType: '',
        priceRangeIndex: 0,
        selectedSchoolId: '',
      };
    }
    return {
      ...lastSearchState,
      ...(['school', 'keyword', 'city'].includes(modeParam)
        ? { view: modeParam }
        : {}),
      listingType:
        listingTypeParam === 'rent' || listingTypeParam === 'sale'
          ? listingTypeParam
          : lastSearchState.listingType,
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
      url: toAbsoluteUrl('/search'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: toAbsoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Search',
          item: toAbsoluteUrl('/search'),
        },
      ],
    },
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
      <div className="minimal-home-wrap minimal-home-wrap--city-first bb-search-layout">
        <div className="bb-page-heading">
          <p className="bb-eyebrow">Find your place</p>
          <h1>Start somewhere you love.</h1>
          <p>Choose how you want to search.</p>
        </div>
        <SearchModule
          variant="expanded"
          initialListingType={listingType}
          initialState={initialState}
        />
        <section className="bb-search-guidance" aria-labelledby="search-guidance-title">
          <h2 id="search-guidance-title">A search that starts with you</h2>
          <p>
            Pick a location first. You can fine-tune your budget, space and
            must-haves in the results.
          </p>
        </section>
      </div>
    </div>
  );
}
