'use client';
import {createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject} from 'react';
import {cx} from '../../utils/cx';
import {setRefs} from '../../utils/overlay';
import {useIsRtl} from '../../utils/direction';
import {MenuContent, MenuContext, MenuItem, MenuLabel, MenuRoot, MenuSeparator, openWith, type MenuContentProps, type MenuItemProps} from '../dropdown-menu/menu';

interface Bar { open: string | null; setOpen: (id: string | null) => void; ref: RefObject<HTMLDivElement | null>; move: (dir: 1 | -1, from: Element | null) => void }
const BarContext = createContext<Bar>(null as never);
const Key = createContext('');

const TRIGGER = '[role=menuitem][aria-haspopup=menu]';

/** A horizontal bar of menus, like the File and Edit menus of a desktop app. Arrow keys move between triggers. */
export const Menubar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Menubar({className, onKeyDown, onFocus, ...rest}, ref) {
  const [open, setOpen] = useState<string | null>(null);
  const el = useRef<HTMLDivElement | null>(null);
  const isRtl = useIsRtl();
  const triggers = () => [...el.current!.querySelectorAll<HTMLElement>(TRIGGER)];
  const rove = (cur: HTMLElement | undefined) => triggers().forEach((t) => { t.tabIndex = t === cur ? 0 : -1; }); // one Tab stop for the whole bar
  useEffect(() => { const ts = triggers(); rove(ts.find((t) => t.tabIndex === 0) ?? ts[0]); });
  const move = (dir: 1 | -1, from: Element | null) => {
    const ts = triggers(), at = ts.indexOf(from as HTMLElement);
    if (at < 0) return;
    const next = ts[(at + dir * (isRtl(el.current) ? -1 : 1) + ts.length) % ts.length]!;
    if (open !== null) { openWith('first'); setOpen(next.dataset.menu!); } // a menu is open: swap it for the neighbour (its panel takes focus)
    else next.focus();
  };
  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !(e.target as Element).matches?.(TRIGGER)) return;
    const ts = triggers();
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1, e.target as Element); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); ts[e.key === 'Home' ? 0 : ts.length - 1]?.focus(); }
  };
  return (
    <BarContext.Provider value={{open, setOpen, ref: el, move}}>
      <div ref={(n) => setRefs(n, el, ref)} role="menubar" className={cx('menubar', className)} {...rest} onKeyDown={keydown} onFocus={(e) => { onFocus?.(e); if ((e.target as Element).matches(TRIGGER)) rove(e.target as HTMLElement); }} />
    </BarContext.Provider>
  );
});

/** One menu in the bar. Put a `MenubarTrigger` and a `MenubarContent` inside. */
export function MenubarMenu({children}: {children?: ReactNode}) {
  const bar = useContext(BarContext), id = useId();
  return (
    <Key.Provider value={id}>
      <MenuRoot open={bar.open === id} onOpenChange={(o) => bar.setOpen(o ? id : bar.open === id ? null : bar.open)} extra={{step: bar.move}}>{children}</MenuRoot>
    </Key.Provider>
  );
}

/** The button in the bar that opens its menu. */
export const MenubarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function MenubarTrigger({className, onClick, onKeyDown, onPointerEnter, ...rest}, ref) {
  const c = useContext(MenuContext), bar = useContext(BarContext), id = useContext(Key);
  return (
    <button
      ref={(n) => setRefs(n, c.trigger, ref)} type="button" role="menuitem" id={c.triggerId} data-menu={id} aria-haspopup="menu" aria-expanded={c.open} aria-controls={c.open ? c.menuId : undefined} data-state={c.open ? 'open' : 'closed'}
      className={cx('menubar-trigger', className)} {...rest}
      onClick={(e) => { onClick?.(e); if (e.defaultPrevented) return; openWith(e.detail === 0 ? 'first' : 'panel'); c.setOpen(!c.open); }}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); openWith(e.key === 'ArrowDown' ? 'first' : 'last'); c.setOpen(true); } }}
      onPointerEnter={(e) => { onPointerEnter?.(e); if (bar.open !== null && !c.open) { openWith('panel'); c.setOpen(true); } }}
    />
  );
});

/** The floating panel that lists the menu entries, rendered in a portal. Opens 4px below the trigger, aligned to its start. */
export const MenubarContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenubarContent({align = 'start', sideOffset = 4, ...rest}, ref) {
  return <MenuContent ref={ref} align={align} sideOffset={sideOffset} {...rest} />;
});

/** A thin line that separates groups of entries. */
export const MenubarSeparator = MenuSeparator;
/** A non-interactive heading for a group of entries. */
export const MenubarLabel = MenuLabel;
export interface MenubarItemProps extends MenuItemProps {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
/** One action in the menu; call `onSelect` when it is chosen. */
export const MenubarItem = forwardRef<HTMLDivElement, MenubarItemProps>(function MenubarItem({className, tone = 'default', ...rest}, ref) {
  return <MenuItem ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});
