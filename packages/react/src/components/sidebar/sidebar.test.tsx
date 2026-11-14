import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarItem, SidebarProvider, SidebarToggle, SidebarTrigger, useSidebar} from './sidebar';
import {DirectionProvider} from '../direction-provider';
import type {RenderLink} from '../link';

const Icon = () => <svg viewBox="0 0 16 16" width="16" height="16" />;
const ui = (props: {collapsed?: boolean; defaultCollapsed?: boolean; onCollapsedChange?: (c: boolean) => void; renderLink?: RenderLink} = {}) => (
  <SidebarProvider collapsed={props.collapsed} defaultCollapsed={props.defaultCollapsed} onCollapsedChange={props.onCollapsedChange}>
    <SidebarTrigger />
    <SidebarToggle />
    <Sidebar drawerTitle="Acme" renderLink={props.renderLink}>
      <SidebarHeader>Acme</SidebarHeader>
      <SidebarContent>
        <SidebarGroup label="Workspace">
          <SidebarItem href="/" icon={<Icon />} current>Overview</SidebarItem>
          <SidebarItem href="/reports" icon={<Icon />}>Reports</SidebarItem>
          <SidebarItem href="/team" icon={<Icon />}>Team</SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
);

describe('Sidebar', () => {
  it('renders a named navigation with groups and the current page', () => {
    render(ui());
    const nav = screen.getByRole('navigation', {name: 'Main'});
    expect(within(nav).getByRole('list', {name: 'Workspace'})).toBeInTheDocument();
    expect(within(nav).getByRole('link', {name: 'Overview'})).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', {name: 'Reports'})).not.toHaveAttribute('aria-current');
  });
  it('hides the icon from screen readers', () => {
    render(ui());
    expect(screen.getByRole('link', {name: 'Overview'}).querySelector('.sidebar-icon')).toHaveAttribute('aria-hidden', 'true');
  });
  it('toggles collapsed state and reports it', async () => {
    const onChange = vi.fn();
    render(ui({onCollapsedChange: onChange}));
    const toggle = screen.getByRole('button', {name: 'Toggle sidebar'});
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.sidebar')).toHaveAttribute('data-collapsed');
    // labels stay in the accessibility tree when collapsed
    expect(screen.getByRole('link', {name: 'Reports'})).toBeInTheDocument();
  });
  it('can start collapsed and be controlled', () => {
    const {rerender} = render(ui({defaultCollapsed: true}));
    expect(document.querySelector('.sidebar')).toHaveAttribute('data-collapsed');
    rerender(ui({collapsed: false}));
    expect(document.querySelector('.sidebar')).not.toHaveAttribute('data-collapsed');
  });
  it('shows a tooltip with the label on focus when collapsed', async () => {
    render(ui({defaultCollapsed: true}));
    await userEvent.tab(); await userEvent.tab(); await userEvent.tab();
    expect(screen.getByRole('link', {name: 'Overview'})).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Overview');
  });
  it('moves focus with arrow keys, Home and End', async () => {
    render(ui());
    screen.getByRole('link', {name: 'Overview'}).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', {name: 'Reports'})).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('link', {name: 'Team'})).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', {name: 'Team'})).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('link', {name: 'Reports'})).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('link', {name: 'Overview'})).toHaveFocus();
  });
  it('opens the same navigation in a drawer, closes on Escape and returns focus', async () => {
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Menu'});
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', {name: 'Acme'});
    expect(within(dialog).getByRole('link', {name: 'Reports'})).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
  it('closes the drawer when a link is chosen', async () => {
    render(ui());
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', {name: 'Team'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('hands links to renderLink', async () => {
    const go = vi.fn();
    const renderLink: RenderLink = ({href, children, ...p}) => <a {...p} href={href} data-router onClick={(e) => { e.preventDefault(); go(href); }}>{children}</a>;
    render(ui({renderLink}));
    const link = screen.getByRole('link', {name: 'Reports'});
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveClass('sidebar-item');
    expect(screen.getByRole('link', {name: 'Overview'})).toHaveAttribute('aria-current', 'page');
    await userEvent.click(link);
    expect(go).toHaveBeenCalledWith('/reports');
  });
  it('supports asChild with a router link', () => {
    render(<SidebarProvider><Sidebar><SidebarContent><SidebarGroup><SidebarItem asChild current icon={<Icon />}><a href="/x" data-router>Inbox</a></SidebarItem></SidebarGroup></SidebarContent></Sidebar></SidebarProvider>);
    const link = screen.getByRole('link', {name: 'Inbox'});
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('sidebar-item');
  });
  it('exposes the state through useSidebar and forwards the ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    const Probe = () => <span>{useSidebar().collapsed ? 'collapsed' : 'expanded'}</span>;
    render(<SidebarProvider defaultCollapsed><Probe /><Sidebar ref={ref}><SidebarContent><SidebarGroup><SidebarItem href="/">A</SidebarItem></SidebarGroup></SidebarContent></Sidebar></SidebarProvider>);
    expect(screen.getByText('collapsed')).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
  it('keeps arrow keys the same in right-to-left (up and down are vertical)', async () => {
    render(<div dir="rtl"><DirectionProvider dir="rtl">{ui()}</DirectionProvider></div>);
    screen.getByRole('link', {name: 'Overview'}).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', {name: 'Reports'})).toHaveFocus();
  });
  it('has no axe violations, expanded, collapsed and as a drawer', async () => {
    const {container, unmount} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    const c = render(ui({defaultCollapsed: true}));
    expect(await axe(c.container)).toHaveNoViolations();
    c.unmount();
    render(ui());
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations(); // the page behind is inert in a browser; jsdom does not model it
  });
});
