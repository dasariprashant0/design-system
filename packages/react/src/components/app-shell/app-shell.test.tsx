import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {AppShell} from './app-shell';
import {Navbar} from '../navbar';
import {Sidebar, SidebarContent, SidebarGroup, SidebarItem, SidebarToggle, SidebarTrigger} from '../sidebar';

const ui = (extra = {}) => (
  <AppShell
    navbar={<Navbar brand="Acme" leading={<SidebarTrigger />} actions={<SidebarToggle />} />}
    sidebar={<Sidebar drawerTitle="Acme"><SidebarContent><SidebarGroup><SidebarItem href="/" current>Overview</SidebarItem></SidebarGroup></SidebarContent></Sidebar>}
    aside={<p>Activity</p>}
    {...extra}
  >
    <h1>Overview</h1>
  </AppShell>
);

describe('AppShell', () => {
  it('has banner, navigation, main and complementary landmarks', () => {
    render(ui());
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', {name: 'Main'})).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', {level: 1}));
    expect(screen.getByRole('complementary', {name: 'Details'})).toHaveTextContent('Activity');
  });
  it('starts with a skip link that targets main', async () => {
    render(ui({skipLinkLabel: 'Skip it'}));
    await userEvent.tab();
    const skip = screen.getByRole('link', {name: 'Skip it'});
    expect(skip).toHaveFocus();
    expect(skip.getAttribute('href')).toBe(`#${screen.getByRole('main').id}`);
  });
  it('accepts mainId and omits optional regions', () => {
    render(<AppShell mainId="content"><p>x</p></AppShell>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content');
    expect(screen.getByRole('link', {name: 'Skip to main content'})).toHaveAttribute('href', '#content');
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
  });
  it('sets the scroll mode and forwards the ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(ui({ref, scroll: 'contained'}));
    expect(ref.current).toHaveAttribute('data-scroll', 'contained');
  });
  it('lets a toggle anywhere collapse the sidebar and reports it', async () => {
    const onCollapsedChange = vi.fn();
    render(ui({onCollapsedChange}));
    await userEvent.click(screen.getByRole('button', {name: 'Toggle sidebar'}));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(document.querySelector('.sidebar')).toHaveAttribute('data-collapsed');
  });
  it('opens the sidebar in a drawer from the navbar trigger', async () => {
    render(ui());
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    expect(within(screen.getByRole('dialog', {name: 'Acme'})).getByRole('link', {name: 'Overview'})).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
