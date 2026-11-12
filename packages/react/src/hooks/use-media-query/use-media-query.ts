'use client';
import {useEffect, useState} from 'react';

/**
 * Whether a CSS media query matches, and keeps up with changes.
 * The first render (server and client) returns `defaultValue`, so markup
 * matches during hydration; the real value arrives after mount.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
}
