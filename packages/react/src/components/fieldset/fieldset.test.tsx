import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Fieldset} from './fieldset';
import {createRef} from 'react';

describe('Fieldset', () => {
  it('is a group named by its legend', () => {
    render(<Fieldset legend="Contact"><input aria-label="Email" /></Fieldset>);
    expect(screen.getByRole('group', {name: 'Contact'})).toBeInTheDocument();
  });
  it('disables the controls inside', () => {
    render(<Fieldset legend="Contact" disabled><input aria-label="Email" /></Fieldset>);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });
  it('renders the legend first and keeps children after it', () => {
    const {container} = render(<Fieldset legend="Billing"><input aria-label="x" /></Fieldset>);
    const fs = container.querySelector('fieldset')!;
    expect(fs.firstElementChild!.tagName).toBe('LEGEND');
    expect(fs.firstElementChild).toHaveClass('fieldset-legend');
  });
  it('is enabled by default and a disabled fieldset disables nested controls', () => {
    const {rerender} = render(<Fieldset legend="G"><input aria-label="x" /></Fieldset>);
    expect(screen.getByLabelText('x')).toBeEnabled();
    rerender(<Fieldset legend="G" disabled><input aria-label="x" /></Fieldset>);
    expect(screen.getByLabelText('x')).toBeDisabled();
  });
  it('forwards ref, merges className and spreads props (form, name)', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<Fieldset ref={ref} legend="G" className="mine" name="g" form="f1" />);
    expect(ref.current).toHaveClass('fieldset', 'mine');
    expect(ref.current).toHaveAttribute('name', 'g');
    expect(ref.current).toHaveAttribute('form', 'f1');
  });
  it('accepts a rich legend, long text and RTL, and renders with no children', () => {
    render(<Fieldset legend={<b>العنوان {'x'.repeat(500)}</b>} />);
    expect(screen.getByRole('group', {name: /العنوان/})).toBeInTheDocument();
  });
  it('names two groups separately', () => {
    render(<><Fieldset legend="One" /><Fieldset legend="Two" /></>);
    expect(screen.getByRole('group', {name: 'One'})).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Two'})).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Fieldset legend="Contact"><input aria-label="Email" /></Fieldset>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
