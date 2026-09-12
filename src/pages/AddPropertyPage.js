import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../context/LoginModalContext';
import { useListings } from '../context/ListingsContext';
import AddPropertyForm from '../components/AddPropertyForm';
import PageHeader from '../components/PageHeader';

function AddPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();
  const { listings, loading } = useListings();

  const initialListing = id ? (listings || []).find((l) => l.id === id) : null;
  const isEdit = !!id;

  const handleBack = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate('/my-properties');
  };

  if (!user) {
    return (
      <div className="add-property-page page-with-header minimal-page">
        <PageHeader title={isEdit ? 'Edit property' : 'Add property'} onBack={() => navigate('/sale')} />
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

  if (isEdit && (loading || !initialListing || initialListing.ownerId !== user.id)) {
    return <div className="bb-empty"><h1>{loading ? 'Loading your listing…' : 'Listing unavailable'}</h1><p>{loading ? 'Please wait.' : 'This listing could not be opened for editing.'}</p></div>;
  }

  return (
    <div className="add-property-page page-with-header minimal-page">
      <PageHeader title={isEdit ? 'Edit property' : 'Add property'} onBack={handleBack} />
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
