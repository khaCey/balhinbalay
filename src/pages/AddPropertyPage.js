import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useListings } from '../context/ListingsContext';
import AddPropertyForm from '../components/AddPropertyForm';

function AddPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();
  const { listings } = useListings();

  const initialListing = id ? (listings || []).find((l) => l.id === id) : null;
  const isEdit = !!id;

  const handleBack = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate('/sale');
  };

  if (!user) {
    return (
      <div className="add-property-page">
        <header className="page-header">
          <button type="button" className="page-header-back" onClick={() => navigate('/sale')} aria-label="Back">
            <i className="fas fa-arrow-left" aria-hidden />
          </button>
          <h1 className="page-header-title">{isEdit ? 'Edit property' : 'Add property'}</h1>
        </header>
        <main className="page-content">
          <div className="page-section page-section-gate">
            <p className="page-gate-text">Log in to add or edit a property.</p>
            <button type="button" className="btn btn-primary" onClick={openLogin}>
              Log in
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="add-property-page">
      <header className="page-header">
        <button type="button" className="page-header-back" onClick={handleBack} aria-label="Back">
          <i className="fas fa-arrow-left" aria-hidden />
        </button>
        <h1 className="page-header-title">{isEdit ? 'Edit property' : 'Add property'}</h1>
      </header>
      <main className="page-content">
        <div className="page-section add-property-page-form">
          <AddPropertyForm
            initialListing={initialListing}
            onSuccess={handleSuccess}
          />
        </div>
      </main>
    </div>
  );
}

export default AddPropertyPage;
