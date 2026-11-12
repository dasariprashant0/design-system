import {act, renderHook} from '@testing-library/react';
import {useReducedMotion} from './use-reduced-motion';

describe('useReducedMotion', () => {
  afterEach(() => Reflect.deleteProperty(window, 'matchMedia'));

  it('is true when the user prefers reduced motion', () => {
    window.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    const {result} = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('is false when matchMedia is unavailable (server or old browser)', () => {
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false);
  });

  it('follows the preference when it changes', () => {
    let matches = false;
    const listeners = new Set<() => void>();
    window.matchMedia = vi.fn(() => ({
      get matches() {
        return matches;
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    })) as unknown as typeof window.matchMedia;
    const {result} = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    matches = true;
    act(() => listeners.forEach((fn) => fn()));
    expect(result.current).toBe(true);
  });
});
