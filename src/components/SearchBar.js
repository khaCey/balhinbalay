import React from 'react';

const SearchBar = ({ searchQuery, onSearchChange, onClear }) => {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-input-group">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search location, name, or keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="btn-clear-search"
            onClick={onClear}
            aria-label="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
