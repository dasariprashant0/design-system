// A small History API router. Paths: `/`, `/components/<name>`, `/hooks/<name>`, `/guides/<slug>`, all under
// the site base (`import.meta.env.BASE_URL`, set from DOCS_BASE). Plain `<a href>` links work: a click handler
// turns same-site clicks into pushState navigations, so content authors never need a Link component.
import {useSyncExternalStore} from 'react';
import {entryAt, legacyPath, type Entry} from './registry';

export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Full href for a route path: `href('components/button#usage')` gives `/design-system/components/button#usage`. */
export const href = (path = '') => BASE + path.replace(/^\//, '');

/** The route path of a pathname: strips the base and trailing slash. `/` gives ''. */
export const routeOf = (pathname: string) => {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '');
  return rest.replace(/\/$/, '');
};

export type Route = {kind: 'home'} | {kind: 'page'; entry: Entry} | {kind: 'missing'; path: string};

export const resolve = (pathname: string): Route => {
  const path = routeOf(pathname);
  if (!path) return {kind: 'home'};
  const entry = entryAt(path);
  return entry ? {kind: 'page', entry} : {kind: 'missing', path};
};

const listeners = new Set<() => void>();
let navCount = 0;
const emit = () => { navCount++; listeners.forEach((l) => l()); };
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  addEventListener('popstate', cb);
  return () => { listeners.delete(cb); removeEventListener('popstate', cb); };
};

/** Current pathname; re-renders on navigation and Back/Forward. */
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => BASE);
/** Counts every navigation, including ones to the same path, so effects can react to a repeat click. */
export const useNavCount = () => useSyncExternalStore(subscribe, () => navCount, () => 0);

export function navigate(to: string, replace = false) {
  history[replace ? 'replaceState' : 'pushState'](null, '', to);
  emit();
}

/** An old-style hash that names a page, unless an element on this page has that id (then it is an in-page anchor). */
const legacy = (hash: string) => (hash && !document.getElementById(decodeURIComponent(hash.slice(1))) ? legacyPath(hash) : undefined);

/** Turn an old `#button` or `#guides/forms` hash into a real path. Returns true if it redirected. */
export function upgradeLegacyHash(): boolean {
  const p = legacy(location.hash);
  if (!p) return false;
  navigate(href(p), true);
  return true;
}

/** Install once: same-site link clicks navigate without a reload; old hash links are upgraded. */
export function installLinks() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.origin !== location.origin) return;
    if (a.getAttribute('href')!.startsWith('#')) { // old hash link or in-page anchor
      const p = legacy(a.hash);
      if (!p) return;
      e.preventDefault(); navigate(href(p)); return;
    }
    if (!a.pathname.startsWith(BASE) || /\.\w+$/.test(a.pathname)) return; // other site, or a file such as llms.txt
    if (a.pathname === location.pathname && a.hash) return; // same page anchor: the browser scrolls
    e.preventDefault();
    navigate(a.pathname + a.search + a.hash);
  };
  const onHash = () => { upgradeLegacyHash(); };
  document.addEventListener('click', onClick);
  addEventListener('hashchange', onHash);
  upgradeLegacyHash();
}
