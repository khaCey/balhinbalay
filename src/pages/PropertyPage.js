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

  const getCloseTarget = () => {
    const raw = typeof location.state?.from === 'string' ? location.state.from.trim() : '';
    const fallback = property?.listingType === 'rent' ? '/rent' : '/sale';

    // Never close into another property route or loop back to the same screen.
    if (!raw || !raw.startsWith('/') || raw === location.pathname || raw.startsWith('/property/')) {
      return fallback;
    }

    return raw;
  };

  const property = (Array.isArray(listings) ? listings : []).find((l) => l.id === id);
  const isActivePropertyRoute = location.pathname === `/property/${id}`;
  useEffect(() => {
    if (property?.id) addView(property.id);
  }, [property?.id, addView]);

  if (!isActivePropertyRoute) return null;

  const handleBack = () => {
    const target = getCloseTarget();
    const currentPath = `${location.pathname}${location.search || ''}`;

    /* Prefer SPA navigation so search state survives. Fallback only if the route stays stuck. */
    navigate(target, { replace: true, state: {} });

    window.setTimeout(() => {
      const nextPath = `${window.location.pathname}${window.location.search || ''}`;
      if (nextPath === currentPath) {
        window.location.assign(target);
      }
    }, 60);
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
      <div className="page-with-header">
        <PageHeader title="Property" onBack={handleBack} />
        <main className="page-content">
          <p className="text-muted">Listing not found.</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="property-page">
        <main className="page-content property-detail-page-content">
          <PropertyDetailContent
            property={property}
            user={user}
            onClose={handleBack}
            onOpenChat={handleOpenChat}
            onLoginForChat={openLogin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showCloseButton
            showBackButton={false}
            onBack={handleBack}
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
