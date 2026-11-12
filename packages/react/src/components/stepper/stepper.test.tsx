import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Stepper} from './stepper';
import {createRef} from 'react';

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
  it('first step current: nothing done, the rest todo', () => {
    const {container} = render(<Stepper steps={steps} current={0} />);
    const lis = container.querySelectorAll('li');
    expect(lis[0]).toHaveAttribute('aria-current', 'step');
    expect(container.querySelectorAll('[data-state="done"]')).toHaveLength(0);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
    expect(container.querySelectorAll('.sr-only')).toHaveLength(0);
  });
  it('middle step: earlier done (with a completed hint), later todo', () => {
    const {container} = render(<Stepper steps={steps} current={1} />);
    const lis = container.querySelectorAll('li');
    expect(lis[0]).toHaveAttribute('data-state', 'done');
    expect(lis[0]).toHaveTextContent('Account (completed)');
    expect(lis[1]).toHaveAttribute('aria-current', 'step');
    expect(lis[2]).not.toHaveAttribute('data-state');
    expect(lis[2]).not.toHaveAttribute('aria-current');
  });
  it('last step current marks all earlier steps done', () => {
    const {container} = render(<Stepper steps={steps} current={2} />);
    expect(container.querySelectorAll('[data-state="done"]')).toHaveLength(2);
  });
  it('current past the end marks everything done with none current', () => {
    const {container} = render(<Stepper steps={steps} current={3} />);
    expect(container.querySelectorAll('[data-state="done"]')).toHaveLength(3);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
  });
  it('a negative current leaves everything todo', () => {
    const {container} = render(<Stepper steps={steps} current={-1} />);
    expect(container.querySelectorAll('[data-state="done"], [aria-current]')).toHaveLength(0);
  });
  it('renders descriptions only when given and keeps them after the title', () => {
    const {container} = render(<Stepper steps={steps} current={0} />);
    expect(container.querySelectorAll('.muted.small')).toHaveLength(1);
    expect(container.querySelectorAll('li')[1]).toHaveTextContent('PlanPick one');
  });
  it('updates when current advances', () => {
    const {container, rerender} = render(<Stepper steps={steps} current={0} />);
    rerender(<Stepper steps={steps} current={1} />);
    expect(container.querySelectorAll('li')[0]).toHaveAttribute('data-state', 'done');
    expect(container.querySelectorAll('li')[1]).toHaveAttribute('aria-current', 'step');
  });
  it('renders an empty list for no steps and handles many steps', () => {
    const {container, rerender} = render(<Stepper steps={[]} current={0} />);
    expect(container.querySelector('ol')).toBeEmptyDOMElement();
    rerender(<Stepper steps={Array.from({length: 100}, (_, i) => ({title: `S${i}`}))} current={50} />);
    expect(container.querySelectorAll('li')).toHaveLength(100);
    expect(container.querySelectorAll('[data-state="done"]')).toHaveLength(50);
  });
  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Stepper ref={ref} steps={steps} current={0} className="mine" aria-label="Progress" />);
    expect(ref.current).toHaveClass('steps', 'mine');
    expect(screen.getByRole('list', {name: 'Progress'})).toBe(ref.current);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Stepper aria-label="Checkout" steps={steps} current={1} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
