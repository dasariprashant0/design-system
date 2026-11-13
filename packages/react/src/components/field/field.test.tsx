import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Input} from '../input';
import {Field} from './field';
import {createRef} from 'react';
import {useFieldControl} from './field';

describe('Field', () => {
  it('labels the control', () => {
    render(<Field label="Email"><Input /></Field>);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
  it('links hint and error with aria-describedby and marks invalid', () => {
    render(<Field label="Email" hint="Hint text" error="Bad value"><Input /></Field>);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Hint text Bad value');
    expect(screen.getByRole('alert')).toHaveTextContent('Bad value');
  });
  it('sets required on the control', () => {
    render(<Field label="Name" required><Input /></Field>);
    expect(screen.getByLabelText(/Name/)).toBeRequired();
  });
  it('links the label to the control by id and gives unique ids to separate fields', () => {
    render(<><Field label="A"><Input /></Field><Field label="B"><Input /></Field></>);
    const a = screen.getByLabelText('A');
    const b = screen.getByLabelText('B');
    expect(a.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });
  it('has no aria-describedby and is not invalid with no hint or error', () => {
    render(<Field label="A"><Input /></Field>);
    const input = screen.getByLabelText('A');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toBeRequired();
  });
  it('describes the control by the hint alone', () => {
    render(<Field label="A" hint="Help"><Input /></Field>);
    const input = screen.getByLabelText('A');
    expect(input).toHaveAccessibleDescription('Help');
    expect(input).not.toHaveAttribute('aria-invalid');
  });
  it('describes the control by hint then error, and the error is an alert', () => {
    render(<Field label="A" hint="Help" error="Bad"><Input /></Field>);
    const input = screen.getByLabelText('A');
    expect(input).toHaveAccessibleDescription('Help Bad');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Bad');
  });
  it('clears invalid state and the alert when the error goes away', () => {
    const {rerender} = render(<Field label="A" error="Bad"><Input /></Field>);
    rerender(<Field label="A"><Input /></Field>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('A')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('A')).not.toHaveAttribute('aria-describedby');
  });
  it('marks the label with the required class and the control required', () => {
    const {container} = render(<Field label="A" required><Input /></Field>);
    expect(container.querySelector('label')).toHaveClass('field-required');
    expect(screen.getByLabelText(/A/)).toBeRequired();
  });
  it('useFieldControl returns an empty object outside a Field', () => {
    let got: unknown;
    function Probe() { got = useFieldControl(); return null; }
    render(<Probe />);
    expect(got).toEqual({});
  });
  it('useFieldControl wires a custom control inside a Field', () => {
    function Custom() { return <textarea {...useFieldControl()} />; }
    render(<Field label="Notes" hint="Short" error="Required" required><Custom /></Field>);
    const t = screen.getByLabelText(/Notes/);
    expect(t).toBeRequired();
    expect(t).toHaveAttribute('aria-invalid', 'true');
    expect(t).toHaveAccessibleDescription('Short Required');
  });
  it('forwards ref, merges className and spreads props on the wrapper', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Field ref={ref} label="A" className="mine" data-x="1"><Input /></Field>);
    expect(ref.current).toHaveClass('field', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('accepts rich labels, long text and RTL', () => {
    render(<Field label={<span>الاسم</span>} hint={'h'.repeat(2000)}><Input /></Field>);
    expect(screen.getByLabelText('الاسم')).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Field label="Email" hint="h" error="e"><Input /></Field>);
    expect(await axe(container)).toHaveNoViolations();
  });
  it('ignores name outside a Form', () => {
    render(<Field label="Email" name="email"><Input /></Field>);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });
});
