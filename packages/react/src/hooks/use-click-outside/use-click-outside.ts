'use client';
import {useEffect, useRef} from 'react';

/**
 * Calls `onOutside` when a pointer goes down outside the element this ref is attached to.
 * Use it to close popovers and menus. Does nothing while the ref is unattached.
 * Content rendered in a portal is outside the ref's DOM subtree, so put the portal inside the ref or check it in `onOutside`.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  onOutside: (event: Event) => void,
  enabled = true,
) {
  const ref = useRef<T | null>(null);
  const callbackRef = useRef(onOutside);

  useEffect(() => {
    callbackRef.current = onOutside;
  });

  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (event: Event) => {
      const node = ref.current;
      if (!node) return;
      if (event.target instanceof Node && node.contains(event.target)) return;
      callbackRef.current(event);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [enabled]);

  return ref;
}
