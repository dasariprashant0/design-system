import {act, renderHook} from '@testing-library/react';
import {useMediaQuery} from './use-media-query';

type Listener = () => void;

/** A minimal matchMedia stand-in that lets a test flip the match and fire `change`. */
function stubMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  const list = {
    matches: initial,
    media: '',
    addEventListener: (_type: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_type: string, fn: Listener) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn(() => list) as unknown as typeof window.matchMedia;
  return {
    listeners,
    change(next: boolean) {
      list.matches = next;
      act(() => listeners.forEach((fn) => fn()));
    },
  };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('returns the match for the query', () => {
    stubMatchMedia(true);
    const {result} = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 600px)');
  });

  it('returns defaultValue when matchMedia is missing', () => {
    expect(renderHook(() => useMediaQuery('(min-width: 600px)')).result.current).toBe(false);
    expect(renderHook(() => useMediaQuery('(min-width: 600px)', true)).result.current).toBe(true);
  });

  it('follows changes and stops listening on unmount', () => {
    const media = stubMatchMedia(false);
    const {result, unmount} = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(false);
    media.change(true);
    expect(result.current).toBe(true);
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
