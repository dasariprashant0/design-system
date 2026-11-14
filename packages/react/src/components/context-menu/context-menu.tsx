'use client';
import {createContext, forwardRef, useContext, useEffect, useRef, useState, type HTMLAttributes, type PointerEvent} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';
import {setRefs} from '../../utils/overlay';
import {MenuContent, MenuContext, MenuItem, MenuLabel, MenuRoot, MenuSeparator, openWith, type MenuContentProps, type MenuItemProps, type MenuProps} from '../dropdown-menu/menu';

const Point = createContext<(x: number, y: number) => void>(() => {});

/** The root of a right-click (or long-press) menu. Put a `ContextMenuTrigger` and a `ContextMenuContent` inside. */
export function ContextMenu({children, ...props}: MenuProps) {
  const [at, setAt] = useState({x: 0, y: 0});
  const dot = useRef<HTMLSpanElement | null>(null);
  return (
    <MenuRoot {...props} extra={{anchor: () => dot.current}}>
      <Point.Provider value={(x, y) => setAt({x, y})}>{children}</Point.Provider>
      <span ref={dot} aria-hidden="true" style={{position: 'fixed', left: at.x, top: at.y, width: 0, height: 0, pointerEvents: 'none'}} />
    </MenuRoot>
  );
}

/** The area that opens the menu when right-clicked or long-pressed; use `asChild` to make your own element the area. */
export const ContextMenuTrigger = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & {
  /** Render your own element instead of a span; it receives the props and handlers. */
  asChild?: boolean;
}>(function ContextMenuTrigger({asChild, onContextMenu, onPointerDown, onPointerUp, onPointerMove, ...rest}, ref) {
  const c = useContext(MenuContext), at = useContext(Point);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const open = (x: number, y: number) => { at(x, y); openWith('panel'); c.setOpen(true); };
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      ref={(n: HTMLSpanElement | null) => setRefs(n, c.trigger, ref)} data-state={c.open ? 'open' : 'closed'} {...rest}
      onContextMenu={(e: React.MouseEvent) => { onContextMenu?.(e as never); if (e.defaultPrevented) return; e.preventDefault(); clearTimeout(timer.current); open(e.clientX, e.clientY); }}
      onPointerDown={(e: PointerEvent) => { onPointerDown?.(e as never); if (e.pointerType === 'touch') { const {clientX: x, clientY: y} = e; timer.current = setTimeout(() => open(x, y), 700); } }}
      onPointerMove={(e: PointerEvent) => { onPointerMove?.(e as never); clearTimeout(timer.current); }}
      onPointerUp={(e: PointerEvent) => { onPointerUp?.(e as never); clearTimeout(timer.current); }}
    />
  );
});

/** The floating panel that lists the menu entries, opened at the pointer. */
export const ContextMenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function ContextMenuContent({side = 'right', align = 'start', ...rest}, ref) {
  return <MenuContent ref={ref} side={side} align={align} {...rest} />;
});

/** A thin line that separates groups of entries. */
export const ContextMenuSeparator = MenuSeparator;
/** A non-interactive heading for a group of entries. */
export const ContextMenuLabel = MenuLabel;
export interface ContextMenuItemProps extends MenuItemProps {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
/** One action in the menu; call `onSelect` when it is chosen. */
export const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem({className, tone = 'default', ...rest}, ref) {
  return <MenuItem ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});
