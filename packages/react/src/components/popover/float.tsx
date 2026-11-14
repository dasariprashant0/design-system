'use client';
import {createPortal} from 'react-dom';
import {forwardRef, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type HTMLAttributes, type RefObject} from 'react';
import {setRefs} from '../../utils/overlay';

/* Shared floating layer for Popover, Tooltip, HoverCard, Select and the menus: one positioning function (side,
   align, offsets, flip, shift, available height) and one dismiss stack (Escape, outside press, focus leaving).
   No floating-ui, no scroll lock. */

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';
export interface Placement {
  /** Preferred side of the anchor. Flips to the opposite side when it does not fit. Default `bottom`. */
  side?: Side;
  /** Alignment along the anchor's edge. `start` and `end` follow the reading direction. Default `center`. */
  align?: Align;
  /** Gap in px between the anchor and the panel. */
  sideOffset?: number;
  /** Shift in px along the anchor's edge. */
  alignOffset?: number;
  /** Minimum gap in px kept to the viewport edges. Default 8. */
  collisionPadding?: number;
}

const OPPOSITE = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'} as const;

/** Positions a `position: fixed` panel against an anchor. Sets `left`/`top`, `data-side`, `data-align` and the
 *  `--anchor-width` and `--available-height` custom properties. Call again on resize and scroll. */
export function place(anchor: Element, panel: HTMLElement, {side = 'bottom', align = 'center', sideOffset = 0, alignOffset = 0, collisionPadding: pad = 8}: Placement) {
  const a = anchor.getBoundingClientRect(), root = document.documentElement, vw = root.clientWidth, vh = root.clientHeight;
  const rtl = getComputedStyle(anchor).direction === 'rtl';
  panel.style.left = panel.style.top = '0px'; // measure at the origin so the viewport edge cannot squeeze it
  const {width: w, height: h} = panel.getBoundingClientRect();
  const room = {top: a.top, bottom: vh - a.bottom, left: a.left, right: vw - a.right};
  const vertical = side === 'top' || side === 'bottom';
  if (room[side] - pad < (vertical ? h : w) + sideOffset && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];
  const along = (lo: number, size: number, panelSize: number, flip: boolean) => align === 'center' ? lo + (size - panelSize) / 2 : (align === 'start') !== flip ? lo : lo + size - panelSize;
  let x: number, y: number;
  if (vertical) { y = side === 'top' ? a.top - h - sideOffset : a.bottom + sideOffset; x = along(a.left, a.width, w, rtl) + (rtl ? -alignOffset : alignOffset); }
  else { x = side === 'left' ? a.left - w - sideOffset : a.right + sideOffset; y = along(a.top, a.height, h, false) + alignOffset; }
  x = Math.max(pad, Math.min(x, vw - w - pad)); y = Math.max(pad, Math.min(y, vh - h - pad));
  const s = panel.style;
  s.left = x + 'px'; s.top = y + 'px';
  s.setProperty('--anchor-width', a.width + 'px');
  s.setProperty('--available-height', Math.max(0, vertical ? room[side] - sideOffset - pad : vh - 2 * pad) + 'px');
  panel.dataset.side = side; panel.dataset.align = align;
}

const noop = () => () => {};
const useLayout = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export interface FloatingProps extends HTMLAttributes<HTMLDivElement>, Placement {
  /** Returns the element to position against, read when it opens and on every reposition. */
  anchor: () => Element | null;
}

/** A fixed-position panel placed against an anchor. Rendered into the nearest open `<dialog>` (so it stays usable
 *  inside a modal) or `document.body`. Repositions on resize, scroll and size changes. */
export const Floating = forwardRef<HTMLDivElement, FloatingProps>(function Floating({anchor, side, align, sideOffset, alignOffset, collisionPadding, style, ...rest}, forwarded) {
  const el = useRef<HTMLDivElement | null>(null);
  // false while hydrating (matches the server's empty output), true on every later render
  const ready = useSyncExternalStore(noop, () => true, () => false);
  useLayout(() => {
    const p = el.current; if (!p) return;
    const go = () => { const a = anchor(); if (a) place(a, p, {side, align, sideOffset, alignOffset, collisionPadding}); };
    go();
    addEventListener('resize', go); addEventListener('scroll', go, true);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(go);
    ro?.observe(p);
    return () => { removeEventListener('resize', go); removeEventListener('scroll', go, true); ro?.disconnect(); };
  }, [ready, side, align, sideOffset, alignOffset, collisionPadding]);
  if (!ready || typeof document === 'undefined') return null;
  return createPortal(<div ref={(n) => setRefs(n, el, forwarded)} style={{position: 'fixed', ...style}} {...rest} />, anchor()?.closest('dialog[open]') ?? document.body);
});

const layers: object[] = [];

/** While `open`, calls `dismiss` for Escape, a press outside every ref, or focus moving outside. Only the topmost
 *  layer reacts, so a menu inside a popover closes first. */
export function useDismiss(open: boolean, inside: Array<RefObject<Element | null>>, dismiss: (kind: 'escape' | 'outside', e: Event) => void) {
  const latest = useRef({inside, dismiss});
  latest.current = {inside, dismiss};
  useEffect(() => {
    if (!open) return;
    const me = {}; layers.push(me);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && layers[layers.length - 1] === me) { e.preventDefault(); latest.current.dismiss('escape', e); } };
    const out = (e: Event) => { if (layers[layers.length - 1] === me && !latest.current.inside.some((r) => r.current?.contains(e.target as Node))) latest.current.dismiss('outside', e); };
    document.addEventListener('keydown', key, true); document.addEventListener('pointerdown', out, true); document.addEventListener('focusin', out, true);
    return () => { document.removeEventListener('keydown', key, true); document.removeEventListener('pointerdown', out, true); document.removeEventListener('focusin', out, true); layers.splice(layers.indexOf(me), 1); };
  }, [open]);
}

/** Hover-intent timing for Tooltip and HoverCard: `show` and `hide` take effect after a delay (ms) unless the pointer
 *  comes back first. */
export function useHoverIntent(setOpen: (o: boolean) => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (open: boolean, delay = 0) => { clearTimeout(timer.current); if (delay) timer.current = setTimeout(() => setOpen(open), delay); else setOpen(open); };
}
