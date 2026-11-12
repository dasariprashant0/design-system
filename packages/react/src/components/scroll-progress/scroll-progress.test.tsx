import {act, render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {ScrollProgress} from './scroll-progress';

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
  it('has no axe violations', async () => {
    const {container} = render(<ScrollProgress label="Reading progress" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
