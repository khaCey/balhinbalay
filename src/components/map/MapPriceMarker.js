export function getMapPriceLabel(property) {
  const amount = Number(property?.price) || 0;
  if (amount >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₱${Math.round(amount / 1000)}k`;
  return `₱${amount.toLocaleString()}`;
}

export function buildMapPriceMarkerHtml(property, isSelected = false) {
  const label = getMapPriceLabel(property);
  return `<span class="map-price-marker ${isSelected ? 'is-selected' : ''}">${label}</span>`;
}
