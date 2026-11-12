import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {RangeCalendar} from './range-calendar';

const jan = new Date(2026, 0, 15);
const btn = (n: string) => screen.getByRole('button', {name: n});

describe('RangeCalendar', () => {
  it('shows the month as a grid with weekday headers', () => {
    render(<RangeCalendar defaultValue={{start: jan, end: null}} locale="en-US" />);
    expect(screen.getByRole('grid', {name: 'January 2026'})).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });
  it('picks a start and then an end', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<RangeCalendar defaultValue={{start: jan, end: jan}} locale="en-US" onValueChange={fn} />);
    await user.click(btn('Monday, January 5, 2026'));
    expect(fn).toHaveBeenLastCalledWith({start: new Date(2026, 0, 5), end: null});
    await user.click(btn('Friday, January 9, 2026'));
    expect(fn).toHaveBeenLastCalledWith({start: new Date(2026, 0, 5), end: new Date(2026, 0, 9)});
    expect(btn('Monday, January 5, 2026')).toHaveAttribute('aria-pressed', 'true');
    expect(btn('Friday, January 9, 2026')).toHaveAttribute('aria-pressed', 'true');
    expect(btn('Wednesday, January 7, 2026').closest('td')).toHaveAttribute('data-in-range');
  });
  it('swaps when the second pick is earlier than the start', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<RangeCalendar locale="en-US" defaultValue={{start: jan, end: null}} onValueChange={fn} />);
    await user.click(btn('Monday, January 5, 2026'));
    expect(fn).toHaveBeenLastCalledWith({start: new Date(2026, 0, 5), end: jan});
  });
  it('orders the range when the end is before the start', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<RangeCalendar locale="en-US" onValueChange={fn} />);
    const d = new Date();
    const label = (x: Date) => new Intl.DateTimeFormat('en-US', {dateStyle: 'full'}).format(x);
    const a = new Date(d.getFullYear(), d.getMonth(), 20);
    const b = new Date(d.getFullYear(), d.getMonth(), 10);
    await user.click(btn(label(a)));
    await user.click(btn(label(b)));
    expect(fn).toHaveBeenLastCalledWith({start: b, end: a});
  });
  it('previews the range on hover while picking', async () => {
    const user = userEvent.setup();
    render(<RangeCalendar locale="en-US" defaultValue={{start: new Date(2026, 0, 5), end: null}} />);
    await user.hover(btn('Thursday, January 8, 2026'));
    expect(btn('Wednesday, January 7, 2026').closest('td')).toHaveAttribute('data-preview');
    expect(btn('Saturday, January 10, 2026').closest('td')).not.toHaveAttribute('data-in-range');
  });
  it('works with the keyboard and announces the range', async () => {
    const user = userEvent.setup();
    render(<RangeCalendar locale="en-US" defaultValue={{start: jan, end: null}} />);
    btn('Thursday, January 15, 2026').focus();
    await user.keyboard('{ArrowRight}');
    await vi.waitFor(() => expect(btn('Friday, January 16, 2026')).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Thursday, January 15, 2026 to Friday, January 16, 2026');
    await user.keyboard('{PageDown}');
    expect(await screen.findByRole('grid', {name: 'February 2026'})).toBeInTheDocument();
  });
  it('clears a half-picked range with Escape', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<RangeCalendar locale="en-US" defaultValue={{start: jan, end: null}} onValueChange={fn} />);
    btn('Thursday, January 15, 2026').focus();
    await user.keyboard('{Escape}');
    expect(fn).toHaveBeenLastCalledWith({start: null, end: null});
  });
  it('mirrors arrow keys in right-to-left', async () => {
    const user = userEvent.setup();
    render(<div dir="rtl"><RangeCalendar locale="en-US" defaultValue={{start: jan, end: null}} /></div>);
    btn('Thursday, January 15, 2026').focus();
    await user.keyboard('{ArrowRight}');
    await vi.waitFor(() => expect(btn('Wednesday, January 14, 2026')).toHaveFocus());
  });
  it('disables days outside min/max and via isDateDisabled', () => {
    render(<RangeCalendar locale="en-US" defaultValue={{start: jan, end: null}} min={new Date(2026, 0, 10)} max={new Date(2026, 0, 20)} isDateDisabled={(d) => d.getDate() === 12} />);
    expect(btn('Saturday, January 3, 2026')).toBeDisabled();
    expect(btn('Monday, January 12, 2026')).toBeDisabled();
    expect(btn('Tuesday, January 13, 2026')).toBeEnabled();
  });
  it('is controlled', async () => {
    const user = userEvent.setup();
    render(<RangeCalendar locale="en-US" value={{start: jan, end: new Date(2026, 0, 17)}} />);
    await user.click(btn('Monday, January 5, 2026'));
    expect(btn('Thursday, January 15, 2026')).toHaveAttribute('aria-pressed', 'true');
  });
  it('has no axe violations', async () => {
    const {container} = render(<RangeCalendar defaultValue={{start: jan, end: new Date(2026, 0, 18)}} locale="en-US" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
