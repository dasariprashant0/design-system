'use client';
import {useCallback, useEffect, useRef, type PointerEvent} from 'react';

export interface UseLongPressOptions {
  /** Hold time in milliseconds. Default 500. */
  delay?: number;
  /** Movement in pixels that cancels the press. Default 10. */
  tolerance?: number;
}

/** Returns pointer handlers to spread on an element: `<button {...useLongPress(fn)}>`. */
export function useLongPress(onLongPress: () => void, {delay = 500, tolerance = 10}: UseLongPressOptions = {}) {
  const fn = useRef(onLongPress);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const origin = useRef<{x: number; y: number} | null>(null);
  useEffect(() => { fn.current = onLongPress; });
  const cancel = useCallback(() => { clearTimeout(timer.current); origin.current = null; }, []);
  useEffect(() => cancel, [cancel]);
  return {
    onPointerDown: (e: PointerEvent) => {
      origin.current = {x: e.clientX, y: e.clientY};
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { origin.current = null; fn.current(); }, delay);
    },
    onPointerMove: (e: PointerEvent) => {
      const o = origin.current;
      if (o && Math.hypot(e.clientX - o.x, e.clientY - o.y) > tolerance) cancel();
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };
}
