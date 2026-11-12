import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {NativeSelect} from './native-select';

describe('NativeSelect', () => {
  it('is a combobox with options and changes by user selection', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<NativeSelect aria-label="Plan" onChange={fn}><option value="free">Free</option><option value="pro">Pro</option></NativeSelect>);
    await user.selectOptions(screen.getByRole('combobox', {name: 'Plan'}), 'pro');
    expect(fn).toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('pro');
  });
  it('is labelled by a Field', () => {
    render(<Field label="Plan"><NativeSelect><option>Free</option></NativeSelect></Field>);
    expect(screen.getByLabelText('Plan')).toBeInTheDocument();
  });
  it('supports invalid and disabled', () => {
    render(<NativeSelect aria-label="Plan" invalid disabled><option>Free</option></NativeSelect>);
    const el = screen.getByRole('combobox');
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el).toBeDisabled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<NativeSelect aria-label="Plan"><option>Free</option></NativeSelect>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
