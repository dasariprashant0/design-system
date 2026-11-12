'use client';
import {useCallback, useState} from 'react';

/** `const [on, toggle] = useToggle()` flips a boolean. Pass options to cycle: `useToggle(['light', 'dark'])`; `toggle('dark')` sets one. */
export function useToggle<T = boolean>(options: readonly [T, ...T[]] = [false, true] as unknown as readonly [T, ...T[]]): [T, (value?: T) => void] {
  const [index, setIndex] = useState(0);
  const toggle = useCallback((value?: T) => {
    setIndex((i) => {
      if (value !== undefined) { const at = options.indexOf(value); return at === -1 ? i : at; }
      return (i + 1) % options.length;
    });
    // options is expected to be a stable list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);
  return [options[index] as T, toggle];
}
