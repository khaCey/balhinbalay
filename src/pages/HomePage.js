import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page home-page-landing">
      <div className="home-page-inner home-hero">
        <h1 className="home-hero-title">BalhinBalay</h1>
        <p className="home-hero-text">Find your place in the Philippines</p>
        <button
          type="button"
          className="btn btn-primary home-hero-cta"
          onClick={() => navigate('/search')}
        >
          Search properties
        </button>
      </div>
    </div>
  );
}
