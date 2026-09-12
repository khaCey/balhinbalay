import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserListings } from '../../context/UserListingsContext';
import { getCityById } from '../../data/cities';
import BottomSheet from './BottomSheet';
import { Icon } from './Controls';

export default function OwnerListing({ property, onOpen }) {
  const navigate = useNavigate();
  const { unlistListing } = useUserListings();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const city =
    getCityById(property.cityId)?.displayName ||
    property.city ||
    property.cityId;
  const status =
    property.status === 'unlisted'
      ? 'Unlisted'
      : property.status === 'rejected'
        ? 'Rejected'
        : property.status === 'pending'
          ? 'Pending approval'
          : property.sold
            ? 'Sold'
            : property.currentlyRented
              ? 'Rented'
              : property.status === 'approved'
                ? 'Active'
                : 'Status unavailable';
  const close = () => {
    if (!busy) {
      setConfirm(false);
      setError('');
    }
  };
  const unlist = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await unlistListing(property.id);
      setConfirm(false);
    } catch (err) {
      setError(
        err?.userMessage || err?.message || 'Could not unlist this property.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="bb-panel bb-owner-listing">
      <div className="bb-owner-listing-status">
        <span
          className={`bb-status bb-status--${status.toLowerCase().replaceAll(' ', '-')}`}
        >
          {status}
        </span>
        <small>For {property.listingType === 'rent' ? 'rent' : 'sale'}</small>
      </div>
      <button
        type="button"
        className="bb-owner-summary"
        onClick={onOpen}
        aria-label={`View ${property.title}`}
      >
        {property.images?.[0] ? (
          <img src={property.images[0]} alt="" loading="lazy" />
        ) : (
          <span className="bb-owner-photo-empty">
            <Icon name="home" />
          </span>
        )}
        <span>
          <strong className="bb-price">
            {property.price != null
              ? `₱${Number(property.price).toLocaleString()}`
              : 'Price on request'}
            {property.listingType === 'rent' && <small> / month</small>}
          </strong>
          <strong>{property.title}</strong>
          <small>{[property.location, city].filter(Boolean).join(', ')}</small>
          <small>
            {property.type}
            {property.availableFrom
              ? ` · Available from ${property.availableFrom}`
              : ''}
          </small>
        </span>
      </button>
      <div className="bb-owner-actions">
        <button
          type="button"
          className="bb-button bb-secondary"
          onClick={() => navigate(`/add-property/${property.id}`)}
        >
          <Icon name="edit" />
          Edit
        </button>
        <button
          type="button"
          className="bb-button bb-secondary"
          onClick={() =>
            navigate(`/add-property/${property.id}?section=availability`)
          }
        >
          Availability
        </button>
        {status === 'Active' && (
          <button
            type="button"
            className="bb-text-button"
            onClick={() => setConfirm(true)}
          >
            Unlist
          </button>
        )}
      </div>
      <BottomSheet
        open={confirm}
        title="Unlist listing"
        onClose={close}
        footer={
          <>
            <button
              type="button"
              className="bb-button bb-secondary"
              onClick={close}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bb-button bb-danger"
              onClick={unlist}
              disabled={busy}
            >
              {busy ? 'Unlisting…' : 'Unlist'}
            </button>
          </>
        }
      >
        <p>
          Remove this listing from the feed? It will be hidden from others but
          stay in your account. An admin can relist it if needed.
        </p>
        {error && (
          <p role="alert" className="bb-form-error">
            {error}
          </p>
        )}
      </BottomSheet>
    </article>
  );
}
