import {fireEvent, renderHook} from '@testing-library/react';
import {useWindowEvent} from './use-window-event';

describe('useWindowEvent', () => {
  it('calls the listener for the event', () => {
    const fn = vi.fn();
    renderHook(() => useWindowEvent('keydown', fn));
    fireEvent.keyDown(window, {key: 'a'});
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]![0].key).toBe('a');
  });
  it('removes the listener on unmount', () => {
    const fn = vi.fn();
    const {unmount} = renderHook(() => useWindowEvent('resize', fn));
    unmount();
    fireEvent(window, new Event('resize'));
    expect(fn).not.toHaveBeenCalled();
  });
  it('uses the latest listener', () => {
    const a = vi.fn(), b = vi.fn();
    const {rerender} = renderHook(({l}) => useWindowEvent('resize', l), {initialProps: {l: a}});
    rerender({l: b});
    fireEvent(window, new Event('resize'));
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
