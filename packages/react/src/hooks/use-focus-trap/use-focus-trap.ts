'use client';
import {useEffect, useRef} from 'react';

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Keeps Tab and Shift+Tab inside the element this ref is attached to while `active` is true.
 * Focus moves to the first focusable element on activation, and goes back to the element that
 * had focus before when the trap deactivates or unmounts.
 * Visibility is not checked (jsdom has no layout); hidden elements with `tabindex` are still reached.
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));

    if (!container.hasAttribute('tabindex')) container.tabIndex = -1;
    (items()[0] ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const list = items();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) {
        event.preventDefault();
        container.focus();
        return;
      }
      const current = document.activeElement;
      const inside = current instanceof Node && container.contains(current);
      if (event.shiftKey && (!inside || current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Focus that gets out by mouse or script comes back in.
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && container.contains(event.target)) return;
      (items()[0] ?? container).focus();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      if (previous?.isConnected) previous.focus();
    };
  }, [active]);

  return ref;
}
