import {act, renderHook} from '@testing-library/react';
import {useInterval} from './use-interval';

describe('useInterval', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls back every delay ms', () => {
    const fn = vi.fn();
    renderHook(() => useInterval(fn, 100));
    act(() => vi.advanceTimersByTime(350));
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('pauses when the delay is null and resumes when it returns', () => {
    const fn = vi.fn();
    const {rerender} = renderHook(({delay}: {delay: number | null}) => useInterval(fn, delay), {
      initialProps: {delay: 100 as number | null},
    });
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
    rerender({delay: null});
    act(() => vi.advanceTimersByTime(1000));
    expect(fn).toHaveBeenCalledTimes(1);
    rerender({delay: 100});
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses the latest callback without restarting the timer', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {rerender} = renderHook(({fn}: {fn: () => void}) => useInterval(fn, 100), {initialProps: {fn: first}});
    act(() => vi.advanceTimersByTime(50));
    rerender({fn: second});
    act(() => vi.advanceTimersByTime(50));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('clears the timer on unmount', () => {
    const fn = vi.fn();
    const {unmount} = renderHook(() => useInterval(fn, 100));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(fn).not.toHaveBeenCalled();
  });
});
