'use client';
import {useEffect, useRef} from 'react';

/** `useWindowEvent('resize', () => ...)`. The latest handler is used without re-subscribing. */
export function useWindowEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void {
  const fn = useRef(listener);
  useEffect(() => { fn.current = listener; });
  useEffect(() => {
    const on = (e: WindowEventMap[K]) => fn.current(e);
    window.addEventListener(type, on, options);
    return () => window.removeEventListener(type, on, options);
  }, [type, options]);
}
