import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyModal from '../components/PropertyModal';
import ConfirmModal from '../components/ConfirmModal';
import { useListings } from './ListingsContext';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { useUserListings } from './UserListingsContext';
import { useLoginModal } from './LoginModalContext';

const PropertyModalContext = createContext(null);

export function PropertyModalProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { listings } = useListings();
  const { user } = useAuth();
  const { createOrGetThread } = useChat();
  const { unlistListing } = useUserListings();
  const { openLogin } = useLoginModal();

  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const openedFromRef = useRef('');

  const property = useMemo(
    () => (Array.isArray(listings) ? listings : []).find((listing) => listing.id === selectedPropertyId) || null,
    [listings, selectedPropertyId]
  );

  const closeProperty = useCallback(() => {
    setIsOpen(false);
    setSelectedPropertyId(null);
    setListingToDelete(null);
    openedFromRef.current = '';
  }, []);

  const openProperty = useCallback(
    (propertyOrId, options = {}) => {
      const id = typeof propertyOrId === 'string' ? propertyOrId : propertyOrId?.id;
      if (!id) return;
      openedFromRef.current = options.from || `${location.pathname}${location.search || ''}`;
      setSelectedPropertyId(id);
      setIsOpen(true);
    },
    [location.pathname, location.search]
  );

  const setPropertyModalOpen = useCallback(
    (open) => {
      if (!open) closeProperty();
      else setIsOpen(true);
    },
    [closeProperty]
  );

  useEffect(() => {
    if (!isOpen) return;
    const currentPath = `${location.pathname}${location.search || ''}`;
    const openedFrom = openedFromRef.current;
    if (openedFrom && currentPath !== openedFrom) {
      closeProperty();
    }
  }, [isOpen, location.pathname, location.search, closeProperty]);

  useEffect(() => {
    if (isOpen && selectedPropertyId && !property) {
      closeProperty();
    }
  }, [isOpen, selectedPropertyId, property, closeProperty]);

  const handleOpenChat = useCallback(
    async (listing) => {
      const threadId = await createOrGetThread(listing.id);
      if (threadId) {
        closeProperty();
        navigate(`/chat/${threadId}`);
      }
    },
    [createOrGetThread, closeProperty, navigate]
  );

  const handleEdit = useCallback(
    (listing) => {
      closeProperty();
      navigate(`/add-property/${listing.id}`);
    },
    [closeProperty, navigate]
  );

  const handleDelete = useCallback((listing) => {
    setListingToDelete(listing);
  }, []);

  const handleConfirmUnlist = useCallback(async () => {
    if (!listingToDelete) return;
    const listing = listingToDelete;
    try {
      await unlistListing(listing.id);
      closeProperty();
      navigate(listing.listingType === 'rent' ? '/rent' : '/sale', { replace: true, state: {} });
    } catch (err) {
      console.error(err);
      window.alert(err?.message || 'Failed to unlist.');
    } finally {
      setListingToDelete(null);
    }
  }, [listingToDelete, unlistListing, closeProperty, navigate]);

  const value = useMemo(
    () => ({
      isPropertyModalOpen: isOpen,
      setPropertyModalOpen,
      openProperty,
      closeProperty,
      selectedPropertyId
    }),
    [isOpen, setPropertyModalOpen, openProperty, closeProperty, selectedPropertyId]
  );

  return (
    <PropertyModalContext.Provider value={value}>
      {children}
      <PropertyModal
        property={property}
        show={isOpen && !!property}
        onHide={closeProperty}
        user={user}
        onOpenChat={handleOpenChat}
        onLoginForChat={openLogin}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
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
    </PropertyModalContext.Provider>
  );
}

export function usePropertyModal() {
  const ctx = useContext(PropertyModalContext);
  return ctx || {
    isPropertyModalOpen: false,
    setPropertyModalOpen: () => {},
    openProperty: () => {},
    closeProperty: () => {},
    selectedPropertyId: null
  };
}
