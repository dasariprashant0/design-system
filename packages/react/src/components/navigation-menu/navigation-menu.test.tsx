import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger} from './navigation-menu';

const ui = () => (
  <NavigationMenu aria-label="Main">
    <NavigationMenuList>
      <NavigationMenuItem><NavigationMenuLink href="/" active>Home</NavigationMenuLink></NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Products</NavigationMenuTrigger>
        <NavigationMenuContent><NavigationMenuLink href="/ui">UI kit</NavigationMenuLink></NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

describe('NavigationMenu', () => {
  beforeAll(() => { globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as never; });
  it('is a named navigation landmark with links', () => {
    render(ui());
    expect(screen.getByRole('navigation', {name: 'Main'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute('aria-current', 'page');
  });
  it('opens a panel from the trigger', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: /Products/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('link', {name: 'UI kit'})).toBeInTheDocument();
  });
  it('closes the panel with Escape', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: /Products/}));
    await screen.findByRole('link', {name: 'UI kit'});
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', {name: /Products/})).toHaveAttribute('aria-expanded', 'false');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
