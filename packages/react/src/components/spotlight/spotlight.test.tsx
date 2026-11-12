import {createRef} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Spotlight} from './spotlight';

describe('Spotlight', () => {
  it('renders its children in normal reading order', () => {
    render(<Spotlight><button>Act</button></Spotlight>);
    expect(screen.getByRole('button', {name: 'Act'})).toBeInTheDocument();
  });
  it('moves the glow with the pointer and still calls onPointerMove', () => {
    const onPointerMove = vi.fn();
    render(<Spotlight data-testid="s" onPointerMove={onPointerMove}>x</Spotlight>);
    const el = screen.getByTestId('s');
    el.getBoundingClientRect = () => ({left: 10, top: 20, right: 0, bottom: 0, width: 0, height: 0, x: 10, y: 20, toJSON() {}});
    fireEvent(el, new MouseEvent('pointermove', {bubbles: true, clientX: 60, clientY: 90})); // jsdom has no PointerEvent
    expect(el.style.getPropertyValue('--spotlight-x')).toBe('50px');
    expect(el.style.getPropertyValue('--spotlight-y')).toBe('70px');
    expect(onPointerMove).toHaveBeenCalledTimes(1);
  });
  it('sets the glow size', () => {
    render(<Spotlight data-testid="s" size={100}>x</Spotlight>);
    expect(screen.getByTestId('s').style.getPropertyValue('--spotlight-size')).toBe('100px');
  });
  it('merges className and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spotlight ref={ref} className="x">y</Spotlight>);
    expect(ref.current).toHaveClass('spotlight', 'x');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Spotlight><p>Content</p></Spotlight>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
