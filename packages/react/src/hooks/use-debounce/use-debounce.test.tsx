import {act, renderHook} from '@testing-library/react';
import {useDebounce, useDebouncedCallback} from './use-debounce';

describe('useDebounce (value)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps the old value until it has settled for the delay', () => {
    const {result, rerender} = renderHook(({v}: {v: string}) => useDebounce(v, 300), {initialProps: {v: 'a'}});
    expect(result.current).toBe('a');
    rerender({v: 'ab'});
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('ab');
  });

  it('restarts the wait on every change', () => {
    const {result, rerender} = renderHook(({v}: {v: string}) => useDebounce(v, 300), {initialProps: {v: 'a'}});
    rerender({v: 'b'});
    act(() => vi.advanceTimersByTime(200));
    rerender({v: 'c'});
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs once, with the last arguments, after calls stop', () => {
    const fn = vi.fn();
    const {result} = renderHook(() => useDebouncedCallback(fn, 300));
    act(() => {
      result.current.call(1);
      result.current.call(2);
      result.current.call(3);
    });
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('cancel drops the pending call', () => {
    const fn = vi.fn();
    const {result} = renderHook(() => useDebouncedCallback(fn, 300));
    act(() => result.current.call('x'));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(1000));
    expect(fn).not.toHaveBeenCalled();
  });

  it('drops the pending call on unmount', () => {
    const fn = vi.fn();
    const {result, unmount} = renderHook(() => useDebouncedCallback(fn, 300));
    act(() => result.current.call('x'));
    unmount();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the latest fn passed in', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {result, rerender} = renderHook(({fn}: {fn: () => void}) => useDebouncedCallback(fn, 300), {
      initialProps: {fn: first},
    });
    act(() => result.current.call());
    rerender({fn: second});
    act(() => vi.advanceTimersByTime(300));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
