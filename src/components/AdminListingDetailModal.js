import React, { useState } from 'react';
import { formatPrice } from '../utils/helpers';

/**
 * Modal for admins to view a listing's details and photos.
 * variant="pending": Approve / Reject. variant="all": Unlist / Relist / Remove.
 */
const AdminListingDetailModal = ({
  listing,
  show,
  onClose,
  onApprove,
  onReject,
  onRejectConfirm,
  variant = 'pending',
  onUnlist,
  onRelist,
  onRemove
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  if (!listing || !show) return null;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleReject = () => {
    if (onRejectConfirm) {
      onRejectConfirm(listing);
    } else {
      onReject(listing);
      onClose();
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setActionLoading(true);
    try {
      await onApprove(listing.id);
      onClose();
    } catch {
      // Error shown in parent
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlist = async () => {
    if (!onUnlist) return;
    setActionLoading(true);
    try {
      await onUnlist(listing.id);
      onClose();
    } catch {
      // Error shown in parent
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelist = async () => {
    if (!onRelist) return;
    setActionLoading(true);
    try {
      await onRelist(listing.id);
      onClose();
    } catch {
      // Error shown in parent
    } finally {
      setActionLoading(false);
    }
  };

  const isAllVariant = variant === 'all';
  const status = listing.status || 'approved';
  const canUnlist = status === 'approved';
  const canRelist = status === 'rejected' || status === 'unlisted';

  return (
    <div
      className="modal fade show"
      style={{ display: 'block' }}
      tabIndex="-1"
      aria-modal="true"
      aria-labelledby="admin-listing-detail-title"
    >
      <div className="modal-backdrop fade show" onClick={onClose} aria-hidden />
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 id="admin-listing-detail-title" className="modal-title">
              {listing.title}
              {isAllVariant ? (
                <span className={`badge ms-2 admin-badge-listing-${status}`}>
                  {status}
                </span>
              ) : (
                <span className="badge bg-warning text-dark ms-2">Pending</span>
              )}
            </h5>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
          <div className="modal-body">
            {/* Photo carousel */}
            <div className="property-modal-carousel mb-3">
              <div className="carousel-inner">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`carousel-item ${i === activeIndex ? 'active' : ''}`}
                  >
                    <img
                      src={img}
                      className="d-block w-100"
                      style={{ maxHeight: '400px', objectFit: 'cover' }}
                      alt=""
                    />
                  </div>
                ))}
              </div>
              {images.length > 1 && (
                <div className="carousel-indicators-bar">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={i === activeIndex ? 'active' : ''}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setActiveIndex(i)}
                    />
                  ))}
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    onClick={handlePrev}
                  >
                    <span className="carousel-control-prev-icon" aria-hidden="true" />
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    onClick={handleNext}
                  >
                    <span className="carousel-control-next-icon" aria-hidden="true" />
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              )}
            </div>

            <p className="property-price mb-2">{formatPrice(listing)}</p>
            <p className="text-muted mb-2">
              <i className="fas fa-map-marker-alt me-2" />
              {listing.location || '—'}
              {listing.cityId && ` · ${listing.cityId}`}
            </p>
            <div className="property-features mb-3">
              {listing.beds > 0 && (
                <span><i className="fas fa-bed feature-icon me-1" />{listing.beds} Beds</span>
              )}
              {listing.baths > 0 && (
                <span><i className="fas fa-bath feature-icon me-1" />{listing.baths} Baths</span>
              )}
              {listing.size && (
                <span><i className="fas fa-ruler-combined feature-icon me-1" />{listing.size}</span>
              )}
              <span><i className="fas fa-tag feature-icon me-1" />{listing.type} / {listing.listingType}</span>
            </div>
            <div className="mb-3">
              <h6>Description</h6>
              <p>{listing.description || 'No description.'}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
            {isAllVariant ? (
              <>
                {canUnlist && onUnlist && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-warning"
                    onClick={handleUnlist}
                    disabled={actionLoading}
                  >
                    {actionLoading ? '…' : 'Unlist'}
                  </button>
                )}
                {canRelist && onRelist && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-success"
                    onClick={handleRelist}
                    disabled={actionLoading}
                  >
                    {actionLoading ? '…' : 'Relist'}
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => onRemove(listing)}
                  >
                    Remove
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleReject}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-success"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? '…' : 'Approve'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminListingDetailModal;
