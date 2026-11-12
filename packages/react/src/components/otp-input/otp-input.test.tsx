import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {OtpInput} from './otp-input';

describe('OtpInput', () => {
  it('renders a named group of labelled boxes', () => {
    render(<OtpInput aria-label="Verification code" length={4} />);
    expect(screen.getByRole('group', {name: 'Verification code'})).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(screen.getByLabelText('Digit 1 of 4')).toBeInTheDocument();
  });
  it('types forward and calls onComplete', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<OtpInput aria-label="Code" length={4} onComplete={done} />);
    await user.click(screen.getByLabelText('Digit 1 of 4'));
    await user.keyboard('1234');
    expect(done).toHaveBeenCalledWith('1234');
    expect(screen.getByLabelText('Digit 4 of 4')).toHaveValue('4');
  });
  it('ignores letters in numeric mode', async () => {
    const user = userEvent.setup();
    render(<OtpInput aria-label="Code" length={4} />);
    await user.click(screen.getByLabelText('Digit 1 of 4'));
    await user.keyboard('a1');
    expect(screen.getByLabelText('Digit 1 of 4')).toHaveValue('1');
  });
  it('backspace clears and moves back', async () => {
    const user = userEvent.setup();
    render(<OtpInput aria-label="Code" length={4} defaultValue="12" />);
    await user.click(screen.getByLabelText('Digit 3 of 4'));
    await user.keyboard('{Backspace}');
    expect(screen.getByLabelText('Digit 2 of 4')).toHaveFocus();
    expect(screen.getByLabelText('Digit 2 of 4')).toHaveValue('');
  });
  it('fills all boxes on paste', async () => {
    const user = userEvent.setup();
    render(<OtpInput aria-label="Code" length={6} />);
    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.paste('12-34 56');
    expect(screen.getByLabelText('Digit 6 of 6')).toHaveValue('6');
  });
  it('has no axe violations', async () => {
    const {container} = render(<OtpInput aria-label="Verification code" length={6} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
