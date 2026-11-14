'use client';
import {forwardRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Button} from '../button';
import {Drawer, DrawerContent, DrawerTitle, DrawerTrigger} from '../drawer';
import type {RenderLink} from '../link';

export interface NavbarLink {
  /** The link text. */
  label: ReactNode;
  /** Where it goes. */
  href: string;
  /** The current page: sets `aria-current="page"`. */
  current?: boolean;
}

export interface NavbarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Your logo or name, at the start of the bar. */
  brand?: ReactNode;
  /** Primary links, shown in the bar from 800px and in a drawer opened by a menu button below that. Leave out when the bar only holds actions. */
  links?: NavbarLink[];
  /** Names the links' navigation landmark. Default "Main". */
  linksLabel?: string;
  /** Renders each link, so a client router can handle the click. Default a plain `<a href>`. @example renderLink={({href, ...p}) => <NavLink to={href} {...p} />} */
  renderLink?: RenderLink;
  /** Goes before the brand: put a `SidebarTrigger` here when the bar sits above a `Sidebar`. */
  leading?: ReactNode;
  /** The end of the bar: search, a command palette button, an account menu. */
  actions?: ReactNode;
  /** Text of the button that opens the links drawer on small screens. Default "Menu". */
  menuLabel?: string;
  /** Keeps the bar at the top while the page scrolls. Default false. `AppShell` already does this for its navbar. */
  sticky?: boolean;
}

/**
 * A top bar: brand, links, actions. It is a `header` (banner landmark) with the links in their own labelled `nav`, so a skip link can jump past both.
 * Below 800px the links move into a drawer behind a menu button.
 * @example <Navbar brand="Acme" links={[{label: 'Docs', href: '/docs'}]} actions={<Button size="sm">Sign in</Button>} />
 */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar({brand, links = [], linksLabel = 'Main', renderLink, leading, actions, menuLabel = 'Menu', sticky = false, className, ...rest}, ref) {
  const [open, setOpen] = useState(false);
  const list = (
    <ul className="navbar-list">
      {links.map((l, i) => {
        const p = {href: l.href, className: 'navbar-link', 'aria-current': l.current ? ('page' as const) : undefined, children: l.label};
        return <li key={i}>{renderLink ? renderLink(p) : <a {...p} />}</li>;
      })}
    </ul>
  );
  return (
    <header ref={ref} className={cx('navbar', className)} data-sticky={sticky || undefined} {...rest}>
      {leading}
      {brand && <div className="navbar-brand">{brand}</div>}
      {links.length > 0 && <nav aria-label={linksLabel} className="navbar-links">{list}</nav>}
      <div className="navbar-actions">
        {actions}
        {links.length > 0 && (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild><Button size="sm" className="navbar-menu">{menuLabel}</Button></DrawerTrigger>
            <DrawerContent side="end" className="navbar-drawer" aria-describedby={undefined} onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); }}>
              <DrawerTitle>{brand ?? menuLabel}</DrawerTitle>
              <nav aria-label={linksLabel}>{list}</nav>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </header>
  );
});
