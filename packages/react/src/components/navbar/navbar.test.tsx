import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Navbar} from './navbar';
import type {RenderLink} from '../link';

const links = [{label: 'Docs', href: '/docs', current: true}, {label: 'Pricing', href: '/pricing'}];

describe('Navbar', () => {
  it('is a banner with a named navigation, brand and actions', () => {
    render(<Navbar brand="Acme" links={links} actions={<button>Sign in</button>} />);
    const banner = screen.getByRole('banner');
    expect(within(banner).getByText('Acme')).toBeInTheDocument();
    const nav = within(banner).getByRole('navigation', {name: 'Main'});
    expect(within(nav).getByRole('link', {name: 'Docs'})).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', {name: 'Pricing'})).not.toHaveAttribute('aria-current');
    expect(within(banner).getByRole('button', {name: 'Sign in'})).toBeInTheDocument();
  });
  it('sets data-sticky only when sticky', () => {
    const {rerender} = render(<Navbar brand="A" />);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-sticky');
    rerender(<Navbar brand="A" sticky />);
    expect(screen.getByRole('banner')).toHaveAttribute('data-sticky');
  });
  it('has no menu button without links', () => {
    render(<Navbar brand="A" />);
    expect(screen.queryByRole('button', {name: 'Menu'})).toBeNull();
  });
  it('opens the links in a drawer, closes on Escape and returns focus', async () => {
    render(<Navbar brand="Acme" links={links} menuLabel="Navigation" />);
    const menu = screen.getByRole('button', {name: 'Navigation'});
    await userEvent.click(menu);
    const dialog = screen.getByRole('dialog', {name: 'Acme'});
    expect(within(dialog).getByRole('link', {name: 'Pricing'})).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(menu).toHaveFocus();
  });
  it('closes the drawer when a link is chosen', async () => {
    render(<Navbar brand="Acme" links={links} />);
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', {name: 'Pricing'}));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('hands links to renderLink and forwards the ref', async () => {
    const go = vi.fn();
    const renderLink: RenderLink = ({href, children, ...p}) => <a {...p} href={href} data-router onClick={(e) => { e.preventDefault(); go(href); }}>{children}</a>;
    const ref = {current: null as HTMLElement | null};
    render(<Navbar ref={ref} links={links} renderLink={renderLink} linksLabel="Primary" />);
    const link = within(screen.getByRole('navigation', {name: 'Primary'})).getByRole('link', {name: 'Pricing'});
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveClass('navbar-link');
    await userEvent.click(link);
    expect(go).toHaveBeenCalledWith('/pricing');
    expect(ref.current?.tagName).toBe('HEADER');
  });
  it('has no axe violations, closed and open', async () => {
    const {container} = render(<Navbar brand="Acme" links={links} actions={<button>Sign in</button>} />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', {name: 'Menu'}));
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations(); // the page behind is inert in a browser; jsdom does not model it
  });
});
