import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Popover, PopoverContent, PopoverTrigger} from './popover';

const ui = () => (
  <Popover><PopoverTrigger>Open</PopoverTrigger><PopoverContent aria-label="Details">Content</PopoverContent></Popover>
);

describe('Popover', () => {
  it('opens and closes with the trigger', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Open'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(await screen.findByRole('dialog', {name: 'Details'})).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Open'});
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(await axe(await screen.findByRole('dialog'))).toHaveNoViolations();
  });
});
