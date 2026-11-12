import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger} from './drawer';

const ui = (side?: 'left' | 'right') => (
  <Drawer>
    <DrawerTrigger>Open</DrawerTrigger>
    <DrawerContent side={side}><DrawerTitle>Filters</DrawerTitle><DrawerDescription>Narrow the list.</DrawerDescription></DrawerContent>
  </Drawer>
);

describe('Drawer', () => {
  it('opens as a named dialog on the right by default', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'Open'}));
    const dlg = await screen.findByRole('dialog', {name: 'Filters'});
    expect(dlg).toHaveAttribute('data-side', 'right');
  });
  it('supports another side', async () => {
    const user = userEvent.setup();
    render(ui('left'));
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(await screen.findByRole('dialog')).toHaveAttribute('data-side', 'left');
  });
  it('closes with Escape and returns focus', async () => {
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
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
