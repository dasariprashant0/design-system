import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {RollingNumber} from './rolling-number';

describe('RollingNumber', () => {
  it('exposes the formatted final value as text', () => {
    render(<RollingNumber value={1234.5} locale="en-US" />);
    expect(screen.getByText('1,234.5', {selector: '.sr-only'})).toBeInTheDocument();
  });
  it('hides the rolling strip from assistive tech', () => {
    const {container} = render(<RollingNumber value={42} locale="en-US" />);
    expect(container.querySelector('.rolling-number-visual')).toHaveAttribute('aria-hidden', 'true');
  });
  it('points each digit column at its digit', () => {
    const {container} = render(<RollingNumber value={907} locale="en-US" />);
    const cols = [...container.querySelectorAll<HTMLElement>('.rolling-number-digit')].map((d) => d.style.getPropertyValue('--digit'));
    expect(cols).toEqual(['9', '0', '7']);
  });
  it('rolls: the same column element gets a new digit on change', () => {
    const {container, rerender} = render(<RollingNumber value={19} locale="en-US" />);
    const last = container.querySelectorAll('.rolling-number-digit')[1];
    rerender(<RollingNumber value={29} locale="en-US" />);
    expect(container.querySelectorAll('.rolling-number-digit')[1]).toBe(last);
    expect(container.querySelectorAll<HTMLElement>('.rolling-number-digit')[0]!.style.getPropertyValue('--digit')).toBe('2');
  });
  it('formats currency and keeps symbols as plain characters', () => {
    const {container} = render(<RollingNumber value={5} locale="en-US" format={{style: 'currency', currency: 'USD'}} />);
    expect(container.querySelector('.rolling-number-char')).toHaveTextContent('$');
  });
  it('forwards the ref and merges className', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<RollingNumber ref={ref} value={1} className="big" />);
    expect(ref.current).toHaveClass('rolling-number', 'big');
  });
  it('has no axe violations', async () => {
    const {container} = render(<RollingNumber value={1204} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
