import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '../utils/helpers';
import { getCityById } from '../data/cities';
import FavoritesButton from './FavoritesButton';

const FavoritesModal = ({ show, onClose, favoriteListings, onSelectProperty }) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="modal-backdrop favorites-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="favorites-modal-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Saved properties"
          >
        <div className="favorites-modal-handle" aria-hidden="true" />
        <div className="favorites-modal-header">
          <h2>Saved properties</h2>
          <button type="button" className="favorites-modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden></i>
          </button>
        </div>
        <div className="favorites-modal-body">
          {favoriteListings.length === 0 ? (
            <div className="favorites-modal-empty">
              <i className="fas fa-heart fa-3x text-muted mb-3" aria-hidden></i>
              <p className="mb-0">No saved properties yet.</p>
              <p className="text-muted small mb-0">Tap the heart on a listing to save it here.</p>
            </div>
          ) : (
            <ul className="favorites-modal-list">
              {favoriteListings.map((property, index) => (
                <li key={property.id || index} className="favorites-modal-item">
                  <div
                    role="button"
                    tabIndex={0}
                    className="favorites-modal-card"
                    onClick={() => {
                      onSelectProperty(property);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectProperty(property);
                        onClose();
                      }
                    }}
                  >
                    <div className="favorites-modal-card-img-wrap">
                      <img src={property.images?.[0]} alt={property.title} />
                    </div>
                    <div className="favorites-modal-card-fav" onClick={(e) => e.stopPropagation()}>
                      <FavoritesButton propertyId={property.id} />
                    </div>
                    <div className="favorites-modal-card-body">
                      <span className="badge bg-primary me-2">{property.type}</span>
                      <span className="badge bg-info me-2">{getCityById(property.cityId)?.displayName || property.city || property.cityId || '—'}</span>
                      <h5 className="favorites-modal-card-title">{property.title}</h5>
                      <p className="favorites-modal-card-price mb-0">{formatPrice(property)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FavoritesModal;
