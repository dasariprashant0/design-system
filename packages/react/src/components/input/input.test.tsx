import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Input} from './input';

describe('Input', () => {
  it('types and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'ada');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('textbox')).toHaveValue('ada');
  });
  it('applies classes and the invalid state', () => {
    render(<Input aria-label="n" size="sm" invalid />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveClass('input', 'input-sm');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });
  it('is disabled', () => {
    render(<Input aria-label="n" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
  it('forwards its ref', () => {
    const ref = {current: null as HTMLInputElement | null};
    render(<Input aria-label="n" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Input aria-label="Name" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
