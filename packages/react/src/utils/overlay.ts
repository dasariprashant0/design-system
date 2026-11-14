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

/** Roving-list keys shared by Select and the menus. Returns the item to focus next (`undefined` if there is none),
 *  or `null` when the key is not a navigation key. Arrows stop at the ends; letters type ahead, repeating a letter
 *  cycles; a lone Space is not a navigation key. `typed` is per-list scratch state, `{text: '', at: 0}`. */
export function nextItem(key: string, plain: boolean, items: HTMLElement[], typed: {text: string; at: number}): HTMLElement | undefined | null {
  const at = items.indexOf(document.activeElement as HTMLElement);
  if (key === 'ArrowDown') return items[Math.min(at + 1, items.length - 1)];
  if (key === 'ArrowUp') return items[Math.max(at - 1, 0)];
  if (key === 'Home' || key === 'PageUp') return items[0];
  if (key === 'End' || key === 'PageDown') return items[items.length - 1];
  if (key.length !== 1 || !plain) return null;
  const now = Date.now(), ch = key.toLowerCase();
  if (ch === ' ' && now - typed.at > 500) return null;
  typed.text = now - typed.at > 500 ? ch : typed.text + ch; typed.at = now;
  const from = typed.text.length === 1 ? at + 1 : at;
  return [...items.slice(from), ...items.slice(0, from)].find((o) => o.textContent!.trim().toLowerCase().startsWith(typed.text));
}
