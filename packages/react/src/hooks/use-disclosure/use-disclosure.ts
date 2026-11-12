'use client';
import {useCallback, useRef, useState} from 'react';

export interface UseDisclosureOptions {
  /** Open on first render. Default `false`. */
  initialOpen?: boolean;
  /** Called when the state changes from closed to open. Not called on mount. */
  onOpen?: () => void;
  /** Called when the state changes from open to closed. Not called on mount. */
  onClose?: () => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Boolean open/closed state with stable `open`, `close` and `toggle` functions.
 * Callbacks fire only when the state actually changes.
 */
export function useDisclosure({initialOpen = false, onOpen, onClose}: UseDisclosureOptions = {}): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);
  // Mirrors the state so two calls in the same tick do not both fire callbacks.
  const latest = useRef({isOpen, onOpen, onClose});
  latest.current.onOpen = onOpen;
  latest.current.onClose = onClose;

  const set = useCallback((next: boolean) => {
    const cur = latest.current;
    if (cur.isOpen === next) return;
    cur.isOpen = next;
    setIsOpen(next);
    if (next) cur.onOpen?.();
    else cur.onClose?.();
  }, []);

  const open = useCallback(() => set(true), [set]);
  const close = useCallback(() => set(false), [set]);
  const toggle = useCallback(() => set(!latest.current.isOpen), [set]);

  return {isOpen, open, close, toggle};
}
