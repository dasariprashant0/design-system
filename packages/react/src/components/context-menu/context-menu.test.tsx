import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger} from './context-menu';

const ui = (fn = () => {}) => (
  <ContextMenu>
    <ContextMenuTrigger>Right click here</ContextMenuTrigger>
    <ContextMenuContent><ContextMenuItem onSelect={fn}>Rename</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem tone="danger">Delete</ContextMenuItem></ContextMenuContent>
  </ContextMenu>
);

describe('ContextMenu', () => {
  it('opens on right click as a menu', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.pointer({keys: '[MouseRight]', target: screen.getByText('Right click here')});
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });
  it('runs an item and closes', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(ui(fn));
    await user.pointer({keys: '[MouseRight]', target: screen.getByText('Right click here')});
    await user.click(await screen.findByRole('menuitem', {name: 'Rename'}));
    expect(fn).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  it('closes with Escape', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.pointer({keys: '[MouseRight]', target: screen.getByText('Right click here')});
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.pointer({keys: '[MouseRight]', target: screen.getByText('Right click here')});
    await screen.findByRole('menu');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
