import {act, renderHook} from '@testing-library/react';
import {useHash} from './use-hash';

describe('useHash', () => {
  beforeEach(() => { window.location.hash = ''; });
  it('reads the current hash without the #', () => {
    window.location.hash = '#intro';
    const {result} = renderHook(() => useHash());
    expect(result.current[0]).toBe('intro');
  });
  it('updates when the hash changes and can set it', () => {
    const {result} = renderHook(() => useHash());
    act(() => { result.current[1]('usage'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(result.current[0]).toBe('usage');
    expect(window.location.hash).toBe('#usage');
  });
});
