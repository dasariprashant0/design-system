import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Stepper} from './stepper';

const steps = [{title: 'Account'}, {title: 'Plan', description: 'Pick one'}, {title: 'Pay'}];

describe('Stepper', () => {
  it('renders an ordered list of steps', () => {
    render(<Stepper aria-label="Checkout" steps={steps} current={1} />);
    expect(screen.getByRole('list', {name: 'Checkout'})).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
  it('marks the current step and the done ones', () => {
    render(<Stepper steps={steps} current={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).toHaveAttribute('data-state', 'done');
    expect(items[0]).toHaveTextContent('(completed)');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Stepper aria-label="Checkout" steps={steps} current={1} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
