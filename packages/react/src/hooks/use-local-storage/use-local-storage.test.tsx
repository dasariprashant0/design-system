import {act, renderHook} from '@testing-library/react';
import {useLocalStorage} from './use-local-storage';

/** Node's experimental global localStorage can shadow jsdom's, so install a plain in-memory Storage. */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, String(value)),
    removeItem: (key: string) => void map.delete(key),
    key: (index: number) => [...map.keys()][index] ?? null,
  };
}

function fireStorage(key: string | null, newValue: string | null) {
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', {key, newValue}));
  });
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {value: memoryStorage(), configurable: true});
  });
  afterEach(() => vi.restoreAllMocks());

  it('uses initialValue when nothing is stored', () => {
    const {result} = renderHook(() => useLocalStorage('theme', 'warm'));
    expect(result.current[0]).toBe('warm');
  });

  it('loads a stored value after mount, parsing JSON', () => {
    window.localStorage.setItem('count', JSON.stringify({n: 4}));
    const {result} = renderHook(() => useLocalStorage('count', {n: 0}));
    expect(result.current[0]).toEqual({n: 4});
  });

  it('falls back to initialValue on invalid JSON', () => {
    window.localStorage.setItem('bad', '{nope');
    const {result} = renderHook(() => useLocalStorage('bad', 7));
    expect(result.current[0]).toBe(7);
  });

  it('writes JSON on set, and accepts an updater function', () => {
    const {result} = renderHook(() => useLocalStorage('n', 1));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(window.localStorage.getItem('n')).toBe('2');
    act(() => result.current[1]((prev) => prev + 5));
    expect(result.current[0]).toBe(7);
    expect(window.localStorage.getItem('n')).toBe('7');
  });

  it('syncs when another tab writes the same key', () => {
    const {result} = renderHook(() => useLocalStorage('n', 1));
    fireStorage('other', '99');
    expect(result.current[0]).toBe(1);
    fireStorage('n', JSON.stringify(42));
    expect(result.current[0]).toBe(42);
  });

  it('resets to initialValue when another tab removes the key or clears storage', () => {
    window.localStorage.setItem('n', '5');
    const {result} = renderHook(() => useLocalStorage('n', 1));
    expect(result.current[0]).toBe(5);
    fireStorage('n', null);
    expect(result.current[0]).toBe(1);
    fireStorage('n', JSON.stringify(9));
    fireStorage(null, null);
    expect(result.current[0]).toBe(1);
  });

  it('keeps working when storage throws', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const {result} = renderHook(() => useLocalStorage('n', 3));
    expect(result.current[0]).toBe(3);
    act(() => result.current[1](8));
    expect(result.current[0]).toBe(8);
  });

  it('stops listening on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const {unmount} = renderHook(() => useLocalStorage('n', 1));
    unmount();
    expect(remove).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
