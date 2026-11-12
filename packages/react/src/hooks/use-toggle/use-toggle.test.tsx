import {act, renderHook} from '@testing-library/react';
import {useToggle} from './use-toggle';

describe('useToggle', () => {
  it('flips a boolean by default', () => {
    const {result} = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });
  it('cycles through options and wraps', () => {
    const opts = ['light', 'dark', 'midnight'] as const;
    const {result} = renderHook(() => useToggle(opts));
    act(() => result.current[1]());
    act(() => result.current[1]());
    expect(result.current[0]).toBe('midnight');
    act(() => result.current[1]());
    expect(result.current[0]).toBe('light');
  });
  it('sets a specific value and ignores unknown ones', () => {
    const opts = ['a', 'b', 'c'] as const;
    const {result} = renderHook(() => useToggle<string>(opts as unknown as readonly [string, ...string[]]));
    act(() => result.current[1]('c'));
    expect(result.current[0]).toBe('c');
    act(() => result.current[1]('zzz'));
    expect(result.current[0]).toBe('c');
  });
});
