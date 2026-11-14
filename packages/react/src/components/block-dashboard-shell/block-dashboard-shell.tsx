'use client';
import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {AppShell} from '../app-shell';
import {Navbar} from '../navbar';
import {Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarItem, SidebarTrigger} from '../sidebar';
import type {RenderLink} from '../link';

export interface ShellNavItem {
  label: ReactNode;
  href: string;
  /** The current page: sets `aria-current="page"`. */
  current?: boolean;
}

export interface BlockDashboardShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Your logo or name, shown above the navigation. */
  brand?: ReactNode;
  /** Renders each navigation link, so a client router can handle the click. Default a plain `<a href>`. @example renderLink={({href, ...p}) => <NavLink to={href} {...p} />} */
  renderLink?: RenderLink;
  /** The navigation links shown in the sidebar and in the small-screen drawer. */
  nav: ShellNavItem[];
  /** Names the navigation landmark. Default "Main". */
  navLabel?: string;
  /** Right side of the top bar: search, account menu. */
  topbar?: ReactNode;
  /** Text of the button that opens the navigation drawer on small screens. Default "Menu". */
  menuLabel?: string;
  /** The page: put its h1 inside. */
  children: ReactNode;
}

/**
 * An app frame: sidebar, top bar and content, built from `AppShell`, `Sidebar` and `Navbar`. Wide screens show the sidebar; narrow ones show a "Menu" button that opens
 * the same navigation in a left `Drawer`. Put one `h1` in the content.
 * Pass `renderLink` to use a client router (React Router, Next.js) for the links.
 */
export const BlockDashboardShell = forwardRef<HTMLDivElement, BlockDashboardShellProps>(function BlockDashboardShell({brand, nav, renderLink, navLabel = 'Main', topbar, menuLabel = 'Menu', children, className, ...rest}, ref) {
  return (
    <AppShell
      ref={ref}
      className={cx('block-shell', className)}
      navbar={<Navbar leading={<SidebarTrigger>{menuLabel}</SidebarTrigger>} actions={topbar} />}
      sidebar={(
        <Sidebar label={navLabel} drawerTitle={brand ?? menuLabel} renderLink={renderLink}>
          {brand && <SidebarHeader><div className="block-shell-brand">{brand}</div></SidebarHeader>}
          <SidebarContent>
            <SidebarGroup>
              {nav.map((it, i) => <SidebarItem key={i} href={it.href} current={it.current} className="block-shell-link">{it.label}</SidebarItem>)}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      )}
      {...rest}
    >
      {children}
    </AppShell>
  );
});
