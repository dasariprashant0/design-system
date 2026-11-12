import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Marquee} from './marquee';

describe('Marquee', () => {
  it('renders the items once for assistive tech and a hidden copy', () => {
    const {container} = render(<Marquee><span>Acme</span></Marquee>);
    expect(screen.getAllByText('Acme')).toHaveLength(2);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
  it('sets the duration, direction and pause classes', () => {
    render(<Marquee data-testid="m" duration={12} reverse>x</Marquee>);
    const el = screen.getByTestId('m');
    expect(el.style.getPropertyValue('--marquee-duration')).toBe('12s');
    expect(el).toHaveClass('marquee-reverse', 'marquee-pause');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Marquee><span>Acme</span></Marquee>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
