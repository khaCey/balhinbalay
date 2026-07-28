import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';

export default function SearchKeywordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || 'sale';
  const { submitSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => navigate(-1);
  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch({
      listingType,
      view: 'keyword',
      searchQuery: searchQuery.trim(),
      selectedRegion: 'all',
      selectedProvince: '',
      selectedCity: 'cebu-province',
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
  const seoTitle = `Search ${listingType === 'rent' ? 'Rent' : 'Sale'} Listings by Keyword`;
  const seoDescription = `Search ${listingType === 'rent' ? 'rental' : 'for-sale'} properties using keywords such as condo, furnished, pet-friendly, and more.`;
  const searchKeywordJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoTitle,
      description: seoDescription,
      url: toAbsoluteUrl('/search/keyword')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: toAbsoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Search', item: toAbsoluteUrl('/search') },
        { '@type': 'ListItem', position: 3, name: 'Search by Keyword', item: toAbsoluteUrl('/search/keyword') }
      ]
    }
  ];

  return (
    <div className="search-filter-page minimal-page">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/search/keyword"
        ogTitle={seoTitle}
        ogDescription={`Use keyword search to find relevant ${listingType === 'rent' ? 'rent' : 'sale'} listings.`}
        ogImage={DEFAULT_OG_IMAGE_PATH}
        jsonLd={searchKeywordJsonLd}
        jsonLdId="seo-search-keyword-json-ld"
      />
      <PageHeader title="Search by Keyword" onBack={handleBack} />
      <main className="search-filter-page-main">
        <p className="search-filter-page-subtitle">House, condo, furnished, pet-friendly</p>
        <form onSubmit={handleSubmit} className="search-filter-page-form">
          <div className="search-filter-page-field">
            <label htmlFor="search-keyword-input" className="form-label filter-label">Keyword</label>
            <input
              id="search-keyword-input"
              type="text"
              className="form-control"
              placeholder="Search location, name, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
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
