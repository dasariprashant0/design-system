'use client';
import {useCallback, useState} from 'react';

export interface UseCounterOptions {
  min?: number;
  max?: number;
}

const clamp = (n: number, min = -Infinity, max = Infinity) => Math.min(max, Math.max(min, n));

/** A bounded counter. Every change is clamped to `min` and `max`. */
export function useCounter(initial = 0, {min, max}: UseCounterOptions = {}) {
  const [count, setCount] = useState(() => clamp(initial, min, max));
  const set = useCallback((n: number) => setCount(clamp(n, min, max)), [min, max]);
  const increment = useCallback((by = 1) => setCount((c) => clamp(c + by, min, max)), [min, max]);
  const decrement = useCallback((by = 1) => setCount((c) => clamp(c - by, min, max)), [min, max]);
  const reset = useCallback(() => setCount(clamp(initial, min, max)), [initial, min, max]);
  return {count, set, increment, decrement, reset};
}
