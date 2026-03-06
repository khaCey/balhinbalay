import React from 'react';

const SortBar = ({ sortBy, viewMode, onSortChange, onViewModeChange, totalResults, isMyProperties = false }) => {
  const resultsText = isMyProperties
    ? (totalResults === 1 ? 'of your property' : 'of your properties')
    : (totalResults === 1 ? 'property found' : 'properties found');
  return (
    <div className="sort-bar">
      <div className="sort-bar-left">
        <span className="results-count">
          <strong>{totalResults}</strong> {resultsText}
        </span>
      </div>
      <div className="sort-bar-right">
        <div className="view-mode-toggle">
          <button
            className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
          >
            <i className="fas fa-list"></i>
          </button>
          <button
            className={`btn-view-mode ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => onViewModeChange('map')}
            aria-label="Map view"
          >
            <i className="fas fa-map"></i>
          </button>
        </div>
        <select
          className="form-select sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="size-large">Size: Largest First</option>
          <option value="size-small">Size: Smallest First</option>
        </select>
      </div>
    </div>
  );
};

export default SortBar;
