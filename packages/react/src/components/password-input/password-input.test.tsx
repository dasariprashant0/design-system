import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {PasswordInput} from './password-input';

describe('PasswordInput', () => {
  it('hides the text by default and toggles', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" defaultValue="hunter2" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    const btn = screen.getByRole('button', {name: /show password/i});
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', {name: /hide password/i})).toHaveAttribute('aria-pressed', 'true');
  });
  it('keeps typed text when toggling', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);
    await user.type(screen.getByLabelText('Password'), 'abc');
    await user.click(screen.getByRole('button'));
    expect(screen.getByLabelText('Password')).toHaveValue('abc');
  });
  it('has no axe violations', async () => {
    const {container} = render(<PasswordInput aria-label="Password" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
