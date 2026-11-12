'use client';
import {useCallback, useState} from 'react';

/** True for a DOM or React event, so `onClick={toggle}` flips instead of trying to set the event as a value. */
const isEvent = (v: unknown) => typeof v === 'object' && v !== null && ('nativeEvent' in v || (typeof Event !== 'undefined' && v instanceof Event));

/**
 * `const [on, toggle] = useToggle()` flips a boolean; `useToggle(true)` starts on.
 * Pass options to cycle: `useToggle(['light', 'dark'])`; `toggle('dark')` sets one.
 * `toggle` can be passed straight to `onClick`: an event argument is ignored.
 */
/** What a boolean `toggle` accepts: a value, or the event when it is used as a click handler. */
export type ToggleArg = boolean | Event | {nativeEvent: unknown};
/** Boolean form: `useToggle(true)` starts on; `toggle()` flips; `toggle(false)` sets. Returns `[value, toggle]`. */
export function useToggle(initial?: boolean): [boolean, (value?: ToggleArg) => void];
/** List form: cycles through `options`; `toggle(value)` jumps to one. Returns `[value, toggle]`. */
export function useToggle<T>(options: readonly [T, ...T[]]): [T, (value?: T) => void];
/** Implementation of both forms above. Renders the first option on the server. */
export function useToggle<T>(arg: boolean | readonly [T, ...T[]] = false): [T, (value?: T) => void] {
  const options = (typeof arg === 'boolean' ? (arg ? [true, false] : [false, true]) : arg) as readonly [T, ...T[]];
  const [index, setIndex] = useState(0);
  const toggle = useCallback((value?: T) => {
    setIndex((i) => {
      if (value !== undefined && !isEvent(value)) { const at = options.indexOf(value); return at === -1 ? i : at; }
      return (i + 1) % options.length;
    });
    // options is expected to be a stable list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);
  return [options[index] as T, toggle];
}
