import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Fieldset} from './fieldset';

describe('Fieldset', () => {
  it('is a group named by its legend', () => {
    render(<Fieldset legend="Contact"><input aria-label="Email" /></Fieldset>);
    expect(screen.getByRole('group', {name: 'Contact'})).toBeInTheDocument();
  });
  it('disables the controls inside', () => {
    render(<Fieldset legend="Contact" disabled><input aria-label="Email" /></Fieldset>);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Fieldset legend="Contact"><input aria-label="Email" /></Fieldset>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
