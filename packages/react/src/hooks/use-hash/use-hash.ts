'use client';
import {useCallback, useSyncExternalStore} from 'react';

const subscribe = (cb: () => void) => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); };

/** `const [hash, setHash] = useHash()`. The value has no leading "#". Empty string on the server. */
export function useHash(): [string, (hash: string) => void] {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => '');
  const set = useCallback((next: string) => { window.location.hash = next; }, []);
  return [hash, set];
}
