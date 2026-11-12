'use client';
import {useCallback, useEffect, useRef, useState} from 'react';

/** A copy of `value` that only updates after it has stopped changing for `delay` ms. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export interface UseDebouncedCallbackReturn<A extends unknown[]> {
  /** Schedules `fn` to run `delay` ms after the last call. */
  call: (...args: A) => void;
  /** Drops the pending call, if any. */
  cancel: () => void;
}

/**
 * Debounced function: `call` runs `fn` only after `delay` ms with no new calls.
 * `fn` is read at call time, so it can close over fresh props without re-creating `call`.
 * A pending call is dropped on unmount.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 300,
): UseDebouncedCallbackReturn<A> {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cancel = useCallback(() => clearTimeout(timer.current), []);

  const call = useCallback(
    (...args: A) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );

  return {call, cancel};
}
