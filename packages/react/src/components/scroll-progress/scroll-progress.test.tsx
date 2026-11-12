import {act, render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {ScrollProgress} from './scroll-progress';
import {createRef} from 'react';

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', {value: y, configurable: true});
  act(() => { window.dispatchEvent(new Event('scroll')); });
}
beforeEach(() => {
  Object.defineProperty(document.documentElement, 'scrollHeight', {value: 2000, configurable: true});
  Object.defineProperty(window, 'innerHeight', {value: 1000, configurable: true});
  Object.defineProperty(window, 'scrollY', {value: 0, configurable: true});
});

describe('ScrollProgress', () => {
  it('is decorative by default', () => {
    const {container} = render(<ScrollProgress />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
  it('tracks the page scroll', () => {
    const {container} = render(<ScrollProgress />);
    scrollTo(500);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--scroll-progress')).toBe('0.5');
    scrollTo(1000);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--scroll-progress')).toBe('1');
  });
  it('becomes a named progressbar when given a label', () => {
    render(<ScrollProgress label="Reading progress" />);
    scrollTo(250);
    const bar = screen.getByRole('progressbar', {name: 'Reading progress'});
    expect(bar).toHaveAttribute('aria-valuenow', '25');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
  it('stays at zero when the page does not scroll', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {value: 1000, configurable: true});
    render(<ScrollProgress label="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
  it('starts at zero and clamps below 0 (overscroll) and above max', () => {
    const {container} = render(<ScrollProgress />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0');
    scrollTo(-300);
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0');
    scrollTo(99999);
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('1');
  });
  it('computes the value on mount when the page is already scrolled', () => {
    Object.defineProperty(window, 'scrollY', {value: 500, configurable: true});
    render(<ScrollProgress label="p" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });
  it('rounds the announced value to a whole percent', () => {
    render(<ScrollProgress label="p" />);
    scrollTo(333);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });
  it('recomputes on resize', () => {
    render(<ScrollProgress label="p" />);
    scrollTo(500);
    Object.defineProperty(window, 'innerHeight', {value: 500, configurable: true});
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });
  it('exposes aria-valuemin 0 and no progressbar semantics without a label', () => {
    const {container, rerender} = render(<ScrollProgress label="p" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    rerender(<ScrollProgress />);
    expect(container.firstElementChild).not.toHaveAttribute('role');
    expect(container.firstElementChild).not.toHaveAttribute('aria-valuenow');
  });
  it('removes its scroll and resize listeners on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const {unmount} = render(<ScrollProgress />);
    const added = add.mock.calls.filter(([t]) => t === 'scroll' || t === 'resize').map(([t, h]) => [t, h]);
    expect(added).toHaveLength(2);
    unmount();
    for (const [t, h] of added) expect(remove).toHaveBeenCalledWith(t, h);
    add.mockRestore(); remove.mockRestore();
  });
  it('merges className and caller style, forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ScrollProgress ref={ref} className="mine" style={{height: 5}} />);
    expect(ref.current).toHaveClass('scroll-progress', 'mine');
    expect(ref.current!.style.height).toBe('5px');
    expect(ref.current!.querySelector('.scroll-progress-bar')).not.toBeNull();
  });
  it('has no axe violations', async () => {
    const {container} = render(<ScrollProgress label="Reading progress" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
