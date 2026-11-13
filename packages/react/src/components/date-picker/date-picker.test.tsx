import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Field} from '../field';
import {DatePicker} from './date-picker';

describe('DatePicker', () => {
  it('shows the placeholder, then the chosen date', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DatePicker aria-label="Start" locale="en-US" defaultValue={new Date(2026, 0, 15)} onValueChange={fn} />);
    const btn = screen.getByRole('button', {name: 'Start'});
    expect(btn).toHaveTextContent('Jan 15, 2026');
    await user.click(btn);
    await user.click(await screen.findByRole('button', {name: 'Friday, January 16, 2026'}));
    expect(fn.mock.calls[0]![0].getDate()).toBe(16);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(btn).toHaveTextContent('Jan 16, 2026');
    expect(btn).toHaveFocus();
  });
  it('opens a named dialog and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Start" />);
    await user.click(screen.getByRole('button', {name: 'Start'}));
    expect(await screen.findByRole('dialog', {name: 'Choose a date'})).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('moves focus to the chosen day on open, not the month arrows (regression: found by e2e)', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Start" locale="en-US" defaultValue={new Date(2026, 0, 15)} />);
    await user.click(screen.getByRole('button', {name: 'Start'}));
    expect(await screen.findByRole('button', {name: 'Thursday, January 15, 2026'})).toHaveFocus();
  });
  it('shows a placeholder when empty', () => {
    render(<DatePicker aria-label="Start" placeholder="Choose" />);
    expect(screen.getByRole('button', {name: 'Start'})).toHaveTextContent('Choose');
  });
  it('is labelled by a Field', () => {
    render(<Field label="Due date"><DatePicker /></Field>);
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<DatePicker aria-label="Start" />);
    expect(await axe(container)).toHaveNoViolations();
  });
  it('clears the date from the popover when clearable', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<DatePicker aria-label="Start" clearable defaultValue={new Date(2026, 0, 15)} locale="en-US" onValueChange={fn} />);
    const btn = screen.getByRole('button', {name: 'Start'});
    await user.click(btn);
    await user.click(await screen.findByRole('button', {name: 'Clear date'}));
    expect(fn).toHaveBeenCalledWith(null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(btn).toHaveTextContent('Pick a date');
    expect(btn).toHaveFocus();
  });
  it('clears with the keyboard and is axe clean when open', async () => {
    const user = userEvent.setup();
    render(<DatePicker aria-label="Start" clearable defaultValue={new Date(2026, 0, 15)} locale="en-US" />);
    await user.click(screen.getByRole('button', {name: 'Start'}));
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
    screen.getByRole('button', {name: 'Clear date'}).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', {name: 'Start'})).toHaveTextContent('Pick a date');
  });
});
