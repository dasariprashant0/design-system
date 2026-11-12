import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger} from './menubar';

const ui = () => (
  <Menubar aria-label="App">
    <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New</MenubarItem><MenubarSeparator /><MenubarItem>Quit</MenubarItem></MenubarContent></MenubarMenu>
    <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem></MenubarContent></MenubarMenu>
  </Menubar>
);

describe('Menubar', () => {
  it('is a menubar of menu buttons', () => {
    render(ui());
    expect(screen.getByRole('menubar', {name: 'App'})).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });
  it('opens a menu on click', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('menuitem', {name: 'File'}));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', {name: 'New'})).toBeInTheDocument();
  });
  it('moves between menus with arrow keys and closes with Escape', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('menuitem', {name: 'File'}));
    await screen.findByRole('menu');
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menuitem', {name: 'Undo'})).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
