import React from 'react';
import PropertyDetailContent from './PropertyDetailContent';

const PropertyModal = ({
  property,
  show,
  onHide,
  user,
  onOpenChat,
  onLoginForChat,
  onEdit,
  onDelete,
  asPage = false
}) => {
  if (!property) return null;

  const visible = show || asPage;
  if (!visible) return null;

  return (
    <div
      className={`modal fade property-detail-overlay-modal ${visible ? 'show' : ''} ${asPage ? 'property-modal-as-page' : ''}`}
      tabIndex="-1"
      aria-hidden={!visible}
    >
      {!asPage && show && (
        <div className="modal-backdrop fade show" onClick={onHide} aria-hidden />
      )}
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <PropertyDetailContent
            property={property}
            user={user}
            onClose={onHide}
            onOpenChat={onOpenChat}
            onLoginForChat={onLoginForChat}
            onEdit={onEdit}
            onDelete={onDelete}
            showCloseButton={!asPage}
            showBackButton={asPage}
            onBack={asPage ? onHide : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
