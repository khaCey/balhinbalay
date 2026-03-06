import React, { useEffect, useRef } from 'react';

const PropertyMapPreview = ({ coordinates, title }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!coordinates) return;

    function initMap() {
      if (!window.L || !mapRef.current) return;

      const { lat, lng } = coordinates;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Fix default marker icon when Leaflet is loaded via script
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      const map = window.L.map(mapRef.current).setView([lat, lng], 15);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      window.L.marker([lat, lng])
        .addTo(map)
        .bindPopup(title || 'Property location');

      mapInstanceRef.current = map;
    }

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        requestAnimationFrame(initMap);
      };
      document.body.appendChild(script);
    } else {
      requestAnimationFrame(initMap);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates, title]);

  if (!coordinates) return null;

  return (
    <div
      ref={mapRef}
      className="property-map-preview"
      style={{
        height: '220px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid #e0e0e0'
      }}
      aria-label="Property location map"
    />
  );
};

export default PropertyMapPreview;
