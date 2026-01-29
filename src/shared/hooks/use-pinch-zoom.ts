'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UsePinchZoomOptions {
  onZoomIn: () => void;
  onZoomOut: () => void;
  threshold?: number;
}

export function usePinchZoom<T extends HTMLElement = HTMLElement>({
  onZoomIn,
  onZoomOut,
  threshold = 50,
}: UsePinchZoomOptions) {
  const ref = useRef<T>(null);
  const initialDistance = useRef<number | null>(null);
  const lastZoomTime = useRef<number>(0);
  const accumulatedDelta = useRef<number>(0);

  const DEBOUNCE_MS = 300;
  const WHEEL_THRESHOLD = 30;

  const canZoom = useCallback(() => {
    const now = Date.now();
    if (now - lastZoomTime.current < DEBOUNCE_MS) return false;
    lastZoomTime.current = now;
    return true;
  }, []);

  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return null;
    const [t1, t2] = [touches[0], touches[1]];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance.current = getDistance(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || initialDistance.current === null) return;

      const currentDistance = getDistance(e.touches);
      if (currentDistance === null) return;

      const delta = currentDistance - initialDistance.current;

      if (Math.abs(delta) > threshold) {
        if (canZoom()) {
          if (delta > 0) {
            onZoomIn();
          } else {
            onZoomOut();
          }
        }
        initialDistance.current = currentDistance;
      }
    };

    const handleTouchEnd = () => {
      initialDistance.current = null;
    };

    // 트랙패드 핀치 (ctrl + wheel)
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;

      e.preventDefault();

      accumulatedDelta.current += e.deltaY;

      if (Math.abs(accumulatedDelta.current) > WHEEL_THRESHOLD) {
        if (canZoom()) {
          if (accumulatedDelta.current < 0) {
            onZoomIn();
          } else {
            onZoomOut();
          }
        }
        accumulatedDelta.current = 0;
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [onZoomIn, onZoomOut, threshold, canZoom, getDistance]);

  return ref;
}
