import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useSliderDrag } from '../context/SliderDragContext';

const MIN_GAP_PERCENT = 0.05;
/** Size of the invisible hit area over each thumb (px); only these areas start a drag */
const THUMB_HIT_SIZE = 28;

function formatPrice(value, max) {
  if (value >= max) return 'Any';
  if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `₱${(value / 1e3).toFixed(0)}k`;
  return `₱${value.toLocaleString('en-PH')}`;
}

const sliderPointerHandlers = (setSliding) => ({
  onPointerDown: () => setSliding(true),
  onPointerUp: () => setSliding(false),
  onPointerLeave: () => setSliding(false),
  onPointerCancel: () => setSliding(false)
});

export default function PriceSlider({
  min = 0,
  max = 10000000,
  step = 100000,
  valueMin,
  valueMax,
  onChange,
  tickStep
}) {
  const { setSliding } = useSliderDrag();
  const pointerHandlers = useMemo(
    () => sliderPointerHandlers(setSliding),
    [setSliding]
  );
  const railRef = useRef(null);
  const rangeRef = useRef(null);
  const overlayRef = useRef(null);
  const activeInputRef = useRef(null);
  const minVal = Math.max(min, Math.min(valueMin ?? min, (valueMax ?? max) - step));
  const maxVal = Math.min(max, Math.max(valueMax ?? max, (valueMin ?? min) + step));

  const percent = useCallback(
    (val) => ((val - min) / (max - min)) * 100,
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

  const handleMinChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (val >= maxVal - (max - min) * MIN_GAP_PERCENT) val = maxVal - Math.ceil((max - min) * MIN_GAP_PERCENT / step) * step;
    val = Math.max(min, Math.min(val, max - step));
    onChange(val, maxVal);
  };

  const handleMaxChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (val <= minVal + (max - min) * MIN_GAP_PERCENT) val = minVal + Math.ceil((max - min) * MIN_GAP_PERCENT / step) * step;
    val = Math.min(max, Math.max(val, min + step));
    onChange(minVal, val);
  };

  const valueFromX = useCallback(
    (clientX) => {
      const el = railRef.current;
      if (!el) return minVal;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return minVal;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + pct * (max - min);
      const stepped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step, minVal]
  );

  const startDrag = useCallback(
    (which, clientX) => {
      activeInputRef.current = which;
      const val = valueFromX(clientX);
      if (which === 'min') {
        const newMin = Math.min(val, maxVal - Math.ceil((max - min) * MIN_GAP_PERCENT / step) * step);
        onChange(Math.max(min, newMin), maxVal);
      } else {
        const newMax = Math.max(val, minVal + Math.ceil((max - min) * MIN_GAP_PERCENT / step) * step);
        onChange(minVal, Math.min(max, newMax));
      }
    },
    [valueFromX, onChange, minVal, maxVal, min, max, step]
  );

  const handleThumbPointerDown = useCallback(
    (e, which) => {
      e.stopPropagation();
      setSliding(true);
      startDrag(which, e.clientX);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [startDrag, setSliding]
  );

  const handleThumbPointerMove = useCallback(
    (e) => {
      const which = activeInputRef.current;
      if (!which) return;
      const val = valueFromX(e.clientX);
      if (which === 'min') {
        const newMin = Math.min(val, maxVal - Math.ceil((max - min) * MIN_GAP_PERCENT / step) * step);
        onChange(Math.max(min, newMin), maxVal);
      } else {
        const newMax = Math.max(val, minVal + Math.ceil((max - min) * MIN_GAP_PERCENT / step) * step);
        onChange(minVal, Math.min(max, newMax));
      }
    },
    [valueFromX, onChange, minVal, maxVal, min, max, step]
  );

  const handleThumbPointerUpOrCancel = useCallback((e) => {
    if (activeInputRef.current) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      activeInputRef.current = null;
      setSliding(false);
    }
  }, [setSliding]);

  const ticks = [];
  const stepMark = tickStep ?? Math.ceil((max - min) / 4 / step) * step;
  for (let v = min; v <= max; v += stepMark) {
    ticks.push(v);
  }
  if (ticks[ticks.length - 1] !== max) ticks.push(max);

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
        {...pointerHandlers}
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
        {...pointerHandlers}
      />
    </div>
  );
}
