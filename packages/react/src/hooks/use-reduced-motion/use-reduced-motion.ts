'use client';
import {useMediaQuery} from '../use-media-query/use-media-query';

/** True when the user asks the system to reduce motion (`prefers-reduced-motion: reduce`). False on the server. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
