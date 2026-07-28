import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { clampPriceRange, getPriceMinGap } from '../utils/priceSliderRange';

/** Size of the invisible hit area over each thumb (px); only these areas start a drag */
const THUMB_HIT_SIZE = 28;

function formatPrice(value, max) {
  if (value >= max) return 'Any';
  if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `₱${(value / 1e3).toFixed(0)}k`;
  return `₱${value.toLocaleString('en-PH')}`;
}

export default function PriceSlider({
  min = 0,
  max = 10000000,
  step = 100000,
  valueMin,
  valueMax,
  onChange,
  tickStep
}) {
  const railRef = useRef(null);
  const rangeRef = useRef(null);
  const overlayRef = useRef(null);
  const activeInputRef = useRef(null);
  const minGap = useMemo(() => getPriceMinGap(min, max, step), [min, max, step]);

  const { minVal, maxVal } = useMemo(
    () => clampPriceRange(valueMin, valueMax, min, max, step),
    [valueMin, valueMax, min, max, step]
  );

  const percent = useCallback(
    (val) => {
      const denom = max - min;
      if (denom <= 0) return 0;
      return ((val - min) / denom) * 100;
    },
    [min, max]
  );

  const updateRange = useCallback(() => {
    if (!rangeRef.current || !railRef.current) return;
    const minPct = percent(minVal);
    const maxPct = percent(maxVal);
    rangeRef.current.style.left = `${minPct}%`;
    rangeRef.current.style.width = `${maxPct - minPct}%`;
  }, [minVal, maxVal, percent]);

  useEffect(() => {
    updateRange();
  }, [updateRange]);

  /** If parent has equal or too-close min/max, push corrected pair up */
  useEffect(() => {
    if (valueMin == null || valueMax == null) return;
    const next = clampPriceRange(valueMin, valueMax, min, max, step);
    if (valueMin !== next.minVal || valueMax !== next.maxVal) {
      onChange(next.minVal, next.maxVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onChange may be unstable; only sync when value props change
  }, [valueMin, valueMax, min, max, step]);

  const handleMinChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;
    const safeStep = step > 0 ? step : 1;
    val = Math.max(min, Math.min(val, maxVal - minGap));
    const next = clampPriceRange(val, maxVal, min, max, safeStep);
    onChange(next.minVal, next.maxVal);
  };

  const handleMaxChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;
    const safeStep = step > 0 ? step : 1;
    val = Math.min(max, Math.max(val, minVal + minGap));
    const next = clampPriceRange(minVal, val, min, max, safeStep);
    onChange(next.minVal, next.maxVal);
  };

  const valueFromX = useCallback(
    (clientX) => {
      const el = railRef.current;
      if (!el) return minVal;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return minVal;
      const safeStep = step > 0 ? step : 1;
      const span = max - min;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + pct * span;
      const stepped = Math.round(raw / safeStep) * safeStep;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step, minVal]
  );

  const startDrag = useCallback(
    (which, clientX) => {
      activeInputRef.current = which;
      const val = valueFromX(clientX);
      const safeStep = step > 0 ? step : 1;
      if (which === 'min') {
        const newMin = Math.min(val, maxVal - minGap);
        const next = clampPriceRange(Math.max(min, newMin), maxVal, min, max, safeStep);
        onChange(next.minVal, next.maxVal);
      } else {
        const newMax = Math.max(val, minVal + minGap);
        const next = clampPriceRange(minVal, Math.min(max, newMax), min, max, safeStep);
        onChange(next.minVal, next.maxVal);
      }
    },
    [valueFromX, onChange, minVal, maxVal, min, max, step, minGap]
  );

  const handleThumbPointerDown = useCallback(
    (e, which) => {
      e.stopPropagation();
      startDrag(which, e.clientX);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [startDrag]
  );

  const handleThumbPointerMove = useCallback(
    (e) => {
      const which = activeInputRef.current;
      if (!which) return;
      const val = valueFromX(e.clientX);
      const safeStep = step > 0 ? step : 1;
      if (which === 'min') {
        const newMin = Math.min(val, maxVal - minGap);
        const next = clampPriceRange(Math.max(min, newMin), maxVal, min, max, safeStep);
        onChange(next.minVal, next.maxVal);
      } else {
        const newMax = Math.max(val, minVal + minGap);
        const next = clampPriceRange(minVal, Math.min(max, newMax), min, max, safeStep);
        onChange(next.minVal, next.maxVal);
      }
    },
    [valueFromX, onChange, minVal, maxVal, min, max, step, minGap]
  );

  const handleThumbPointerUpOrCancel = useCallback((e) => {
    if (activeInputRef.current) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      activeInputRef.current = null;
    }
  }, []);

  const ticks = [];
  const stepMark = (() => {
    const span = max - min;
    const safeStep = step > 0 ? step : 1;
    if (span <= 0) return safeStep;
    const raw = tickStep ?? Math.ceil(span / 4 / safeStep) * safeStep;
    return Math.max(safeStep, raw || safeStep);
  })();
  for (let v = min; v <= max; v += stepMark) {
    ticks.push(v);
  }
  if (ticks.length === 0 || ticks[ticks.length - 1] !== max) ticks.push(max);

  const minPct = percent(minVal);
  const maxPct = percent(maxVal);

  return (
    <div className="price-slider">
      <div
        className="price-bubble price-bubble-min"
        style={{ '--pct': minPct }}
      >
        {formatPrice(minVal, max)}
      </div>
      <div
        className="price-bubble price-bubble-max"
        style={{ '--pct': maxPct }}
      >
        {formatPrice(maxVal, max)}
      </div>
      <div className="price-slider-rail" ref={railRef}>
        <div className="price-slider-track" />
        <div className="price-slider-range" ref={rangeRef} />
        {ticks.map((v) => (
          <div
            key={v}
            className="price-slider-tick"
            style={{ left: `${percent(v)}%` }}
            aria-hidden
          />
        ))}
      </div>
      <div className="price-slider-thumb-hit-container" ref={overlayRef}>
        <div
          className="price-slider-thumb-hit price-slider-thumb-hit-min"
          style={{
            left: `calc(${minPct}% - ${THUMB_HIT_SIZE / 2}px)`,
            width: THUMB_HIT_SIZE,
            height: 'var(--price-handle-size)'
          }}
          onPointerDown={(e) => handleThumbPointerDown(e, 'min')}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerUpOrCancel}
          onPointerLeave={handleThumbPointerUpOrCancel}
          onPointerCancel={handleThumbPointerUpOrCancel}
        />
        <div
          className="price-slider-thumb-hit price-slider-thumb-hit-max"
          style={{
            left: `calc(${maxPct}% - ${THUMB_HIT_SIZE / 2}px)`,
            width: THUMB_HIT_SIZE,
            height: 'var(--price-handle-size)'
          }}
          onPointerDown={(e) => handleThumbPointerDown(e, 'max')}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerUpOrCancel}
          onPointerLeave={handleThumbPointerUpOrCancel}
          onPointerCancel={handleThumbPointerUpOrCancel}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="price-slider-input price-slider-input-min"
        aria-label="Minimum price"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="price-slider-input price-slider-input-max"
        aria-label="Maximum price"
      />
    </div>
  );
}
