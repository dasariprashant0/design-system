'use client';
import {useEffect, useState} from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** True when the user asked for less motion. Guarded: jsdom and old browsers have no matchMedia. Safe to call at event time. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(QUERY)?.matches;
}

/** Tracks `prefers-reduced-motion`. First render is `false` so server and client markup match. Shared by the effects components. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia?.(QUERY) : undefined;
    if (!mq) return;
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}
