import React from 'react';
import { useAuth } from '../context/AuthContext';
import AddPropertyForm from './AddPropertyForm';

const AddPropertyModal = ({ show, onClose, initialListing, onOpenLogin }) => {
  const { user } = useAuth();

  if (!show) return null;

  if (!user) {
    return (
      <div className="modal auth-modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-backdrop fade show" onClick={onClose} aria-hidden />
        <div className="modal-dialog modal-dialog-scrollable add-property-modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add property</h5>
              <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
                <i className="fas fa-times" aria-hidden />
              </button>
            </div>
            <div className="modal-body text-center py-4">
              <p className="text-muted mb-3">Please log in to add a property.</p>
              {onOpenLogin && (
                <button type="button" className="btn btn-primary" onClick={() => { onClose(); onOpenLogin(); }}>
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEdit = !!initialListing;
  return (
    <div className="modal auth-modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-backdrop fade show" onClick={onClose} aria-hidden />
      <div className="modal-dialog modal-dialog-scrollable add-property-modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? 'Edit property' : 'Add property'}</h5>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
          <div className="modal-body">
            <AddPropertyForm initialListing={initialListing} onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;
