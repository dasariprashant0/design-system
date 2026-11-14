import type {Ref} from 'react';

/** Selector for elements a Tab key press can land on. */
export const TABBABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Calls an optional handler with a cancelable event dispatched on `on` (so `currentTarget` is that element) and
 *  reports whether it called `preventDefault()`. */
export const vetoed = (h?: (e: Event) => void, on: EventTarget = document) => {
  const e = new Event('x', {cancelable: true});
  if (h) { on.addEventListener('x', h, {once: true}); on.dispatchEvent(e); }
  return e.defaultPrevented;
};

/** Points every ref (callback or object) at the node. */
export const setRefs = <T,>(node: T | null, ...refs: Array<Ref<T> | undefined>) => {
  for (const r of refs) if (typeof r === 'function') r(node); else if (r) (r as {current: T | null}).current = node;
};
