import {fireEvent, render, screen} from '@testing-library/react';
import {useLongPress} from './use-long-press';

// jsdom has no PointerEvent, so clientX would be lost; MouseEvent carries the coordinates.
globalThis.PointerEvent ??= class extends MouseEvent {} as never;

function Probe({fn}: {fn: () => void}) {
  const handlers = useLongPress(fn, {delay: 300});
  return <button {...handlers}>hold</button>;
}

describe('useLongPress', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('fires after the delay', () => {
    const fn = vi.fn();
    render(<Probe fn={fn} />);
    fireEvent.pointerDown(screen.getByRole('button'), {clientX: 0, clientY: 0});
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('does not fire when released early', () => {
    const fn = vi.fn();
    render(<Probe fn={fn} />);
    const b = screen.getByRole('button');
    fireEvent.pointerDown(b);
    vi.advanceTimersByTime(100);
    fireEvent.pointerUp(b);
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });
  it('cancels when the pointer moves too far', () => {
    const fn = vi.fn();
    render(<Probe fn={fn} />);
    const b = screen.getByRole('button');
    fireEvent.pointerDown(b, {clientX: 0, clientY: 0});
    fireEvent.pointerMove(b, {clientX: 40, clientY: 0});
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });
});
