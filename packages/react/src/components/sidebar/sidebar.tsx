'use client';
import {cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useId, type AnchorHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';
import {useControllableState} from '../../hooks/use-controllable-state';
import {useMediaQuery} from '../../hooks/use-media-query';
import {Button} from '../button';
import {IconButton} from '../icon-button';
import {Drawer, DrawerContent, DrawerTitle, DrawerTrigger} from '../drawer';
import {Tooltip, TooltipProvider} from '../tooltip';
import type {RenderLink} from '../link';

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}
const StateCtx = createContext<SidebarState | null>(null);
// Set by Sidebar so items know whether they sit in the drawer (never collapsed) and which links to render.
const PartCtx = createContext<{inDrawer: boolean; label: string; renderLink?: RenderLink}>({inDrawer: false, label: 'Main'});

/** The collapsed state and the mobile drawer state of the nearest `SidebarProvider`: `{collapsed, setCollapsed, toggle, mobileOpen, setMobileOpen}`. Throws outside a provider. Server rendering uses the initial state. */
export function useSidebar(): SidebarState {
  const s = useContext(StateCtx);
  if (!s) throw new Error('useSidebar must be used inside a SidebarProvider');
  return s;
}

export interface SidebarProviderProps {
  /** Whether the sidebar is collapsed to icons, when controlled. Pair with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Whether the sidebar starts collapsed when uncontrolled. Default false. */
  defaultCollapsed?: boolean;
  /** Called with the new state when the user collapses or expands the sidebar. Save it here (for example in localStorage) and pass it back as `defaultCollapsed` or `collapsed` to persist the choice. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Your layout: a `Sidebar`, plus any `SidebarToggle` or `SidebarTrigger` anywhere below. */
  children?: ReactNode;
}

/**
 * Holds the sidebar's collapsed state and the small-screen drawer state, so a `SidebarToggle` in the top bar can control a `Sidebar` elsewhere in the tree. `AppShell` includes one.
 * @example <SidebarProvider defaultCollapsed><Sidebar>...</Sidebar></SidebarProvider>
 */
export function SidebarProvider({collapsed, defaultCollapsed = false, onCollapsedChange, children}: SidebarProviderProps) {
  const [isCollapsed, setCollapsed] = useControllableState({value: collapsed, defaultValue: defaultCollapsed, onChange: onCollapsedChange});
  const [mobileOpen, setMobileOpen] = useControllableState({defaultValue: false});
  const wide = useMediaQuery('(min-width: 800px)');
  useEffect(() => { if (wide) setMobileOpen(false); }, [wide, setMobileOpen]); // a drawer left open must not outlive the small layout
  const state = {collapsed: isCollapsed, setCollapsed, toggle: () => setCollapsed(!isCollapsed), mobileOpen, setMobileOpen};
  return (
    <StateCtx.Provider value={state}>
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>{children}</Drawer>
    </StateCtx.Provider>
  );
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the navigation landmark, in the sidebar and in the drawer. Default "Main". */
  label?: string;
  /** Names the drawer on small screens (its dialog title). Default "Menu". */
  drawerTitle?: ReactNode;
  /** Renders each `SidebarItem` link, so a client router can handle the click. Default a plain `<a href>`. The returned element must forward its ref and spread extra props (collapsed tooltips need that). @example renderLink={({href, ...p}) => <NavLink to={href} {...p} />} */
  renderLink?: RenderLink;
  /** A `SidebarHeader`, `SidebarContent` and `SidebarFooter`. They render twice: in the sidebar (from 800px) and in the drawer (below 800px). */
  children: ReactNode;
}

/**
 * A navigation column that collapses to icons. Below 800px it is hidden and the same content opens in a left `Drawer` from a `SidebarTrigger`.
 * Must be inside a `SidebarProvider`.
 */
export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(function Sidebar({label = 'Main', drawerTitle = 'Menu', renderLink, children, className, ...rest}, ref) {
  const s = useSidebar();
  const close = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('a')) s.setMobileOpen(false); };
  return (
    <TooltipProvider delayDuration={300}>
      <div ref={ref} className={cx('sidebar', className)} data-collapsed={s.collapsed || undefined} {...rest}>
        <div className="sidebar-inner">
          <PartCtx.Provider value={{inDrawer: false, label, renderLink}}>{children}</PartCtx.Provider>
        </div>
      </div>
      <DrawerContent side="start" className="sidebar-drawer" aria-describedby={undefined} onClick={close}>
        <DrawerTitle>{drawerTitle}</DrawerTitle>
        <PartCtx.Provider value={{inDrawer: true, label, renderLink}}>{children}</PartCtx.Provider>
      </DrawerContent>
    </TooltipProvider>
  );
});

/** The top of the sidebar: brand and a `SidebarToggle`. Not shown in the small-screen drawer, whose title is the `Sidebar`'s `drawerTitle`. Read `useSidebar().collapsed` to show only the icon when collapsed. */
export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarHeader({className, ...rest}, ref) {
  return <div ref={ref} className={cx('sidebar-header', className)} {...rest} />;
});

