import {act, renderHook} from '@testing-library/react';
import {useDisclosure} from './use-disclosure';

describe('useDisclosure', () => {
  it('starts closed by default and honours initialOpen', () => {
    expect(renderHook(() => useDisclosure()).result.current.isOpen).toBe(false);
    expect(renderHook(() => useDisclosure({initialOpen: true})).result.current.isOpen).toBe(true);
  });

  it('opens, closes and toggles', () => {
    const {result} = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('calls callbacks only when the state really changes', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const {result} = renderHook(() => useDisclosure({onOpen, onClose}));
    act(() => result.current.close());
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      result.current.open();
      result.current.open();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
    act(() => result.current.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps its functions stable across renders', () => {
    const {result, rerender} = renderHook(() => useDisclosure());
    const first = result.current.open;
    rerender();
    expect(result.current.open).toBe(first);
    expect(result.current.toggle).toBe(result.current.toggle);
  });
});
