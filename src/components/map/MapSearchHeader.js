import React from 'react';

export default function MapSearchHeader({
  title = 'Search this area',
  onFilter
}) {
  return (
    <div className="map-search-header">
      <div className="map-search">
        <div className="search-bar map-search-searchbar" role="button" tabIndex={0}>
          <span className="map-search-search-glyph" aria-hidden>
            <i className="fas fa-search" />
          </span>
          <input value={title} readOnly aria-label="Search this area" />
        </div>
        <button type="button" className="icon-button map-search-filter-btn" onClick={onFilter} aria-label="Filter">
          <i className="fas fa-sliders-h" aria-hidden />
        </button>
      </div>
    </div>
  );
}