/** The bottom of the sidebar: put a `SidebarGroup` of account, settings or help links in it. Stays at the bottom when the groups are short. */
export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarFooter({className, ...rest}, ref) {
  return <div ref={ref} className={cx('sidebar-footer', className)} {...rest} />;
});

/** The navigation landmark holding the groups. ArrowUp, ArrowDown, Home and End move focus between items (Tab still works). */
export const SidebarContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function SidebarContent({className, ...rest}, ref) {
  const {label} = useContext(PartCtx);
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    rest.onKeyDown?.(e);
    if (e.defaultPrevented || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('.sidebar-item')];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.min(items.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
    items[to]?.focus();
  };
  return <nav ref={ref} aria-label={label} className={cx('sidebar-content', className)} {...rest} onKeyDown={onKeyDown} />;
});

export interface SidebarGroupProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** A heading for the group. Hidden visually (a rule shows instead) when the sidebar is collapsed, still read by screen readers. */
  label?: ReactNode;
  /** `SidebarItem`s. */
  children: ReactNode;
}

/** A labelled list of items. */
export const SidebarGroup = forwardRef<HTMLUListElement, SidebarGroupProps>(function SidebarGroup({label, children, className, ...rest}, ref) {
  const id = useId();
  return (
    <div className="sidebar-group">
      {label && <div id={id} className="sidebar-group-label">{label}</div>}
      <ul ref={ref} aria-labelledby={label ? id : undefined} className={cx('sidebar-list', className)} {...rest}>{children}</ul>
    </div>
  );
});

export interface SidebarItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Where the link goes. Not needed with `asChild`. */
  href?: string;
  /** An inline SVG with `currentColor`; hidden from screen readers. Shown alone when the sidebar is collapsed. */
  icon?: ReactNode;
  /** The current page: sets `aria-current="page"` and the active style. */
  current?: boolean;
  /** Use the child (your router's link) as the anchor. Its text becomes the label. */
  asChild?: boolean;
  /** The label. Visually hidden when collapsed and shown in a tooltip instead. */
  children: ReactNode;
}

/** One link in the sidebar. Put it in a `SidebarGroup`. Use `asChild` or the `Sidebar`'s `renderLink` for a client router. */
export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(function SidebarItem({href, icon, current, asChild, children, className, ...rest}, ref) {
  const {collapsed} = useSidebar();
  const {inDrawer, renderLink} = useContext(PartCtx);
  const cls = cx('sidebar-item', className);
  const ariaCurrent = current ? ('page' as const) : undefined;
  const child = asChild && isValidElement(children) ? (children as ReactElement<{children?: ReactNode}>) : null;
  const text = child ? child.props.children : children;
  const inner = <>{icon && <span className="sidebar-icon" aria-hidden="true">{icon}</span>}<span className="sidebar-label">{text}</span></>;
  let link: ReactElement;
  if (child) link = <Slot.Root ref={ref} className={cls} aria-current={ariaCurrent} {...rest}>{cloneElement(child, undefined, inner)}</Slot.Root>;
  else if (renderLink && href !== undefined) link = renderLink({href, className: cls, 'aria-current': ariaCurrent, children: inner}) as ReactElement;
  else link = <a ref={ref} href={href} className={cls} aria-current={ariaCurrent} {...rest}>{inner}</a>;
  return <li>{collapsed && !inDrawer ? <Tooltip content={text} side="right">{link}</Tooltip> : link}</li>;
});

const PanelIcon = () => <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="3" width="12" height="10" /><path d="M6 3v10" /></svg>;

export interface SidebarToggleProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The button's accessible name. It reports expanded or collapsed through `aria-expanded`. Default "Toggle sidebar". */
  label?: string;
}

/** A button that collapses and expands the sidebar. Shown from 800px up; on small screens use `SidebarTrigger`. */
export const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(function SidebarToggle({label = 'Toggle sidebar', className, onClick, ...rest}, ref) {
  const s = useSidebar();
  return <IconButton ref={ref} size="sm" aria-label={label} aria-expanded={!s.collapsed} className={cx('sidebar-toggle', className)} {...rest} onClick={(e) => { onClick?.(e); s.toggle(); }}><PanelIcon /></IconButton>;
});

export interface SidebarTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The button text, which is also its name. Default "Menu". */
  children?: ReactNode;
}

/** The small-screen menu button: opens the sidebar in a drawer, and focus returns here on close. Hidden from 800px up. */
export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(function SidebarTrigger({children = 'Menu', className, ...rest}, ref) {
  useSidebar();
  return <DrawerTrigger asChild><Button ref={ref} size="sm" className={cx('sidebar-trigger', className)} {...rest}>{children}</Button></DrawerTrigger>;
});
