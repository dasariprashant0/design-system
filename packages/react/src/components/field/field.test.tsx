import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Input} from '../input';
import {Field} from './field';

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
  it('has no axe violations', async () => {
    const {container} = render(<Field label="Email" hint="h" error="e"><Input /></Field>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
