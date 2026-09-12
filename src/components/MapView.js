import React, { useEffect, useRef, useState } from 'react';
import { buildMapPriceMarkerHtml } from './map/MapPriceMarker';

const MapView = ({
  properties,
  selectedCity,
  onPropertyClick,
  onSelectProperty,
  selectedPropertyId = '',
  initialViewport = null,
  onViewportChange
}) => {
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const markerByPropertyIdRef = useRef(new Map());
  const onPropertyClickRef = useRef(onPropertyClick);
  const onSelectPropertyRef = useRef(onSelectProperty);
  const selectedPropertyIdRef = useRef(selectedPropertyId);

  useEffect(() => {
    onPropertyClickRef.current = onPropertyClick;
  }, [onPropertyClick]);

  useEffect(() => {
    onSelectPropertyRef.current = onSelectProperty;
  }, [onSelectProperty]);

  useEffect(() => {
    selectedPropertyIdRef.current = selectedPropertyId;
  }, [selectedPropertyId]);

  useEffect(() => {
    let cancelled = false;

    function ensureLeaflet() {
      return new Promise((resolve, reject) => {
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
          script.onerror = () => reject(new Error('The map could not load. Check your connection or use list view.'));
          document.body.appendChild(script);
        } else {
          resolve();
        }
      });
    }

    function ensureMarkerCluster() {
      return new Promise((resolve, reject) => {
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
          script.onerror = () => reject(new Error('The map could not load. Check your connection or use list view.'));
          document.body.appendChild(script);
        } else {
          resolve();
        }
      });
    }

    function initializeMap() {
      if (cancelled || !window.L || !mapRef.current) return;

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
        } catch (_) {}
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (clusterGroupRef.current) {
        try {
          clusterGroupRef.current.clearLayers();
        } catch (_) {}
        clusterGroupRef.current = null;
      }

      const center = initialViewport?.center || selectedCity?.coordinates || { lat: 10.3157, lng: 123.8854 };
      const zoom = Number.isFinite(initialViewport?.zoom) ? initialViewport.zoom : 12;
      const map = window.L.map(mapRef.current, {
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false
      }).setView([center.lat, center.lng], zoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      const clusterGroup = window.L.markerClusterGroup({
        animate: false,
        animateAddingMarkers: false,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return window.L.divIcon({
            html: `<span class="map-price-marker">${count}</span>`,
            className: 'marker-cluster-pin-wrap',
            iconSize: [34, 24],
            iconAnchor: [17, 12]
          });
        }
      });
      clusterGroupRef.current = clusterGroup;
      markerByPropertyIdRef.current = new Map();
      const bounds = [];

      properties.forEach((property) => {
        if (!property.coordinates) return;
        bounds.push([property.coordinates.lat, property.coordinates.lng]);

        const markerIcon = window.L.divIcon({
          html: buildMapPriceMarkerHtml(property, property.id === selectedPropertyIdRef.current),
          className: 'map-price-marker-wrap',
          iconSize: [76, 24],
          iconAnchor: [38, 12]
        });
        const marker = window.L.marker([property.coordinates.lat, property.coordinates.lng], { icon: markerIcon, title: property.title || 'View property', alt: property.title || 'Property' });
        marker.on('click', () => {
          if (onSelectPropertyRef.current) onSelectPropertyRef.current(property);
          else onPropertyClickRef.current?.(properties.indexOf(property));
        });

        markerByPropertyIdRef.current.set(property.id, marker);
        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
      if (!initialViewport && bounds.length > 1) {
        map.fitBounds(bounds, { padding: [28, 28] });
      }

      map.on('moveend', () => {
        const c = map.getCenter();
        onViewportChange?.({
          center: { lat: c.lat, lng: c.lng },
          zoom: map.getZoom()
        });
      });
    }

    ensureLeaflet().then(ensureMarkerCluster).then(() => {
      if (cancelled) return;
      initializeMap();
    }).catch(error => { if (!cancelled) setError(error.message); });

    return () => {
      cancelled = true;
      const cg = clusterGroupRef.current;
      const map = mapInstanceRef.current;
      if (cg && map) {
        map.removeLayer(cg);
        cg.clearLayers();
      }
      clusterGroupRef.current = null;
      if (map) {
        try {
          map.stop();
          map.off();
        } catch (_) {}
        map.remove();
      }
      mapInstanceRef.current = null;
    };
  }, [properties, selectedCity, initialViewport, onViewportChange]);

  useEffect(() => {
    if (!window.L) return;
    markerByPropertyIdRef.current.forEach((marker, propertyId) => {
      const property = properties.find((item) => item.id === propertyId);
      if (!property) return;
      const icon = window.L.divIcon({
        html: buildMapPriceMarkerHtml(property, propertyId === selectedPropertyId),
        className: 'map-price-marker-wrap',
        iconSize: [76, 24],
        iconAnchor: [38, 12]
      });
      marker.setIcon(icon);
    });
  }, [selectedPropertyId, properties]);

  return (
    <div className="map-view-container">
      <div ref={mapRef} className="map-view" />
      {error && <p className="bb-map-error" role="alert">{error}</p>}
    </div>
  );
};

export default MapView;
