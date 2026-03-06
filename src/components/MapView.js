import React, { useEffect, useRef } from 'react';
import { getCityById } from '../data/cities';

const MapView = ({ properties, selectedCity, onPropertyClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    function ensureLeaflet() {
      return new Promise((resolve) => {
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
          script.onload = () => resolve();
          document.body.appendChild(script);
        } else {
          resolve();
        }
      });
    }

    function ensureMarkerCluster() {
      return new Promise((resolve) => {
        if (window.L?.MarkerClusterGroup) {
          resolve();
          return;
        }
        if (!document.querySelector('link[href*="MarkerCluster"]')) {
          const link1 = document.createElement('link');
          link1.rel = 'stylesheet';
          link1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
          document.head.appendChild(link1);
          const link2 = document.createElement('link');
          link2.rel = 'stylesheet';
          link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
          document.head.appendChild(link2);
        }
        if (!window.L?.MarkerClusterGroup) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
          script.onload = () => resolve();
          document.body.appendChild(script);
        } else {
          resolve();
        }
      });
    }

    function initializeMap() {
      if (!window.L || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      if (clusterGroupRef.current) {
        clusterGroupRef.current = null;
      }

      const center = selectedCity?.coordinates || { lat: 10.3157, lng: 123.8854 };
      const map = window.L.map(mapRef.current).setView([center.lat, center.lng], 12);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      const clusterGroup = window.L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return window.L.divIcon({
            html: `<div class="marker-cluster-pin"><img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" alt="" /><span class="marker-cluster-pin-count">${count}</span></div>`,
            className: 'marker-cluster-pin-wrap',
            iconSize: [30, 41],
            iconAnchor: [15, 41]
          });
        }
      });
      clusterGroupRef.current = clusterGroup;

      properties.forEach((property) => {
        if (!property.coordinates) return;

        const cityName = getCityById(property.cityId)?.displayName || property.city || property.cityId || '';
        const locationLine = [property.location, cityName].filter(Boolean).join(', ') || '—';

        const marker = window.L.marker([property.coordinates.lat, property.coordinates.lng])
          .bindPopup(`
            <div style="min-width: 200px;">
              <h6 style="margin: 0 0 8px 0; font-weight: bold;">${property.title}</h6>
              <p style="margin: 0 0 4px 0; color: #F68048; font-weight: bold;">${property.price.toLocaleString()} ₱${property.listingType === 'rent' ? '/month' : ''}</p>
              <p style="margin: 0 0 8px 0; font-size: 0.9em; color: #666;">${locationLine}</p>
              <button onclick="window.mapPropertyClick('${property.id}')" style="width: 100%; padding: 6px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                View Details
              </button>
            </div>
          `);

        marker.on('click', () => {
          const index = properties.findIndex(p => p.id === property.id);
          if (index !== -1 && onPropertyClick) {
            onPropertyClick(index);
          }
        });

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
    }

    ensureLeaflet().then(ensureMarkerCluster).then(initializeMap);

    return () => {
      const cg = clusterGroupRef.current;
      const map = mapInstanceRef.current;
      if (cg && map) {
        map.removeLayer(cg);
        cg.clearLayers();
      }
      clusterGroupRef.current = null;
    };
  }, [properties, selectedCity, onPropertyClick]);

  // Expose click handler globally for popup buttons
  useEffect(() => {
    window.mapPropertyClick = (propertyId) => {
      const index = properties.findIndex(p => p.id === propertyId);
      if (index !== -1 && onPropertyClick) {
        onPropertyClick(index);
      }
    };
    return () => {
      delete window.mapPropertyClick;
    };
  }, [properties, onPropertyClick]);

  return (
    <div className="map-view-container">
      <div ref={mapRef} className="map-view" style={{ height: '600px', width: '100%', maxWidth: '100%', borderRadius: '10px' }}></div>
    </div>
  );
};

export default MapView;
