import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { listings } = useListings();
  const { user } = useAuth();
  const { createOrGetThread } = useChat();
  const { unlistListing } = useUserListings();
  const { openLogin } = useLoginModal();
  const { addView } = useRecentlyViewed();
  const [listingToDelete, setListingToDelete] = useState(null);

  const property = (Array.isArray(listings) ? listings : []).find((l) => l.id === id);
  useEffect(() => {
    if (property?.id) addView(property.id);
  }, [property?.id, addView]);

  const handleBack = () => navigate(-1);

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
    try {
      await unlistListing(listingToDelete.id);
      setListingToDelete(null);
      navigate(-1);
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
        <PageHeader title="Property" onBack={() => navigate(-1)} />
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
            showCloseButton={false}
            showBackButton
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
