import {fireEvent, render, screen} from '@testing-library/react';
import {useClickOutside} from './use-click-outside';

function Popover({onOutside, enabled = true}: {onOutside: () => void; enabled?: boolean}) {
  const ref = useClickOutside<HTMLDivElement>(onOutside, enabled);
  return (
    <div>
      <button>outside</button>
      <div ref={ref} data-testid="inside">
        <button>inside</button>
      </div>
    </div>
  );
}

describe('useClickOutside', () => {
  it('calls back for a pointer down outside the element', () => {
    const onOutside = vi.fn();
    render(<Popover onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByRole('button', {name: 'outside'}));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('ignores pointer down inside the element, including its children', () => {
    const onOutside = vi.fn();
    render(<Popover onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByTestId('inside'));
    fireEvent.pointerDown(screen.getByRole('button', {name: 'inside'}));
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const onOutside = vi.fn();
    render(<Popover onOutside={onOutside} enabled={false} />);
    fireEvent.pointerDown(screen.getByRole('button', {name: 'outside'}));
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('uses the latest callback without re-subscribing', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {rerender} = render(<Popover onOutside={first} />);
    rerender(<Popover onOutside={second} />);
    fireEvent.pointerDown(screen.getByRole('button', {name: 'outside'}));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops listening on unmount', () => {
    const onOutside = vi.fn();
    const {unmount} = render(<Popover onOutside={onOutside} />);
    const button = screen.getByRole('button', {name: 'outside'});
    unmount();
    fireEvent.pointerDown(button);
    expect(onOutside).not.toHaveBeenCalled();
  });
});
