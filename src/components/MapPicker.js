import React, { useEffect, useRef } from 'react';

/**
 * Interactive map for picking property location. Click to place/move marker.
 * Center defaults to city coords; marker is draggable.
 */
const MapPicker = ({ center, markerPosition, onPick, height = 280 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    function ensureLeaflet() {
      return new Promise((resolve) => {
        if (window.L) {
          resolve();
          return;
        }
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
        if (window.L) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    }

    let mounted = true;

    ensureLeaflet().then(() => {
      if (!mounted || !window.L || !mapRef.current) return;

      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      const c = center || { lat: 10.3157, lng: 123.8854 };
      const map = window.L.map(mapRef.current).setView([c.lat, c.lng], 13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      const updateMarker = (lat, lng) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = window.L.marker([lat, lng], { draggable: true })
            .addTo(map)
            .on('dragend', (e) => {
              const pos = e.target.getLatLng();
              onPickRef.current?.({ lat: pos.lat, lng: pos.lng });
            });
          markerRef.current = marker;
        }
      };

      if (markerPosition && typeof markerPosition.lat === 'number' && typeof markerPosition.lng === 'number') {
        updateMarker(markerPosition.lat, markerPosition.lng);
        map.setView([markerPosition.lat, markerPosition.lng], 14);
      }

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        onPickRef.current?.({ lat, lng });
      });
    });

    return () => {
      mounted = false;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // markerPosition excluded: used only for initial marker; second effect handles later updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  useEffect(() => {
    if (!markerRef.current || !markerPosition) return;
    const { lat, lng } = markerPosition;
    if (typeof lat === 'number' && typeof lng === 'number') {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [markerPosition]);

  return (
    <div
      ref={mapRef}
      className="map-picker"
      style={{
        height: `${height}px`,
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid #e0e0e0',
        cursor: 'crosshair'
      }}
      aria-label="Click to set property location on map"
    />
  );
};

export default MapPicker;
