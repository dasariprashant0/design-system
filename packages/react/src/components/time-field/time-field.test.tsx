import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {TimeField} from './time-field';

const hour = () => screen.getByRole('spinbutton', {name: 'Hour'});
const minute = () => screen.getByRole('spinbutton', {name: 'Minute'});

describe('TimeField', () => {
  it('renders a named group of spin buttons with values', () => {
    render(<TimeField aria-label="Start" defaultValue="14:05" />);
    expect(screen.getByRole('group', {name: 'Start'})).toBeInTheDocument();
    expect(hour()).toHaveAttribute('aria-valuenow', '2');
    expect(hour()).toHaveTextContent('02');
    expect(minute()).toHaveAttribute('aria-valuenow', '5');
    expect(screen.getByRole('spinbutton', {name: 'AM or PM'})).toHaveTextContent('PM');
  });
  it('steps with arrow keys and wraps', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TimeField defaultValue="12:59" onValueChange={fn} />);
    hour().focus();
    await user.keyboard('{ArrowUp}');
    expect(fn).toHaveBeenLastCalledWith('13:59');
    minute().focus();
    await user.keyboard('{ArrowUp}');
    expect(fn).toHaveBeenLastCalledWith('13:00');
    await user.keyboard('{ArrowDown}');
    expect(fn).toHaveBeenLastCalledWith('13:59');
  });
  it('steps minutes by the step prop', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TimeField hourCycle={24} step={15} defaultValue="09:00" onValueChange={fn} />);
    minute().focus();
    await user.keyboard('{ArrowUp}');
    expect(fn).toHaveBeenLastCalledWith('09:15');
  });
  it('supports 24-hour with no period segment', () => {
    render(<TimeField hourCycle={24} defaultValue="00:00" />);
    expect(screen.queryByRole('spinbutton', {name: 'AM or PM'})).not.toBeInTheDocument();
    expect(hour()).toHaveAttribute('aria-valuemax', '23');
  });
  it('types digits and moves to the next segment', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TimeField onValueChange={fn} />);
    hour().focus();
    await user.keyboard('0');
    await user.keyboard('7');
    expect(minute()).toHaveFocus();
    await user.keyboard('45');
    expect(fn).toHaveBeenLastCalledWith('07:45');
    expect(hour()).toHaveTextContent('07');
  });
  it('moves on after one digit that cannot take another', async () => {
    const user = userEvent.setup();
    render(<TimeField />);
    hour().focus();
    await user.keyboard('3');
    expect(hour()).toHaveTextContent('03');
    expect(minute()).toHaveFocus();
  });
  it('sets AM and PM with a and p, and keeps the hour', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TimeField defaultValue="09:30" onValueChange={fn} />);
    screen.getByRole('spinbutton', {name: 'AM or PM'}).focus();
    await user.keyboard('p');
    expect(fn).toHaveBeenLastCalledWith('21:30');
    await user.keyboard('{ArrowDown}');
    expect(fn).toHaveBeenLastCalledWith('09:30');
  });
  it('Home, End and Backspace', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TimeField defaultValue="09:30" onValueChange={fn} />);
    minute().focus();
    await user.keyboard('{End}');
    expect(fn).toHaveBeenLastCalledWith('09:59');
    await user.keyboard('{Home}');
    expect(fn).toHaveBeenLastCalledWith('09:00');
    await user.keyboard('{Backspace}');
    expect(fn).toHaveBeenLastCalledWith('');
    expect(minute()).toHaveAttribute('aria-valuetext', 'Empty');
  });
  it('moves between segments with arrow keys, mirrored in rtl', async () => {
    const user = userEvent.setup();
    render(<TimeField defaultValue="09:30" />);
    hour().focus();
    await user.keyboard('{ArrowRight}');
    expect(minute()).toHaveFocus();
  });
  it('mirrors segment navigation in rtl', async () => {
    const user = userEvent.setup();
    render(<div dir="rtl"><TimeField defaultValue="09:30" /></div>);
    hour().focus();
    await user.keyboard('{ArrowLeft}');
    expect(minute()).toHaveFocus();
  });
  it('submits the 24-hour value through a hidden input', () => {
    const {container} = render(<TimeField name="at" defaultValue="21:05" />);
    expect(container.querySelector<HTMLInputElement>('input[name="at"]')!.value).toBe('21:05');
  });
  it('ignores keys when disabled', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<TimeField disabled defaultValue="09:30" onValueChange={fn} />);
    hour().focus();
    await user.keyboard('{ArrowUp}');
    expect(fn).not.toHaveBeenCalled();
  });
  it('follows a controlled value', () => {
    const {rerender} = render(<TimeField value="09:30" />);
    rerender(<TimeField value="18:45" />);
    expect(hour()).toHaveTextContent('06');
    expect(minute()).toHaveTextContent('45');
  });
  it('has no axe violations', async () => {
    const {container} = render(<TimeField aria-label="Start" defaultValue="09:30" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
