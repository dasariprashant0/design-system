import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {BlockDashboardShell} from './block-dashboard-shell';
import type {RenderLink} from '../link';

const nav = [{label: 'Overview', href: '/', current: true}, {label: 'Reports', href: '#reports'}];

describe('BlockDashboardShell', () => {
  it('renders the sidebar navigation, top bar and main content', () => {
    render(<BlockDashboardShell brand="Brand" nav={nav} topbar={<span>Ada</span>}><h1>Overview</h1></BlockDashboardShell>);
    const sidebar = screen.getByRole('navigation', {name: 'Main'});
    expect(within(sidebar).getByRole('link', {name: 'Overview'})).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('link', {name: 'Reports'})).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', {level: 1, name: 'Overview'}));
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });
  it('opens the same navigation in a drawer from the menu button, and closes on Escape', async () => {
    render(<BlockDashboardShell brand="Brand" nav={nav}>x</BlockDashboardShell>);
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    const dialog = screen.getByRole('dialog', {name: 'Brand'});
    expect(within(dialog).getByRole('link', {name: 'Reports'})).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', {name: 'Menu'})).toHaveFocus();
  });
  it('closes the drawer when a link is chosen', async () => {
    render(<BlockDashboardShell nav={nav}>x</BlockDashboardShell>);
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', {name: 'Reports'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('uses custom labels and forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<BlockDashboardShell ref={ref} nav={nav} navLabel="Primary" menuLabel="Navigation">x</BlockDashboardShell>);
    expect(screen.getByRole('navigation', {name: 'Primary'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Navigation'})).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
  it('has no axe violations, closed and open', async () => {
    const {container} = render(<BlockDashboardShell brand="Brand" nav={nav} topbar={<span>Ada</span>}><h1>Overview</h1></BlockDashboardShell>);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    expect(await axe(document.body)).toHaveNoViolations();
  });
  it('hands links to renderLink so a client router can take over', async () => {
    const go = vi.fn();
    const renderLink: RenderLink = ({href, children, ...p}) => <a {...p} href={href} data-router onClick={(e) => { e.preventDefault(); go(href); }}>{children}</a>;
    render(<BlockDashboardShell nav={nav} renderLink={renderLink}>x</BlockDashboardShell>);
    const link = within(screen.getByRole('navigation', {name: 'Main'})).getByRole('link', {name: 'Reports'});
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveClass('block-shell-link');
    expect(within(screen.getByRole('navigation', {name: 'Main'})).getByRole('link', {name: 'Overview'})).toHaveAttribute('aria-current', 'page');
    await userEvent.click(link);
    expect(go).toHaveBeenCalledWith('#reports');
  });
});
