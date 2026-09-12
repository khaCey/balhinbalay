import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import Seo from './Seo';
import { getCityById } from '../data/cities';
import { DEFAULT_OG_IMAGE_PATH, toAbsoluteUrl } from '../seo/siteSeo';
import ConsentBanner from './ConsentBanner';
import {
  initAnalytics,
  getStoredConsent,
  setAnalyticsConsent,
} from '../utils/analytics';
import ComparisonProvider from './ui/Comparison';
import AppNavigation from './ui/AppNavigation';

export default function MainLayout() {
  const location = useLocation();
  const path = location.pathname;
  const { hasSearched, lastSearchState } = useSearch();
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const hideBottomNav =
    path.startsWith('/chat/') ||
    path.startsWith('/add-property') ||
    path === '/admin';
  useEffect(() => {
    initAnalytics();
    setShowConsentBanner(getStoredConsent() == null);
  }, []);
  const consent = (accepted) => {
    setAnalyticsConsent(accepted);
    setShowConsentBanner(false);
  };
  const isRentOrSaleRoute = path === '/rent' || path === '/sale';
  const isPrivateNoIndexPath =
    path === '/my-properties' ||
    path === '/saved' ||
    path === '/messages' ||
    path.startsWith('/chat/') ||
    path === '/menu' ||
    path === '/profile' ||
    path === '/settings' ||
    path === '/add-property' ||
    path.startsWith('/add-property/') ||
    path === '/admin' ||
    path === '/confirm-email';

  const activeListingType = path === '/rent' ? 'rent' : 'sale';
  const searchStateForListing =
    hasSearched && lastSearchState?.listingType === activeListingType
      ? lastSearchState
      : null;
  const activeCity = searchStateForListing?.selectedCity
    ? getCityById(searchStateForListing.selectedCity)
    : null;
  const activeCityName =
    activeCity && activeCity.id !== 'cebu-province'
      ? activeCity.displayName
      : '';
  const rentOrSaleLabel = activeListingType === 'rent' ? 'Rent' : 'Sale';
  const rentOrSaleTitle = `${rentOrSaleLabel} Properties${activeCityName ? ` in ${activeCityName}` : ' in the Philippines'}`;
  const rentOrSaleDescription = activeCityName
    ? `Browse ${activeListingType === 'rent' ? 'rental' : 'for-sale'} property listings in ${activeCityName}, Philippines.`
    : `Browse ${activeListingType === 'rent' ? 'rental' : 'for-sale'} property listings across the Philippines.`;
  const rentOrSaleBreadcrumbSchema = {
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
        name: activeListingType === 'rent' ? 'For Rent' : 'For Sale',
        item: toAbsoluteUrl(activeListingType === 'rent' ? '/rent' : '/sale'),
      },
    ],
  };

  return (
    <ComparisonProvider>
      <div className={`bb-app ${hideBottomNav ? 'bb-app--focused' : ''}`}>
        {isRentOrSaleRoute && (
          <Seo
            title={rentOrSaleTitle}
            description={rentOrSaleDescription}
            canonicalPath={activeListingType === 'rent' ? '/rent' : '/sale'}
            ogTitle={rentOrSaleTitle}
            ogDescription={rentOrSaleDescription}
            ogImage={DEFAULT_OG_IMAGE_PATH}
            jsonLd={rentOrSaleBreadcrumbSchema}
            jsonLdId="seo-rent-sale-json-ld"
          />
        )}
        {!isRentOrSaleRoute && isPrivateNoIndexPath && (
          <Seo
            title="Account Page"
            description="This page is intended for logged-in users."
            canonicalPath={path}
            noindex
          />
        )}
        <AppNavigation hideBottomNav={hideBottomNav} />
        <div className="bb-main">
          <Outlet key={`${location.pathname}${location.search || ''}`} />
        </div>
        <ConsentBanner
          open={showConsentBanner}
          hasBottomNav={!hideBottomNav}
          onAccept={() => consent(true)}
          onReject={() => consent(false)}
        />
      </div>
    </ComparisonProvider>
  );
}
