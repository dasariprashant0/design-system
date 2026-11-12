'use client';
import {useCallback, useEffect, useRef, useState} from 'react';

export type SetLocalStorageValue<T> = (next: T | ((prev: T) => T)) => void;

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * A JSON value in `localStorage`, shaped like `useState`.
 * - Server and first client render use `initialValue`; the stored value loads after mount (no hydration mismatch).
 * - Changes in other tabs arrive through the `storage` event.
 * - Storage can throw (private mode, quota, blocked): reads fall back to `initialValue`, writes still update state.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetLocalStorageValue<T>] {
  const initialRef = useRef(initialValue);
  const [value, setValue] = useState<T>(initialValue);

  // Load the stored value after mount.
  useEffect(() => {
    let next = initialRef.current;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) next = parse(raw, initialRef.current);
    } catch {
      // Storage unavailable: keep the initial value.
    }
    setValue(next);
  }, [key]);

  // Keep other tabs in sync. A null key means localStorage.clear() ran elsewhere.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return;
      if (event.key === null || event.newValue === null) {
        setValue(initialRef.current);
        return;
      }
      setValue(parse(event.newValue, initialRef.current));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const set = useCallback<SetLocalStorageValue<T>>(
    (next) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      setValue(resolved);
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Quota or blocked storage: the in-memory value still updates.
      }
    },
    [key, value],
  );

  return [value, set];
}
