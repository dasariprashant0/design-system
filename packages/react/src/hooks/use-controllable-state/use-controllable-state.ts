'use client';
import {useCallback, useState} from 'react';

export interface UseControllableStateOptions<T> {
  /** When defined, the hook is controlled and `value` wins. */
  value?: T;
  /** Starting value when uncontrolled. */
  defaultValue: T;
  /** Called with the new value when it differs from the current one. */
  onChange?: (value: T) => void;
}

/**
 * The `value` / `defaultValue` / `onValueChange` pattern for custom components.
 * Pass `value` to control it from outside; leave it out and the hook keeps its own state.
 * Monoline components use this so every controlled/uncontrolled pair behaves the same.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (Object.is(next, current)) return;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [current, isControlled, onChange],
  );

  return [current, setValue];
}
