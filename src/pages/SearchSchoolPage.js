import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import PageHeader from '../components/PageHeader';
import { schools } from '../data/schools';
import Seo from '../components/Seo';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';

export default function SearchSchoolPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listingType') || 'sale';
  const { submitSearch } = useSearch();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  const handleBack = () => navigate(-1);
  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch({
      listingType,
      view: 'school',
      selectedSchoolId: selectedSchoolId || '',
      selectedRegion: 'all',
      selectedProvince: '',
      selectedCity: 'cebu-province',
      searchQuery: '',
      propertyType: '',
      priceRangeIndex: 0,
      minBeds: 0,
      minBaths: 0,
      sizeRange: { min: 0, max: Infinity },
      sortBy: 'newest'
    });
    navigate(`/${listingType}`);
  };
  const seoTitle = `Search ${listingType === 'rent' ? 'Rent' : 'Sale'} Listings Near Schools`;
  const seoDescription = `Find ${listingType === 'rent' ? 'rental' : 'for-sale'} properties near schools and universities in the Philippines.`;
  const searchSchoolJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoTitle,
      description: seoDescription,
      url: toAbsoluteUrl('/search/school')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: toAbsoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Search', item: toAbsoluteUrl('/search') },
        { '@type': 'ListItem', position: 3, name: 'Search near School', item: toAbsoluteUrl('/search/school') }
      ]
    }
  ];

  return (
    <div className="search-filter-page minimal-page">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/search/school"
        ogTitle={seoTitle}
        ogDescription="Browse listings near schools and universities."
        ogImage={DEFAULT_OG_IMAGE_PATH}
        jsonLd={searchSchoolJsonLd}
        jsonLdId="seo-search-school-json-ld"
      />
      <PageHeader title="Search near School" onBack={handleBack} />
      <main className="search-filter-page-main">
        <p className="search-filter-page-subtitle">Search near a school or university</p>
        <form onSubmit={handleSubmit} className="search-filter-page-form">
          <div className="search-filter-page-field">
            <label htmlFor="search-school-select" className="form-label filter-label">School or university</label>
            <select
              id="search-school-select"
              className="form-select"
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              aria-label="Select school or university"
            >
              <option value="">Select a school...</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
