import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from './dropdown-menu';

const ui = (onSelect?: () => void) => (
  <DropdownMenu>
    <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onSelect={onSelect}>Rename</DropdownMenuItem>
      <DropdownMenuCheckboxItem checked>Pinned</DropdownMenuCheckboxItem>
      <DropdownMenuItem disabled>Locked</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

describe('DropdownMenu', () => {
  it('opens with the keyboard and lists menu items', async () => {
    const user = userEvent.setup();
    render(ui());
    screen.getByRole('button', {name: 'Actions'}).focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem').length).toBe(2);
    expect(screen.getByRole('menuitemcheckbox', {name: /Pinned/})).toBeChecked();
  });
  it('selects an item and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(ui(onSelect));
    await user.click(screen.getByRole('button', {name: 'Actions'}));
    await user.click(await screen.findByRole('menuitem', {name: 'Rename'}));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Actions'});
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Actions'}));
    expect(await axe(await screen.findByRole('menu'))).toHaveNoViolations();
  });
});
