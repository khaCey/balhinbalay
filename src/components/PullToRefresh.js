import React, { useRef, useState, useCallback } from 'react';

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;
const MIN_PULL_TO_SHOW = 25;

/**
 * Wraps content and triggers onRefresh when user pulls down from the top.
 * Works with touch and mouse (for devtools). Uses the scroll container's scrollTop (parent of the wrap, e.g. .results-area) so pull only activates when the list is at the top. Small drags below MIN_PULL_TO_SHOW do not show the indicator.
 */
function PullToRefresh({ children, onRefresh, disabled }) {
  const containerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  const handleRefresh = useCallback(async () => {
    if (disabled || refreshing || !onRefresh) return;
    setRefreshing(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      setRefreshing(false);
      setPullY(0);
    }
  }, [disabled, refreshing, onRefresh]);

  const getScrollTop = useCallback(() => {
    return containerRef.current?.parentElement?.scrollTop ?? 0;
  }, []);

  const onTouchStart = useCallback(
    (e) => {
      if (disabled || refreshing) return;
      scrollTopRef.current = getScrollTop();
      startYRef.current = e.touches[0].clientY;
    },
    [disabled, refreshing, getScrollTop]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (disabled || refreshing) return;
      if (scrollTopRef.current > 2) return; // Only react when scroll container is at top
      const y = e.touches[0].clientY;
      const delta = y - startYRef.current;
      if (delta <= MIN_PULL_TO_SHOW) {
        setPullY(0);
      } else if (delta > 0) {
        setPullY(Math.min(delta, MAX_PULL));
      } else {
        setPullY(0);
      }
    },
    [disabled, refreshing]
  );

  const onTouchEnd = useCallback(() => {
    if (pullY >= PULL_THRESHOLD && onRefresh && !refreshing && !disabled) {
      handleRefresh();
    } else {
      setPullY(0);
    }
  }, [pullY, onRefresh, refreshing, disabled, handleRefresh]);

  const onPointerDown = useCallback(
    (e) => {
      if (disabled || refreshing || e.pointerType !== 'mouse') return;
      scrollTopRef.current = getScrollTop();
      startYRef.current = e.clientY;
    },
    [disabled, refreshing, getScrollTop]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (disabled || refreshing || e.pointerType !== 'mouse') return;
      if (scrollTopRef.current > 2) return;
      const delta = e.clientY - startYRef.current;
      if (delta <= MIN_PULL_TO_SHOW) setPullY(0);
      else if (delta > 0) setPullY(Math.min(delta, MAX_PULL));
      else setPullY(0);
    },
    [disabled, refreshing]
  );

  const onPointerUp = useCallback(() => {
    if (pullY >= PULL_THRESHOLD && onRefresh && !refreshing && !disabled) handleRefresh();
    else setPullY(0);
  }, [pullY, onRefresh, refreshing, disabled, handleRefresh]);

  const showIndicator = pullY > MIN_PULL_TO_SHOW || refreshing;
  const progress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="pull-to-refresh-wrap"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      {showIndicator && (
        <div
          className={`pull-to-refresh-indicator ${refreshing ? 'pull-to-refresh-indicator-active' : ''}`}
          aria-live="polite"
          aria-busy={refreshing}
          style={{
            opacity: refreshing ? 1 : progress,
            height: refreshing ? 48 : Math.min(pullY * 0.6, 48)
          }}
        >
          {refreshing ? (
            <i className="fas fa-spinner fa-spin pull-to-refresh-spinner" aria-hidden />
          ) : (
            <i className="fas fa-sync-alt" aria-hidden />
          )}
          <span className="pull-to-refresh-label">
            {refreshing ? 'Refreshing...' : pullY >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export default PullToRefresh;
