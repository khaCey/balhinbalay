import React, { useState } from 'react';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import FavoritesButton from './FavoritesButton';
import PropertyMapPreview from './PropertyMapPreview';

const PropertyModal = ({ property, show, onHide, user, onOpenChat, onLoginForChat, onEdit, onDelete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const cityName = property ? (getCityById(property.cityId)?.displayName || property.city || property.cityId || '') : '';
  const locationLine = property ? [property.location, cityName].filter(Boolean).join(', ') || '—' : '—';

  if (!property) return null;

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
      }).catch(err => console.log('Error sharing', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div 
      className={`modal fade ${show ? 'show' : ''}`} 
      style={{ display: show ? 'block' : 'none' }}
      tabIndex="-1"
      aria-hidden={!show}
    >
      {show && <div className="modal-backdrop fade show" onClick={onHide} aria-hidden />}
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
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
                    <i className="fas fa-pen me-1" aria-hidden></i>Edit
                  </button>
                  <button
                    type="button"
                    className="property-modal-header-btn property-modal-header-btn-delete"
                    onClick={() => onDelete?.(property)}
                    aria-label="Delete listing"
                  >
                    <i className="fas fa-trash me-1" aria-hidden></i>Delete
                  </button>
                </>
              )}
              <button
                type="button"
                className="property-modal-header-icon"
                onClick={handleShare}
                aria-label="Share property"
              >
                <i className="fas fa-share-alt"></i>
              </button>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onHide}
                aria-label="Close"
              >
                <i className="fas fa-times" aria-hidden></i>
              </button>
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
                )}
                {property.images.length > 1 && (
                  <>
                    <button 
                      className="carousel-control-prev" 
                      type="button" 
                      onClick={handlePrevious}
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button 
                      className="carousel-control-next" 
                      type="button" 
                      onClick={handleNext}
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="property-price mb-2">{formatPrice(property)}</p>
                <p className="text-muted mb-2">
                  <i className="fas fa-map-marker-alt me-2"></i>{locationLine}
                </p>
              </div>
            </div>
            <div className="property-features mb-3">
              {property.beds > 0 && <span><i className="fas fa-bed feature-icon me-1"></i>{property.beds} Beds</span>}
              {property.baths > 0 && <span><i className="fas fa-bath feature-icon me-1"></i>{property.baths} Baths</span>}
              <span><i className="fas fa-ruler-combined feature-icon me-1"></i>{property.size}</span>
              <span><i className="fas fa-tag feature-icon me-1"></i>{property.type}</span>
            </div>
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
                      <i className="fas fa-user me-2"></i>
                      <strong>Agent:</strong> {property.contactInfo.agentName}
                    </p>
                  )}
                  {property.contactInfo.phone && (
                    <p className="mb-2">
                      <i className="fas fa-phone me-2"></i>
                      <strong>Phone:</strong> 
                      <a href={`tel:${property.contactInfo.phone}`} className="ms-2">
                        {property.contactInfo.phone}
                      </a>
                    </p>
                  )}
                  {property.contactInfo.email && (
                    <p className="mb-2">
                      <i className="fas fa-envelope me-2"></i>
                      <strong>Email:</strong> 
                      <a href={`mailto:${property.contactInfo.email}`} className="ms-2">
                        {property.contactInfo.email}
                      </a>
                    </p>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-chat w-100"
                  onClick={handleChat}
                >
                  <i className="fas fa-comments me-2" aria-hidden></i>
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
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
