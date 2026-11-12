import {act, renderHook} from '@testing-library/react';
import {useClipboard} from './use-clipboard';

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
}

describe('useClipboard', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard');
    vi.useRealTimers();
  });

  it('copies text, sets copied, and clears it after the timeout', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(async () => {});
    stubClipboard(writeText);
    const {result} = renderHook(() => useClipboard({timeout: 1000}));

    let ok = false;
    await act(async () => {
      ok = await result.current.copy('hello');
    });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it('reports a failed write without throwing', async () => {
    stubClipboard(async () => {
      throw new Error('denied');
    });
    const {result} = renderHook(() => useClipboard());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('x');
    });
    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error?.message).toBe('denied');
  });

  it('reports when the Clipboard API is missing', async () => {
    const {result} = renderHook(() => useClipboard());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('x');
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('clears the pending timer on unmount', async () => {
    vi.useFakeTimers();
    stubClipboard(async () => {});
    const {result, unmount} = renderHook(() => useClipboard({timeout: 1000}));
    await act(async () => {
      await result.current.copy('x');
    });
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    unmount();
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });
});
