/** Must match PriceSlider MIN_GAP_PERCENT */
const MIN_GAP_PERCENT = 0.05;

/**
 * Clamp dual-handle price range so min/max are never equal and respect at least one step gap.
 * @param {number|null|undefined} valueMin
 * @param {number|null|undefined} valueMax
 * @param {number} min - slider bound
 * @param {number} max - slider bound
 * @param {number} step
 * @returns {{ minVal: number, maxVal: number }}
 */
export function clampPriceRange(valueMin, valueMax, min, max, step) {
  const safeStep = step > 0 ? step : 1;
  const span = max - min;
  if (span <= 0) {
    return { minVal: min, maxVal: Math.min(max, min + safeStep) };
  }
  const minGap = Math.min(
    Math.max(safeStep, Math.ceil((span * MIN_GAP_PERCENT) / safeStep) * safeStep),
    span
  );
  let a = valueMin != null ? valueMin : min;
  let b = valueMax != null ? valueMax : max;
  a = Math.max(min, Math.min(a, max));
  b = Math.min(max, Math.max(b, min));
  if (b - a < minGap) {
    const mid = (a + b) / 2;
    a = Math.round((mid - minGap / 2) / safeStep) * safeStep;
    b = a + minGap;
    if (a < min) {
      a = min;
      b = Math.min(max, a + minGap);
    }
    if (b > max) {
      b = max;
      a = Math.max(min, b - minGap);
    }
    if (b - a < minGap) {
      a = min;
      b = Math.min(max, min + minGap);
    }
  }
  return { minVal: a, maxVal: b };
}

export function getPriceMinGap(min, max, step) {
  const safeStep = step > 0 ? step : 1;
  const span = max - min;
  if (span <= 0) return safeStep;
  return Math.min(
    Math.max(safeStep, Math.ceil((span * MIN_GAP_PERCENT) / safeStep) * safeStep),
    span
  );
}
