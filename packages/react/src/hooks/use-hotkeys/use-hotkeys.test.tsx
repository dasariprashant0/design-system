import {fireEvent, renderHook} from '@testing-library/react';
import {parseHotkey, useHotkeys} from './use-hotkeys';

// jsdom reports an empty platform, so `mod` maps to Ctrl in these tests.

describe('parseHotkey', () => {
  it('reads modifiers and aliases', () => {
    expect(parseHotkey('mod+k')).toMatchObject({key: 'k', mod: true, shift: false});
    expect(parseHotkey('Shift+Esc')).toMatchObject({key: 'escape', shift: true});
    expect(parseHotkey('alt+space')).toMatchObject({key: ' ', alt: true});
  });
});

describe('useHotkeys', () => {
  it('runs a matching shortcut and prevents the default action', () => {
    const onOpen = vi.fn();
    renderHook(() => useHotkeys({'mod+k': onOpen}));
    const notCancelled = fireEvent.keyDown(document.body, {key: 'k', ctrlKey: true});
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(notCancelled).toBe(false);
  });

  it('matches named keys and needs the exact modifiers', () => {
    const onEscape = vi.fn();
    const onSave = vi.fn();
    renderHook(() => useHotkeys({escape: onEscape, 'mod+s': onSave}));
    fireEvent.keyDown(document.body, {key: 'Escape'});
    expect(onEscape).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, {key: 's'});
    fireEvent.keyDown(document.body, {key: 's', ctrlKey: true, shiftKey: true});
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, {key: 's', ctrlKey: true});
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('distinguishes shift combinations for letters', () => {
    const onShift = vi.fn();
    renderHook(() => useHotkeys({'shift+a': onShift}));
    fireEvent.keyDown(document.body, {key: 'a'});
    expect(onShift).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, {key: 'A', shiftKey: true});
    expect(onShift).toHaveBeenCalledTimes(1);
  });

  it('ignores keys typed into fields unless allowInInputs is set', () => {
    const onKey = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);

    renderHook(() => useHotkeys({'/': onKey}));
    fireEvent.keyDown(input, {key: '/'});
    expect(onKey).not.toHaveBeenCalled();

    const {unmount} = renderHook(() => useHotkeys({'/': onKey}, {allowInInputs: true}));
    fireEvent.keyDown(input, {key: '/'});
    expect(onKey).toHaveBeenCalledTimes(1);
    unmount();
    input.remove();
  });

  it('does nothing when disabled and leaves the default alone when preventDefault is off', () => {
    const onKey = vi.fn();
    renderHook(() => useHotkeys({x: onKey}, {enabled: false}));
    fireEvent.keyDown(document.body, {key: 'x'});
    expect(onKey).not.toHaveBeenCalled();

    renderHook(() => useHotkeys({y: onKey}, {preventDefault: false}));
    expect(fireEvent.keyDown(document.body, {key: 'y'})).toBe(true);
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it('removes the listener on unmount', () => {
    const onKey = vi.fn();
    const {unmount} = renderHook(() => useHotkeys({z: onKey}));
    unmount();
    fireEvent.keyDown(document.body, {key: 'z'});
    expect(onKey).not.toHaveBeenCalled();
  });
});
