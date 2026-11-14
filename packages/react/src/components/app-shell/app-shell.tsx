'use client';
import {forwardRef, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {SidebarProvider} from '../sidebar';

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** A `Navbar`. Sticks to the top while the page scrolls. */
  navbar?: ReactNode;
  /** A `Sidebar`. Hidden below 800px (its drawer opens from a `SidebarTrigger`). */
  sidebar?: ReactNode;
  /** Secondary content in a complementary landmark: a details panel, help, activity. Beside the page from 1100px, below it on narrower screens. */
  aside?: ReactNode;
  /** Names the aside landmark. Default "Details". */
  asideLabel?: string;
  /** Text of the skip link, the first thing a keyboard user can reach. Default "Skip to main content". */
  skipLinkLabel?: string;
  /** The `id` of the main region, which the skip link targets. Default is generated. */
  mainId?: string;
  /**
   * `page` (default): the page scrolls; the navbar and sidebar stay in view. `contained`: the shell fills its height and the sidebar and main scroll on their own.
   * Set the height with the CSS variable `--app-shell-height` (default full viewport); in `page` mode `--app-shell-min-height` sets the minimum.
   */
  scroll?: 'page' | 'contained';
  /** Whether the sidebar is collapsed to icons, when controlled. Pair with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Whether the sidebar starts collapsed when uncontrolled. Default false. */
  defaultCollapsed?: boolean;
  /** Called with the new collapsed state. Save it to persist the choice, then pass it back as `defaultCollapsed`. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** The page. Put one h1 in it (a `PageHeader` does). */
  children: ReactNode;
}

/**
 * The frame of an app: skip link, navbar, sidebar, main and an optional aside, as one responsive grid with the right landmarks
 * (banner, navigation, main, complementary). It owns the `SidebarProvider`, so a `SidebarToggle` or `SidebarTrigger` anywhere inside works.
 * @example <AppShell navbar={<Navbar brand="Acme" leading={<SidebarTrigger />} />} sidebar={<Sidebar>...</Sidebar>}><PageHeader title="Overview" /></AppShell>
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell({navbar, sidebar, aside, asideLabel = 'Details', skipLinkLabel = 'Skip to main content', mainId, scroll = 'page', collapsed, defaultCollapsed, onCollapsedChange, children, className, ...rest}, ref) {
  const generated = useId();
  const id = mainId ?? `main-${generated.replace(/:/g, '')}`;
  return (
    <SidebarProvider collapsed={collapsed} defaultCollapsed={defaultCollapsed} onCollapsedChange={onCollapsedChange}>
      <div ref={ref} className={cx('app-shell', className)} data-scroll={scroll} {...rest}>
        <a className="skip-link" href={`#${id}`}>{skipLinkLabel}</a>
        {navbar && <div className="app-shell-navbar">{navbar}</div>}
        {sidebar}
        <main id={id} tabIndex={-1} className="app-shell-main">{children}</main>
        {aside && <aside aria-label={asideLabel} className="app-shell-aside">{aside}</aside>}
      </div>
    </SidebarProvider>
  );
});
