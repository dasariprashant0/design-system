import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {DateRangePicker} from './date-range-picker';

const start = new Date(2026, 0, 15);

describe('DateRangePicker', () => {
  it('shows the placeholder, then the chosen range', () => {
    const {rerender} = render(<DateRangePicker aria-label="Stay" placeholder="Choose" />);
    expect(screen.getByRole('button', {name: 'Stay'})).toHaveTextContent('Choose');
    rerender(<DateRangePicker aria-label="Stay" locale="en-US" value={{start, end: new Date(2026, 0, 20)}} />);
    expect(screen.getByRole('button', {name: 'Stay'})).toHaveTextContent('Jan 15, 2026 – Jan 20, 2026');
  });
  it('picks a range in the calendar, closes and returns focus', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Stay" locale="en-US" defaultValue={{start, end: start}} onValueChange={fn} />);
    const trigger = screen.getByRole('button', {name: 'Stay'});
    await user.click(trigger);
    await user.click(await screen.findByRole('button', {name: 'Monday, January 5, 2026'}));
    await user.click(screen.getByRole('button', {name: 'Wednesday, January 7, 2026'}));
    expect(fn).toHaveBeenLastCalledWith({start: new Date(2026, 0, 5), end: new Date(2026, 0, 7)});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('accepts typed dates and rejects bad ones', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Stay" locale="en-US" defaultValue={{start, end: new Date(2026, 0, 20)}} onValueChange={fn} />);
    await user.click(screen.getByRole('button', {name: 'Stay'}));
    const end = await screen.findByLabelText('End');
    await user.clear(end);
    await user.type(end, '2026-01-25{Enter}');
    expect(fn).toHaveBeenLastCalledWith({start, end: new Date(2026, 0, 25)});
    await user.clear(end);
    await user.type(end, '2026-02-31{Enter}');
    expect(end).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/YYYY-MM-DD/);
  });
  it('orders typed dates if start is after end', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DateRangePicker aria-label="Stay" locale="en-US" defaultValue={{start, end: new Date(2026, 0, 20)}} onValueChange={fn} />);
    await user.click(screen.getByRole('button', {name: 'Stay'}));
    const s = await screen.findByLabelText('Start');
    await user.clear(s);
    await user.type(s, '2026-01-30{Enter}');
    expect(fn).toHaveBeenLastCalledWith({start: new Date(2026, 0, 20), end: new Date(2026, 0, 30)});
  });
  it('opens a named dialog and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Stay" />);
    await user.click(screen.getByRole('button', {name: 'Stay'}));
    expect(await screen.findByRole('dialog', {name: 'Choose a date range'})).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('is labelled by a Field', () => {
    render(<Field label="Stay"><DateRangePicker /></Field>);
    expect(screen.getByLabelText('Stay')).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<DateRangePicker aria-label="Stay" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
