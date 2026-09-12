import React, { useState } from 'react';
import { getCityById } from '../data/cities';
import { api } from '../api/client';
import FavoritesButton from './FavoritesButton';
import PropertyMapPreview from './PropertyMapPreview';
import { trackEvent } from '../utils/analytics';
import PropertyGallery from './ui/PropertyGallery';
import PropertyCosts from './ui/PropertyCosts';
import BottomSheet from './ui/BottomSheet';
import { Icon } from './ui/Controls';

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
  onBack,
}) {
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  if (!property) return null;
  const city =
    getCityById(property.cityId)?.displayName ||
    property.city ||
    property.cityId;
  const location = [property.location, city].filter(Boolean).join(', ');
  const rent = property.listingType === 'rent';
  const owner = user && property.ownerId === user.id;
  const handleChat = () => {
    trackEvent('contact_agent', {
      property_id: property.id,
      listing_type: property.listingType,
      contact_method: 'chat',
      authenticated: !!user,
    });
    if (!user) onLoginForChat?.();
    else onOpenChat?.(property);
  };
  const share = async () => {
    const url = `${window.location.origin}/property/${property.id}`;
    trackEvent('share_property', {
      property_id: property.id,
      listing_type: property.listingType,
      share_method: navigator.share ? 'native' : 'clipboard',
    });
    try {
      if (navigator.share)
        await navigator.share({
          title: property.title,
          text: property.description,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setShareStatus('Link copied.');
      }
    } catch (error) {
      if (error.name !== 'AbortError')
        setShareStatus(
          'Unable to copy. You can share the address from your browser.',
        );
    }
  };
  const report = async (event) => {
    event.preventDefault();
    setReportLoading(true);
    setReportError('');
    try {
      await api.post(`/api/listings/${property.id}/report`, {
        reason: reportReason.trim() || undefined,
      });
      setReportSubmitted(true);
    } catch (error) {
      setReportError(
        error?.data?.error || error?.message || 'Failed to submit report.',
      );
    } finally {
      setReportLoading(false);
    }
  };
  const contact = (
    <>
      <div className="bb-contact-person">
        <span className="bb-avatar">
          <Icon name="user" />
        </span>
        <div>
          <h2>{property.contactInfo?.agentName || 'Owner / agent'}</h2>
          <small>Property contact</small>
        </div>
      </div>
      <p>Ask about availability, the space, or a good time to visit.</p>
      <button className="bb-button bb-full" type="button" onClick={handleChat}>
        Request a viewing
      </button>
      <button
        className="bb-button bb-secondary bb-full"
        type="button"
        onClick={handleChat}
      >
        <Icon name="message" />
        Message owner
      </button>
      <p className="bb-fine-print">
        Your enquiry stays linked to this property. Arrange viewing details in
        the conversation.
      </p>
      {property.contactInfo?.phone && (
        <a
          href={`tel:${property.contactInfo.phone}`}
          onClick={() =>
            trackEvent('contact_agent', {
              property_id: property.id,
              listing_type: property.listingType,
              contact_method: 'phone',
            })
          }
        >
          {property.contactInfo.phone}
        </a>
      )}
      {property.contactInfo?.email && (
        <a
          href={`mailto:${property.contactInfo.email}`}
          onClick={() =>
            trackEvent('contact_agent', {
              property_id: property.id,
              listing_type: property.listingType,
              contact_method: 'email',
            })
          }
        >
          {property.contactInfo.email}
        </a>
      )}
    </>
  );
  return (
    <div className="bb-detail">
      <div className="bb-detail-top">
        {showBackButton && onBack && (
          <button type="button" className="bb-text-button" onClick={onBack}>
            <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} />
            Back
          </button>
        )}
        {showCloseButton && (
          <button
            className="bb-icon-button"
            type="button"
            aria-label="Close property"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      <PropertyGallery
        key={property.id}
        title={property.title}
        images={Array.isArray(property.images) ? property.images : []}
      />
      <div className="bb-detail-layout">
        <div>
          <div className="bb-detail-tools">
            <span className="bb-badge">
              For {rent ? 'rent' : 'sale'} · {property.type}
            </span>
            <div>
              <FavoritesButton
                propertyId={property.id}
                className="bb-icon-button"
              />
              <button
                type="button"
                className="bb-icon-button"
                onClick={share}
                aria-label="Share property"
              >
                <Icon name="arrow" />
              </button>
            </div>
          </div>
          {shareStatus && (
            <p role="status" className="bb-muted">
              {shareStatus}
            </p>
          )}
          <div className="bb-detail-heading">
            <p className="bb-price">
              ₱{Number(property.price).toLocaleString()}
              {rent && <small> / month</small>}
            </p>
            <h1>{property.title}</h1>
            <p>
              <Icon name="pin" />
              {location}
            </p>
          </div>
          <div className="bb-detail-facts">
            {[
              ['bed', property.beds > 0 ? property.beds : 'Studio', 'Bedrooms'],
              ['bath', property.baths ?? '—', 'Bathrooms'],
              [
                'size',
                property.size ||
                  (property.sizeSqm ? `${property.sizeSqm} m²` : '—'),
                'Floor area',
              ],
              ['home', property.furnished || 'Not specified', 'Furnishing'],
            ].map(([icon, value, label]) => (
              <div key={label}>
                <Icon name={icon} />
                <strong>{value}</strong>
                <small>{label}</small>
              </div>
            ))}
          </div>
          {(property.sold ||
            property.currentlyRented ||
            property.status === 'pending' ||
            property.status === 'rejected') && (
            <p className="bb-notice">
              {property.sold
                ? 'Sold'
                : property.currentlyRented
                  ? 'Currently rented'
                  : property.status === 'pending'
                    ? 'Pending approval'
                    : 'Rejected'}
              {property.availableFrom &&
                ` · Next availability: ${property.availableFrom}`}
            </p>
          )}
          <section className="bb-detail-section">
            <h2>A little about this place</h2>
            <p className="bb-description">
              {property.description || 'No description provided.'}
            </p>
            {(property.floorLevel || property.buildingAge) && (
              <p>
                {property.floorLevel && `Floor ${property.floorLevel}. `}
                {property.buildingAge && `${property.buildingAge} years old.`}
              </p>
            )}
          </section>
          <PropertyCosts property={property} />
          {property.coordinates && (
            <section className="bb-detail-section">
              <h2>Get to know the neighbourhood</h2>
              <p>{location}</p>
              <div className="bb-property-map">
                <PropertyMapPreview
                  coordinates={property.coordinates}
                  title={property.title}
                />
              </div>
            </section>
          )}
          {property.contactInfo && (
            <section className="bb-panel bb-contact bb-contact-mobile">
              {contact}
            </section>
          )}
          <div className="bb-detail-tools">
            {owner ? (
              <>
                <button
                  className="bb-button bb-secondary"
                  type="button"
                  onClick={() => onEdit?.(property)}
                >
                  Edit listing
                </button>
                <button
                  className="bb-text-button bb-error"
                  type="button"
                  onClick={() => onDelete?.(property)}
                >
                  Unlist
                </button>
              </>
            ) : (
              <button
                className="bb-text-button"
                type="button"
                onClick={() => {
                  if (!user) {
                    onLoginForChat?.();
                    return;
                  }
                  setReportSubmitted(false);
                  setReportReason('');
                  setReportError('');
                  setShowReport(true);
                }}
              >
                Report listing
              </button>
            )}
          </div>
        </div>
        {property.contactInfo && (
          <aside className="bb-panel bb-contact bb-contact-desktop">
            {contact}
          </aside>
        )}
      </div>
      {property.contactInfo && (
        <div className="bb-contact-bar">
          <button
            className="bb-button bb-secondary"
            type="button"
            onClick={handleChat}
          >
            <Icon name="message" />
            Message
          </button>
          <button className="bb-button" type="button" onClick={handleChat}>
            Request viewing
          </button>
        </div>
      )}
      <BottomSheet
        open={showReport}
        title="Report this listing"
        onClose={() => {
          if (!reportLoading) setShowReport(false);
        }}
      >
        {reportSubmitted ? (
          <p role="status">Report submitted. Thank you.</p>
        ) : (
          <form onSubmit={report}>
            <label className="bb-field">
              Help us understand the issue (optional)
              <textarea
                className="form-control"
                rows="4"
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              />
            </label>
            {reportError && (
              <p role="alert" className="bb-error">
                {reportError}
              </p>
            )}
            <button className="bb-button bb-full" disabled={reportLoading}>
              {reportLoading ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        )}
      </BottomSheet>
    </div>
  );
}
