import {act, renderHook} from '@testing-library/react';
import {useTimeout} from './use-timeout';

describe('useTimeout', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('runs the callback after the delay', () => {
    const fn = vi.fn();
    const {result} = renderHook(() => useTimeout(fn, 100));
    act(() => result.current.start());
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('restarts on a second start and can be cleared', () => {
    const fn = vi.fn();
    const {result} = renderHook(() => useTimeout(fn, 100));
    act(() => result.current.start());
    vi.advanceTimersByTime(60);
    act(() => result.current.start());
    vi.advanceTimersByTime(60);
    expect(fn).not.toHaveBeenCalled();
    act(() => result.current.clear());
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });
  it('is cleared on unmount and uses the latest callback', () => {
    const a = vi.fn(), b = vi.fn();
    const {result, rerender, unmount} = renderHook(({cb}) => useTimeout(cb, 100), {initialProps: {cb: a}});
    act(() => result.current.start());
    rerender({cb: b});
    vi.advanceTimersByTime(100);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    act(() => result.current.start());
    unmount();
    vi.advanceTimersByTime(500);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
