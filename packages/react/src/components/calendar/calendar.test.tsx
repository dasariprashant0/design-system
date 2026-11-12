import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Calendar} from './calendar';

const jan = new Date(2026, 0, 15);

describe('Calendar', () => {
  it('shows the month as a grid with weekday headers', () => {
    render(<Calendar defaultValue={jan} locale="en-US" />);
    expect(screen.getByRole('grid', {name: 'January 2026'})).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getByRole('button', {name: 'Thursday, January 15, 2026'})).toHaveAttribute('aria-pressed', 'true');
  });
  it('selects a day by click and reports it', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Calendar defaultValue={jan} locale="en-US" onValueChange={fn} />);
    await user.click(screen.getByRole('button', {name: 'Friday, January 16, 2026'}));
    expect(fn.mock.calls[0]![0].getDate()).toBe(16);
    expect(screen.getByRole('button', {name: 'Friday, January 16, 2026'})).toHaveAttribute('aria-pressed', 'true');
  });
  it('has one tab stop: the focused day', () => {
    render(<Calendar defaultValue={jan} locale="en-US" />);
    const stops = screen.getAllByRole('button').filter((b) => b.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAccessibleName('Thursday, January 15, 2026');
  });
  it('moves by arrow keys and months with PageDown', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={jan} locale="en-US" />);
    screen.getByRole('button', {name: 'Thursday, January 15, 2026'}).focus();
    await user.keyboard('{ArrowRight}');
    await vi.waitFor(() => expect(screen.getByRole('button', {name: 'Friday, January 16, 2026'})).toHaveFocus());
    await user.keyboard('{PageDown}');
    expect(await screen.findByRole('grid', {name: 'February 2026'})).toBeInTheDocument();
  });
  it('changes month with the buttons', async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={jan} locale="en-US" />);
    await user.click(screen.getByRole('button', {name: 'Next month'}));
    expect(screen.getByRole('grid', {name: 'February 2026'})).toBeInTheDocument();
  });
  it('disables days outside min and max', () => {
    render(<Calendar defaultValue={jan} locale="en-US" min={new Date(2026, 0, 10)} max={new Date(2026, 0, 20)} />);
    expect(screen.getByRole('button', {name: 'Saturday, January 3, 2026'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Monday, January 12, 2026'})).toBeEnabled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Calendar defaultValue={jan} locale="en-US" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
