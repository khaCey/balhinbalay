import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Single toggle: sliding knob style. Left = For Rent, Right = For Sale.
 * Used in Quick Search (HomePage). Supports controlled (value/onChange) and
 * uncontrolled (URL-synced with navigate).
 */
export default function ListingTypeToggle({ className = '', value, onChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isControlled = value !== undefined && typeof onChange === 'function';
  const urlType = location.pathname === '/rent' ? 'rent' : 'sale';
  const listingType = isControlled ? value : urlType;
  const isSale = listingType === 'sale';

  const handleChange = (e) => {
    const next = e.target.checked ? 'sale' : 'rent';
    if (isControlled) {
      onChange(next);
    } else {
      navigate(next === 'rent' ? '/rent' : '/sale');
    }
  };

  return (
    <label
      className={`listing-type-toggle-wrap ${className}`.trim()}
      aria-label="Listing type: For Sale or For Rent"
    >
      <input
        type="checkbox"
        className="toggle-input"
        checked={isSale}
        onChange={handleChange}
        aria-hidden="true"
      />
      <div className="listing-type-toggle">
        <span className="listing-type-toggle-rent">For Rent</span>
        <span className="listing-type-toggle-sale">For Sale</span>
      </div>
    </label>
  );
}
