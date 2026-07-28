/**
 * Compact ₱ display for search criteria bar (aligned with PriceSlider rules).
 * @param {number} value
 * @param {number} sliderMax - treat values >= this as "Any"
 */
export function formatPriceCompact(value, sliderMax) {
  if (value >= sliderMax) return 'Any';
  if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `₱${(value / 1e3).toFixed(0)}k`;
  return `₱${value.toLocaleString('en-PH')}`;
}

/**
 * @param {number} min
 * @param {number} max
 * @param {'sale'|'rent'} listingType
 * @param {number} sliderMax
 */
export function formatSearchPriceRangeLine(min, max, listingType, sliderMax) {
  const left = formatPriceCompact(min, sliderMax);
  const right = formatPriceCompact(max, sliderMax);
  const range = `${left} – ${right}`;
  return listingType === 'rent' ? `${range} / mo` : range;
}
