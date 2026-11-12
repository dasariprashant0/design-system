'use client';
import {forwardRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Button} from '../button';
import {Container} from '../container';
import {Drawer, DrawerContent, DrawerTitle, DrawerTrigger} from '../drawer';
import {Stack} from '../stack';

export interface ShellNavItem {
  label: ReactNode;
  href: string;
  /** The current page: sets `aria-current="page"`. */
  current?: boolean;
}

export interface BlockDashboardShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Your logo or name, shown above the navigation. */
  brand?: ReactNode;
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

function Nav({items, label}: {items: ShellNavItem[]; label: string}) {
  return (
    <nav aria-label={label} className="block-shell-nav">
      <Stack gap={1}>
        {items.map((it, i) => (
          <a key={i} href={it.href} className="block-shell-link" aria-current={it.current ? 'page' : undefined}>{it.label}</a>
        ))}
      </Stack>
    </nav>
  );
}

/**
 * An app frame: sidebar, top bar and content. Wide screens show the sidebar; narrow ones show a "Menu" button that opens
 * the same navigation in a left `Drawer`. Put one `h1` in the content.
 */
export const BlockDashboardShell = forwardRef<HTMLDivElement, BlockDashboardShellProps>(function BlockDashboardShell({brand, nav, navLabel = 'Main', topbar, menuLabel = 'Menu', children, className, ...rest}, ref) {
  const [open, setOpen] = useState(false);
  return (
    <div ref={ref} className={cx('block-shell', className)} {...rest}>
      <aside className="block-shell-side">
        {brand && <div className="block-shell-brand">{brand}</div>}
        <Nav items={nav} label={navLabel} />
      </aside>
      <div className="block-shell-body">
        <header className="block-shell-top">
          <div className="block-shell-menu">
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild><Button size="sm">{menuLabel}</Button></DrawerTrigger>
              <DrawerContent side="left" aria-describedby={undefined}>
                <DrawerTitle>{brand ?? menuLabel}</DrawerTitle>
                <div onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); }}>
                  <Nav items={nav} label={navLabel} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="block-shell-top-end">{topbar}</div>
        </header>
        <Container asChild size="full"><main className="block-shell-content">{children}</main></Container>
      </div>
    </div>
  );
});
