import React, { useRef, useState } from 'react';
import BottomSheet from './BottomSheet';
import { Icon } from './Controls';

export default function PropertyGallery({ images = [], title }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const start = useRef(null);
  const move = (direction) =>
    setIndex((value) => (value + direction + images.length) % images.length);
  if (!images.length)
    return (
      <div className="bb-gallery bb-photo-empty">
        <Icon name="home" />
        Photos not provided
      </div>
    );
  const controls = (
    <div className="bb-gallery-controls">
      <span className="bb-badge">
        {index + 1} / {images.length} photos
      </span>
      {images.length > 1 && (
        <div>
          <button
            type="button"
            className="bb-icon-button"
            aria-label="Previous photo"
            onClick={() => move(-1)}
          >
            <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button
            type="button"
            className="bb-icon-button"
            aria-label="Next photo"
            onClick={() => move(1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
      )}
    </div>
  );
  return (
    <>
      <div
        className="bb-gallery"
        role="region"
        aria-label="Listing photos"
        onTouchStart={(event) => {
          start.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (
            start.current != null &&
            Math.abs(event.changedTouches[0].clientX - start.current) > 56
          )
            move(event.changedTouches[0].clientX > start.current ? -1 : 1);
          start.current = null;
        }}
      >
        <button
          type="button"
          aria-label="Open photo gallery"
          onClick={() => setExpanded(true)}
        >
          <img src={images[index]} alt={`${title}, view ${index + 1}`} />
        </button>
        {controls}
      </div>
      <BottomSheet
        open={expanded}
        title="Property photos"
        onClose={() => setExpanded(false)}
      >
        <img
          className="bb-gallery-expanded"
          src={images[index]}
          alt={`${title}, view ${index + 1}`}
        />
        <div className="bb-gallery-expanded-controls">{controls}</div>
      </BottomSheet>
    </>
  );
}
