import React, { useState } from 'react';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import { api } from '../api/client';
import FavoritesButton from './FavoritesButton';
import PropertyMapPreview from './PropertyMapPreview';

/**
 * Shared content for property detail (used by PropertyModal and PropertyPage).
 * Receives property and callbacks: onClose, onOpenChat, onLoginForChat, onEdit, onDelete.
 */
export default function PropertyDetailContent({
  property,
  user,
  onClose,
  onOpenChat,
  onLoginForChat,
  onEdit,
  onDelete,
  showCloseButton = true,
  showBackButton = false,
  onBack
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState('');
  const cityName = property ? (getCityById(property.cityId)?.displayName || property.city || property.cityId || '') : '';
  const locationLine = property ? [property.location, cityName].filter(Boolean).join(', ') || '—' : '—';

  if (!property) return null;

  const isRent = property.listingType === 'rent';
  const hasAnyMoveInFee = isRent && (
    (property.keyMoney > 0) || (property.securityDeposit > 0) || (property.advancePay > 0) ||
    (property.brokerFee > 0) || (property.associationFee > 0) || (property.reservationFee > 0) ||
    property.utilitiesIncluded === true || property.utilitiesIncluded === false || property.extraFees
  );
  const moveInTotal = isRent ? [
    property.keyMoney || 0,
    property.securityDeposit || 0,
    property.advancePay || 0,
    property.brokerFee || 0,
    property.associationFee || 0,
    property.reservationFee || 0
  ].reduce((a, b) => a + b, 0) : 0;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportLoading(true);
    try {
      await api.post(`/api/listings/${property.id}/report`, { reason: reportReason.trim() || undefined });
      setReportSubmitted(true);
      setTimeout(() => { setShowReportModal(false); setReportReason(''); setReportSubmitted(false); }, 1500);
    } catch (err) {
      setReportError(err?.data?.error || err?.message || 'Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleChat = () => {
    if (!user) {
      onLoginForChat?.();
      return;
    }
    onOpenChat?.(property);
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const isOwner = user && property.ownerId === user.id;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href
      }).catch((err) => console.log('Error sharing', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <div className="modal-header">
        {showBackButton && onBack && (
          <button
            type="button"
            className="property-detail-back-btn"
            onClick={onBack}
            aria-label="Back"
          >
            <i className="fas fa-arrow-left" aria-hidden />
          </button>
        )}
        <h5 className="modal-title d-flex align-items-center gap-2 flex-wrap">
          {property.title}
          {isOwner && property.status === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
          {isOwner && property.status === 'rejected' && <span className="badge bg-danger">Rejected</span>}
        </h5>
        <div className="property-modal-header-actions">
          <FavoritesButton propertyId={property.id} className="property-modal-header-icon" />
          {isOwner && (
            <>
              <button
                type="button"
                className="property-modal-header-btn property-modal-header-btn-edit"
                onClick={() => onEdit?.(property)}
                aria-label="Edit listing"
              >
                <i className="fas fa-pen me-1" aria-hidden />
                Edit
              </button>
              <button
                type="button"
                className="property-modal-header-btn property-modal-header-btn-delete"
                onClick={() => onDelete?.(property)}
                aria-label="Unlist listing"
              >
                <i className="fas fa-eye-slash me-1" aria-hidden />
                Unlist
              </button>
            </>
          )}
          <button
            type="button"
            className="property-modal-header-icon"
            onClick={handleShare}
            aria-label="Share property"
          >
            <i className="fas fa-share-alt" />
          </button>
          {!isOwner && (
            <button
              type="button"
              className="property-modal-header-icon property-modal-header-btn-report"
              onClick={() => {
                if (!user) {
                  onLoginForChat?.();
                  return;
                }
                setShowReportModal(true);
                setReportError('');
                setReportReason('');
              }}
              aria-label="Report listing"
              title="Report this listing"
            >
              <i className="fas fa-flag" />
            </button>
          )}
          {showCloseButton && (
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden />
            </button>
          )}
        </div>
      </div>
      <div className="modal-body">
        {property.images && property.images.length > 0 && (
          <div className="property-modal-carousel mb-3" id="detailsModalCarousel">
            <div className="carousel-inner">
              {property.images.map((img, i) => (
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
            {property.images.length > 1 && (
              <>
                <div className="carousel-indicators-bar">
                  {property.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={i === activeIndex ? 'active' : ''}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setActiveIndex(i)}
                    />
                  ))}
                </div>
                <button className="carousel-control-prev" type="button" onClick={handlePrevious}>
                  <span className="carousel-control-prev-icon" aria-hidden />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" onClick={handleNext}>
                  <span className="carousel-control-next-icon" aria-hidden />
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="property-price mb-2">{formatPrice(property)}</p>
            {isRent && (
              <div className="property-move-in-fees mb-2">
                <h6 className="small mb-2">Move-in fees</h6>
                <ul className="list-unstyled text-muted small mb-1">
                  <li>Key money: ₱{(Number(property.keyMoney) || 0).toLocaleString()}</li>
                  <li>Security deposit: ₱{(Number(property.securityDeposit) || 0).toLocaleString()}</li>
                  <li>Advance pay: ₱{(Number(property.advancePay) || 0).toLocaleString()}</li>
                  <li>Broker fee: ₱{(Number(property.brokerFee) || 0).toLocaleString()}</li>
                  <li>Association fee: ₱{(Number(property.associationFee) || 0).toLocaleString()}</li>
                  <li>Reservation fee: ₱{(Number(property.reservationFee) || 0).toLocaleString()}</li>
                  <li>Utilities: {property.utilitiesIncluded === true ? 'included' : 'separate'}</li>
                  <li>Other: {property.extraFees || '0'}</li>
                </ul>
                <p className="mb-0 fw-semibold small">Total move-in: ₱{moveInTotal.toLocaleString()}</p>
              </div>
            )}
            <p className="text-muted mb-2">
              <i className="fas fa-map-marker-alt me-2" />
              {locationLine}
            </p>
          </div>
          {(property.sold || property.currentlyRented) && (
            <span className="badge bg-secondary">
              {property.sold ? 'Sold' : 'Currently rented'}
            </span>
          )}
        </div>
        <div className="property-features mb-3">
          {property.beds > 0 && <span><i className="fas fa-bed feature-icon me-1" />{property.beds} Beds</span>}
          {property.baths > 0 && <span><i className="fas fa-bath feature-icon me-1" />{property.baths} Baths</span>}
          <span><i className="fas fa-ruler-combined feature-icon me-1" />{property.size}</span>
          <span><i className="fas fa-tag feature-icon me-1" />{property.type}</span>
          {property.furnished && <span><i className="fas fa-couch feature-icon me-1" />{property.furnished}</span>}
        </div>
        {property.listingType === 'rent' && property.currentlyRented && property.availableFrom && (
          <p className="text-muted mb-3"><strong>Next availability:</strong> {property.availableFrom}</p>
        )}
        <div className="mb-3">
          <h6>Description</h6>
          <p>{property.description || 'No description available.'}</p>
        </div>
        {property.contactInfo && (
          <div className="contact-section p-3 mb-3">
            <h6 className="mb-3">Contact Information</h6>
            <div className="contact-details mb-3">
              {property.contactInfo.agentName && (
                <p className="mb-2">
                  <i className="fas fa-user me-2" /><strong>Agent:</strong> {property.contactInfo.agentName}
                </p>
              )}
              {property.contactInfo.phone && (
                <p className="mb-2">
                  <i className="fas fa-phone me-2" /><strong>Phone:</strong>{' '}
                  <a href={`tel:${property.contactInfo.phone}`} className="ms-2">{property.contactInfo.phone}</a>
                </p>
              )}
              {property.contactInfo.email && (
                <p className="mb-2">
                  <i className="fas fa-envelope me-2" /><strong>Email:</strong>{' '}
                  <a href={`mailto:${property.contactInfo.email}`} className="ms-2">{property.contactInfo.email}</a>
                </p>
              )}
            </div>
            <button className="btn btn-primary btn-chat w-100" onClick={handleChat}>
              <i className="fas fa-comments me-2" aria-hidden />
              Chat with Owner/Agent
            </button>
          </div>
        )}
        {property.coordinates && (
          <div className="map-preview mb-3">
            <h6 className="mb-2">Location</h6>
            <PropertyMapPreview coordinates={property.coordinates} title={property.title} />
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="modal report-listing-modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-backdrop fade show" onClick={() => !reportLoading && setShowReportModal(false)} aria-hidden />
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Report this listing</h5>
                <button type="button" className="btn-close" onClick={() => !reportLoading && setShowReportModal(false)} aria-label="Close" />
              </div>
              {reportSubmitted ? (
                <div className="modal-body">
                  <p className="text-success mb-0">Report submitted. Thank you.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit}>
                  <div className="modal-body">
                    <p className="text-muted small mb-2">Help us understand the issue (optional).</p>
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      placeholder="e.g. Inappropriate content, misleading information..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      maxLength={2000}
                    />
                    {reportError && <p className="text-danger small mb-2">{reportError}</p>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowReportModal(false)} disabled={reportLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={reportLoading}>
                      {reportLoading ? 'Submitting...' : 'Submit report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
