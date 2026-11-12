'use client';
import {useEffect, useRef} from 'react';

/**
 * Calls `callback` every `delay` ms. Pass `null` to pause. The interval is cleared on unmount.
 * The latest callback is used, so it can read current state without restarting the timer.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
