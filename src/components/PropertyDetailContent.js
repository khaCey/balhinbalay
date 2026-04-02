import React, { useState, useRef, useEffect } from 'react';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import { api } from '../api/client';
import FavoritesButton from './FavoritesButton';
import PropertyMapPreview from './PropertyMapPreview';

/**
 * Property listing detail — full-page route or overlay (PropertyModal).
 * Uses `pd-*` classes only (no Bootstrap modal-header/body) to avoid global `.modal` conflicts.
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
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState('');
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const touchStartX = useRef(null);

  const cityName = property ? (getCityById(property.cityId)?.displayName || property.city || property.cityId || '') : '';
  const locationLine = property ? [property.location, cityName].filter(Boolean).join(', ') || '—' : '—';

  useEffect(() => {
    setActiveIndex(0);
  }, [property?.id]);

  useEffect(() => {
    if (!toolbarMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setToolbarMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toolbarMenuOpen]);

  if (!property) return null;

  const isRent = property.listingType === 'rent';
  const moveInTotal = isRent
    ? [
        property.keyMoney || 0,
        property.securityDeposit || 0,
        property.advancePay || 0,
        property.brokerFee || 0,
        property.associationFee || 0,
        property.reservationFee || 0
      ].reduce((a, b) => a + b, 0)
    : 0;

  const images = Array.isArray(property.images) ? property.images : [];
  const hasManyImages = images.length > 1;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportLoading(true);
    try {
      await api.post(`/api/listings/${property.id}/report`, { reason: reportReason.trim() || undefined });
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReport(false);
        setReportReason('');
        setReportSubmitted(false);
      }, 1500);
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

  const goPrev = () => {
    if (!images.length) return;
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const goNext = () => {
    if (!images.length) return;
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const isOwner = user && property.ownerId === user.id;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: property.title,
          text: property.description,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      window.alert('Link copied to clipboard!');
    }
  };

  const onGalleryTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onGalleryTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > 56) goPrev();
    else if (dx < -56) goNext();
  };

  return (
    <div className="pd-shell">
      <header className="pd-toolbar">
        <div className="pd-toolbar-start">
          {showBackButton && onBack && (
            <button type="button" className="pd-toolbar-circle" onClick={onBack} aria-label="Back">
              <i className="fas fa-arrow-left" aria-hidden />
            </button>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="pd-toolbar-circle"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              aria-label="Close"
            >
              <i className="fas fa-times" aria-hidden />
            </button>
          )}
        </div>

        <div className="pd-toolbar-actions">
          <FavoritesButton propertyId={property.id} className="pd-toolbar-icon" />
          <button type="button" className="pd-toolbar-icon" onClick={handleShare} aria-label="Share listing">
            <i className="fas fa-share-alt" aria-hidden />
          </button>

          <div className={`pd-menu ${toolbarMenuOpen ? 'pd-menu--open' : ''}`}>
            <button
              type="button"
              className="pd-toolbar-icon"
              aria-expanded={toolbarMenuOpen}
              aria-haspopup="true"
              aria-label="More actions"
              onClick={() => setToolbarMenuOpen((v) => !v)}
            >
              <i className="fas fa-ellipsis-h" aria-hidden />
            </button>
            {toolbarMenuOpen && (
              <button type="button" className="pd-menu-dismiss" aria-label="Dismiss menu" onClick={() => setToolbarMenuOpen(false)} />
            )}
            {toolbarMenuOpen && (
              <ul className="pd-menu-list" role="menu">
                {isOwner && (
                  <>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="pd-menu-item"
                        onClick={() => {
                          setToolbarMenuOpen(false);
                          onEdit?.(property);
                        }}
                      >
                        <i className="fas fa-pen" aria-hidden /> Edit listing
                      </button>
                    </li>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="pd-menu-item pd-menu-item--danger"
                        onClick={() => {
                          setToolbarMenuOpen(false);
                          onDelete?.(property);
                        }}
                      >
                        <i className="fas fa-eye-slash" aria-hidden /> Unlist
                      </button>
                    </li>
                  </>
                )}
                {!isOwner && (
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="pd-menu-item"
                      onClick={() => {
                        setToolbarMenuOpen(false);
                        if (!user) {
                          onLoginForChat?.();
                          return;
                        }
                        setShowReport(true);
                        setReportError('');
                        setReportReason('');
                      }}
                    >
                      <i className="fas fa-flag" aria-hidden /> Report listing
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </header>

      <div className="pd-scroll">
        {images.length > 0 && (
          <div
            className="pd-hero"
            onTouchStart={onGalleryTouchStart}
            onTouchEnd={onGalleryTouchEnd}
            role="region"
            aria-roledescription="carousel"
            aria-label="Listing photos"
          >
            <div className="pd-gallery">
              {images.map((img, i) => (
                <div key={i} className={`pd-gallery-slide ${i === activeIndex ? 'pd-gallery-slide--active' : ''}`}>
                  <img src={img} alt="" className="pd-gallery-img" />
                </div>
              ))}
            </div>
            {hasManyImages && (
              <>
                <button type="button" className="pd-gallery-nav pd-gallery-nav--prev" onClick={goPrev} aria-label="Previous photo">
                  <span className="pd-gallery-nav-inner" aria-hidden />
                </button>
                <button type="button" className="pd-gallery-nav pd-gallery-nav--next" onClick={goNext} aria-label="Next photo">
                  <span className="pd-gallery-nav-inner" aria-hidden />
                </button>
                <div className="pd-gallery-dots" role="tablist" aria-label="Photo index">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === activeIndex}
                      className={`pd-gallery-dot ${i === activeIndex ? 'pd-gallery-dot--active' : ''}`}
                      aria-label={`Photo ${i + 1} of ${images.length}`}
                      onClick={() => setActiveIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="pd-inner">
          <div className="pd-title-row">
            <h1 className="pd-title">{property.title}</h1>
            <div className="pd-badges">
              {isOwner && property.status === 'pending' && (
                <span className="pd-badge pd-badge--warn">Pending</span>
              )}
              {isOwner && property.status === 'rejected' && (
                <span className="pd-badge pd-badge--bad">Rejected</span>
              )}
            </div>
          </div>

          <section className="pd-card" aria-label="Price and location">
            <div className="pd-card-row">
              <p className="pd-price">{formatPrice(property)}</p>
              {(property.sold || property.currentlyRented) && (
                <span className="pd-status-pill">{property.sold ? 'Sold' : 'Rented'}</span>
              )}
            </div>
            <p className="pd-location">
              <i className="fas fa-map-marker-alt" aria-hidden />
              {locationLine}
            </p>
            {isRent && (
              <div className="pd-fees">
                <h2 className="pd-fees-title">Move-in fees</h2>
                <ul className="pd-fees-rows">
                  <li><span>Key money</span><span>₱{(Number(property.keyMoney) || 0).toLocaleString()}</span></li>
                  <li><span>Security deposit</span><span>₱{(Number(property.securityDeposit) || 0).toLocaleString()}</span></li>
                  <li><span>Advance pay</span><span>₱{(Number(property.advancePay) || 0).toLocaleString()}</span></li>
                  <li><span>Broker fee</span><span>₱{(Number(property.brokerFee) || 0).toLocaleString()}</span></li>
                  <li><span>Association fee</span><span>₱{(Number(property.associationFee) || 0).toLocaleString()}</span></li>
                  <li><span>Reservation fee</span><span>₱{(Number(property.reservationFee) || 0).toLocaleString()}</span></li>
                  <li><span>Utilities</span><span>{property.utilitiesIncluded === true ? 'Included' : 'Separate'}</span></li>
                  <li><span>Other</span><span>{property.extraFees || '—'}</span></li>
                </ul>
                <p className="pd-fees-total">
                  Total move-in <strong>₱{moveInTotal.toLocaleString()}</strong>
                </p>
              </div>
            )}
          </section>

          <div className="pd-chips" aria-label="Property details">
            {property.beds > 0 && (
              <span className="pd-chip">
                <i className="fas fa-bed" aria-hidden />
                {property.beds} bed{property.beds !== 1 ? 's' : ''}
              </span>
            )}
            {property.baths > 0 && (
              <span className="pd-chip">
                <i className="fas fa-bath" aria-hidden />
                {property.baths} bath{property.baths !== 1 ? 's' : ''}
              </span>
            )}
            <span className="pd-chip">
              <i className="fas fa-ruler-combined" aria-hidden />
              {property.size}
            </span>
            <span className="pd-chip">
              <i className="fas fa-tag" aria-hidden />
              {property.type}
            </span>
            {property.furnished && (
              <span className="pd-chip">
                <i className="fas fa-couch" aria-hidden />
                {property.furnished}
              </span>
            )}
          </div>

          {property.listingType === 'rent' && property.currentlyRented && property.availableFrom && (
            <p className="pd-availability">
              <strong>Next availability</strong> {property.availableFrom}
            </p>
          )}

          <section className="pd-block" aria-labelledby="pd-desc">
            <h2 id="pd-desc" className="pd-block-title">
              About this place
            </h2>
            <p className="pd-desc">{property.description || 'No description available.'}</p>
          </section>

          {property.coordinates && (
            <section className="pd-block" aria-labelledby="pd-map">
              <h2 id="pd-map" className="pd-block-title">
                Location
              </h2>
              <div className="pd-map-frame">
                <PropertyMapPreview coordinates={property.coordinates} title={property.title} />
              </div>
            </section>
          )}

          {property.contactInfo && (
            <section className="pd-block pd-contact" aria-labelledby="pd-contact">
              <h2 id="pd-contact" className="pd-block-title">
                Contact
              </h2>
              <div className="pd-contact-lines">
                {property.contactInfo.agentName && (
                  <p className="pd-contact-line">
                    <i className="fas fa-user" aria-hidden />
                    <span>{property.contactInfo.agentName}</span>
                  </p>
                )}
                {property.contactInfo.phone && (
                  <p className="pd-contact-line">
                    <i className="fas fa-phone" aria-hidden />
                    <a href={`tel:${property.contactInfo.phone}`}>{property.contactInfo.phone}</a>
                  </p>
                )}
                {property.contactInfo.email && (
                  <p className="pd-contact-line">
                    <i className="fas fa-envelope" aria-hidden />
                    <a href={`mailto:${property.contactInfo.email}`}>{property.contactInfo.email}</a>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Space so fixed CTA + bottom nav do not cover last content */}
          <div className="pd-scroll-pad" aria-hidden />
        </div>
      </div>

      {property.contactInfo && (
        <div className="pd-cta-bar">
          <button type="button" className="pd-cta-primary" onClick={handleChat}>
            <i className="fas fa-comments" aria-hidden />
            Chat with owner / agent
          </button>
        </div>
      )}

      {showReport && (
        <div className="pd-report-root" role="dialog" aria-modal="true" aria-labelledby="pd-report-title">
          <button type="button" className="pd-report-backdrop" aria-label="Close" onClick={() => !reportLoading && setShowReport(false)} />
          <div className="pd-report-panel">
            <div className="pd-report-head">
              <h2 id="pd-report-title" className="pd-report-title">
                Report this listing
              </h2>
              <button type="button" className="pd-report-close" onClick={() => !reportLoading && setShowReport(false)} aria-label="Close">
                <i className="fas fa-times" aria-hidden />
              </button>
            </div>
            {reportSubmitted ? (
              <p className="pd-report-success">Report submitted. Thank you.</p>
            ) : (
              <form className="pd-report-form" onSubmit={handleReportSubmit}>
                <p className="pd-report-hint">Help us understand the issue (optional).</p>
                <textarea
                  className="pd-report-textarea"
                  rows={4}
                  placeholder="e.g. Inappropriate content, misleading information…"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  maxLength={2000}
                />
                {reportError && <p className="pd-report-error">{reportError}</p>}
                <div className="pd-report-actions">
                  <button type="button" className="pd-report-btn pd-report-btn--ghost" onClick={() => setShowReport(false)} disabled={reportLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="pd-report-btn pd-report-btn--danger" disabled={reportLoading}>
                    {reportLoading ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
