import {act, renderHook} from '@testing-library/react';
import {useCounter} from './use-counter';

describe('useCounter', () => {
  it('increments, decrements and resets', () => {
    const {result} = renderHook(() => useCounter(5));
    act(() => result.current.increment());
    act(() => result.current.increment(3));
    expect(result.current.count).toBe(9);
    act(() => result.current.decrement(2));
    expect(result.current.count).toBe(7);
    act(() => result.current.reset());
    expect(result.current.count).toBe(5);
  });
  it('clamps to min and max, including the initial value', () => {
    const {result} = renderHook(() => useCounter(50, {min: 0, max: 10}));
    expect(result.current.count).toBe(10);
    act(() => result.current.decrement(100));
    expect(result.current.count).toBe(0);
    act(() => result.current.set(99));
    expect(result.current.count).toBe(10);
  });
});
