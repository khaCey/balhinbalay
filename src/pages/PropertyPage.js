import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useUserListings } from '../context/UserListingsContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import PropertyDetailContent from '../components/PropertyDetailContent';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';
import { getCityById } from '../data/cities';
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME, toAbsoluteUrl } from '../seo/siteSeo';
import { trackEvent } from '../utils/analytics';

function formatPropertyMetaDescription(property, cityName) {
  if (!property) return '';
  const parts = [];
  const listingLine = property.listingType === 'rent' ? 'For Rent' : 'For Sale';
  parts.push(listingLine);
  if (property.type) parts.push(property.type);
  if (cityName) parts.push(`in ${cityName}`);
  if (property.beds > 0) parts.push(`${property.beds} bed`);
  if (property.baths > 0) parts.push(`${property.baths} bath`);
  if (property.sizeSqm > 0) parts.push(`${property.sizeSqm} sqm`);
  const topLine = parts.join(' ');
  const description = (property.description || '').trim().replace(/\s+/g, ' ');
  const trimmedDescription = description.length > 130 ? `${description.slice(0, 127)}...` : description;
  return [topLine, trimmedDescription].filter(Boolean).join('. ');
}

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { listings } = useListings();
  const { user } = useAuth();
  const { createOrGetThread } = useChat();
  const { unlistListing } = useUserListings();
  const { openLogin } = useLoginModal();
  const { addView } = useRecentlyViewed();
  const [listingToDelete, setListingToDelete] = useState(null);

  const property = (Array.isArray(listings) ? listings : []).find((l) => l.id === id);
  const city = property?.cityId ? getCityById(property.cityId) : null;
  const cityName = city?.displayName || property?.cityId || '';
  const propertyMetaTitle = property
    ? `${property.title} ${property.listingType === 'rent' ? 'for Rent' : 'for Sale'}`
    : 'Property listing';
  const propertyMetaDescription = formatPropertyMetaDescription(property, cityName);
  const propertyImage = property?.images?.[0] || DEFAULT_OG_IMAGE_PATH;
  const propertyCanonicalPath = `/property/${id}`;
  const propertyBreadcrumbLabel = property?.listingType === 'rent' ? 'For Rent' : 'For Sale';
  const propertySchema = property
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: propertyMetaDescription || property.description || '',
        url: toAbsoluteUrl(propertyCanonicalPath),
        image: Array.isArray(property.images) ? property.images.slice(0, 8) : [propertyImage],
        datePosted: property.datePosted,
        offers: {
          '@type': 'Offer',
          price: Number(property.price) || 0,
          priceCurrency: 'PHP',
          availability:
            property.sold || property.currentlyRented
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock'
        },
        itemOffered: {
          '@type': 'Residence',
          name: property.title,
          numberOfRooms: property.beds > 0 ? property.beds : undefined,
          numberOfBathroomsTotal: property.baths > 0 ? property.baths : undefined,
          floorSize:
            property.sizeSqm > 0
              ? {
                  '@type': 'QuantitativeValue',
                  value: property.sizeSqm,
                  unitCode: 'MTK'
                }
              : undefined,
          address: cityName
            ? {
                '@type': 'PostalAddress',
                addressLocality: cityName
              }
            : undefined,
          geo:
            property.coordinates &&
            typeof property.coordinates.lat === 'number' &&
            typeof property.coordinates.lng === 'number'
              ? {
                  '@type': 'GeoCoordinates',
                  latitude: property.coordinates.lat,
                  longitude: property.coordinates.lng
                }
              : undefined
        },
        broker: property.contactInfo?.agentName
          ? {
              '@type': 'RealEstateAgent',
              name: property.contactInfo.agentName
            }
          : undefined
      }
    : null;
  const breadcrumbSchema = property
    ? {
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
            name: propertyBreadcrumbLabel,
            item: toAbsoluteUrl(property.listingType === 'rent' ? '/rent' : '/sale')
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: property.title,
            item: toAbsoluteUrl(propertyCanonicalPath)
          }
        ]
      }
    : null;
  const isActivePropertyRoute = location.pathname === `/property/${id}`;
  useEffect(() => {
    if (property?.id) addView(property.id);
  }, [property?.id, addView]);

  useEffect(() => {
    if (!isActivePropertyRoute) return undefined;
    const appMain = document.querySelector('.app-main');
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const prevMainOverflow = appMain ? appMain.style.overflow : '';
    const prevMainOverflowY = appMain ? appMain.style.overflowY : '';

    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.overscrollBehavior = 'auto';
    document.documentElement.style.overscrollBehavior = 'auto';
    if (appMain) {
      appMain.style.overflow = 'auto';
      appMain.style.overflowY = 'auto';
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
      if (appMain) {
        appMain.style.overflow = prevMainOverflow;
        appMain.style.overflowY = prevMainOverflowY;
      }
    };
  }, [isActivePropertyRoute]);

  useEffect(() => {
    if (!property?.id) return;
    trackEvent('view_property', {
      property_id: property.id,
      listing_type: property.listingType,
      city_id: property.cityId || '',
      has_images: Array.isArray(property.images) && property.images.length > 0
    });
  }, [property?.id, property?.listingType, property?.cityId, property?.images]);

  if (!isActivePropertyRoute) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const fromPath = typeof location.state?.from === 'string' ? location.state.from : '';
    const fallback =
      fromPath === '/rent' || property?.listingType === 'rent'
        ? '/rent'
        : '/sale';
    navigate(fallback, { replace: true, state: {} });
  };

  const handleOpenChat = async (p) => {
    const threadId = await createOrGetThread(p.id);
    if (threadId) navigate(`/chat/${threadId}`);
  };

  const handleEdit = (listing) => {
    navigate(`/add-property/${listing.id}`);
  };

  const handleDelete = (listing) => {
    setListingToDelete(listing);
  };

  const handleConfirmUnlist = async () => {
    if (!listingToDelete) return;
    const listing = listingToDelete;
    try {
      await unlistListing(listing.id);
      setListingToDelete(null);
      navigate(listing.listingType === 'rent' ? '/rent' : '/sale', { replace: true, state: {} });
    } catch (err) {
      console.error(err);
      window.alert(err?.message || 'Failed to unlist.');
    } finally {
      setListingToDelete(null);
    }
  };

  if (!property) {
    return (
      <div className="page-with-header minimal-page">
        <Seo
          title="Property Not Found"
          description={`The property listing could not be found on ${SITE_NAME}.`}
          canonicalPath={propertyCanonicalPath}
          noindex
        />
        <PageHeader title="Property" onBack={handleBack} />
        <main className="page-content">
          <p className="text-muted">Listing not found.</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={propertyMetaTitle}
        description={propertyMetaDescription}
        canonicalPath={propertyCanonicalPath}
        ogTitle={propertyMetaTitle}
        ogDescription={propertyMetaDescription}
        ogImage={propertyImage}
        type="article"
        jsonLd={[propertySchema, breadcrumbSchema]}
        jsonLdId="seo-property-json-ld"
      />
      <div className="property-page minimal-property-detail minimal-page">
        <main className="page-content property-detail-page-content">
          <PropertyDetailContent
            property={property}
            user={user}
            onClose={handleBack}
            onOpenChat={handleOpenChat}
            onLoginForChat={openLogin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showCloseButton={false}
            showBackButton
            onBack={handleBack}
            isPropertyPageLayout
          />
        </main>
      </div>
      <ConfirmModal
        show={!!listingToDelete}
        title="Unlist listing"
        message="Remove this listing from the feed? It will be hidden from others but stay in your account. An admin can relist it if needed."
        confirmLabel="Unlist"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmUnlist}
        onCancel={() => setListingToDelete(null)}
      />
    </>
  );
}
