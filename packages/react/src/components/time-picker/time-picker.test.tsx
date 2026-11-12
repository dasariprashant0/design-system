import {render, screen, fireEvent} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {TimePicker} from './time-picker';

describe('TimePicker', () => {
  it('renders a native time input with its default value and class', () => {
    render(<TimePicker aria-label="Start" defaultValue="09:30" />);
    const input = screen.getByLabelText('Start');
    expect(input).toHaveAttribute('type', 'time');
    expect(input).toHaveValue('09:30');
    expect(input).toHaveClass('input', 'time-picker');
  });
  it('calls onValueChange with 24-hour text, uncontrolled', () => {
    const fn = vi.fn();
    render(<TimePicker aria-label="Start" onValueChange={fn} />);
    fireEvent.change(screen.getByLabelText('Start'), {target: {value: '14:05'}});
    expect(fn).toHaveBeenCalledWith('14:05');
    expect(screen.getByLabelText('Start')).toHaveValue('14:05');
  });
  it('stays on the given value when controlled', () => {
    render(<TimePicker aria-label="Start" value="08:00" />);
    fireEvent.change(screen.getByLabelText('Start'), {target: {value: '10:00'}});
    expect(screen.getByLabelText('Start')).toHaveValue('08:00');
  });
  it('passes min, max, step, disabled and invalid through and forwards the ref', () => {
    const ref = {current: null as HTMLInputElement | null};
    render(<TimePicker aria-label="Start" ref={ref} min="08:00" max="18:00" step={900} disabled invalid />);
    const input = screen.getByLabelText('Start');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('min', '08:00');
    expect(input).toHaveAttribute('step', '900');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('is reachable by Tab and named by its Field', async () => {
    const {default: userEvent} = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<Field label="Start time"><TimePicker /></Field>);
    await user.tab();
    expect(screen.getByLabelText('Start time')).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Field label="Start time"><TimePicker defaultValue="09:30" /></Field>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
