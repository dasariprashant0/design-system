import {act, fireEvent, render, screen} from '@testing-library/react';
import {useFocusTrap} from './use-focus-trap';

function Dialog({active}: {active: boolean}) {
  const ref = useFocusTrap<HTMLDivElement>(active);
  return (
    <div ref={ref} role="dialog" aria-label="Test dialog">
      <button>First</button>
      <input aria-label="Name" />
      <button>Last</button>
    </div>
  );
}

function setup(active: boolean) {
  const outside = document.createElement('button');
  outside.textContent = 'Outside';
  document.body.appendChild(outside);
  const utils = render(<Dialog active={active} />);
  return {
    ...utils,
    outside,
    first: screen.getByRole('button', {name: 'First'}),
    last: screen.getByRole('button', {name: 'Last'}),
    cleanup: () => outside.remove(),
  };
}

describe('useFocusTrap', () => {
  it('moves focus to the first focusable element when activated', () => {
    const {first, cleanup} = setup(true);
    expect(first).toHaveFocus();
    cleanup();
  });

  it('wraps Tab from the last element to the first', () => {
    const {first, last, cleanup} = setup(true);
    act(() => last.focus());
    const notCancelled = fireEvent.keyDown(last, {key: 'Tab'});
    expect(notCancelled).toBe(false);
    expect(first).toHaveFocus();
    cleanup();
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    const {first, last, cleanup} = setup(true);
    fireEvent.keyDown(first, {key: 'Tab', shiftKey: true});
    expect(last).toHaveFocus();
    cleanup();
  });

  it('lets Tab move normally between inner elements', () => {
    const {cleanup} = setup(true);
    const input = screen.getByRole('textbox', {name: 'Name'});
    act(() => input.focus());
    expect(fireEvent.keyDown(input, {key: 'Tab'})).toBe(true);
    cleanup();
  });

  it('brings focus back in when it moves outside', () => {
    const {first, outside, cleanup} = setup(true);
    act(() => outside.focus());
    expect(first).toHaveFocus();
    cleanup();
  });

  it('is inactive when active is false', () => {
    const {outside, cleanup} = setup(false);
    act(() => outside.focus());
    expect(outside).toHaveFocus();
    cleanup();
  });

  it('restores focus to the previous element when deactivated', () => {
    const {outside, rerender, cleanup} = setup(false);
    act(() => outside.focus());
    rerender(<Dialog active />);
    expect(screen.getByRole('button', {name: 'First'})).toHaveFocus();
    rerender(<Dialog active={false} />);
    expect(outside).toHaveFocus();
    cleanup();
  });
});
