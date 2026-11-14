'use client';
import {forwardRef, useContext, type ButtonHTMLAttributes, type MouseEvent} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';
import {setRefs} from '../../utils/overlay';
import {MenuCheckboxItem, MenuContent, MenuContext, MenuGroup, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuRoot, MenuSeparator, openWith, type MenuCheckboxItemProps, type MenuContentProps, type MenuItemProps, type MenuProps, type MenuRadioGroupProps} from './menu';

/** The root of a menu opened by a button. Put a `DropdownMenuTrigger` and `DropdownMenuContent` inside. */
export function DropdownMenu(props: MenuProps) { return <MenuRoot {...props} />; }

/** The button that opens the menu; use `asChild` to render your own element. Enter, Space and ArrowDown open it with the first item focused, ArrowUp with the last. */
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Render your own element instead of a button; it receives the props and handlers. */
  asChild?: boolean;
}>(function DropdownMenuTrigger({asChild, onClick, onKeyDown, ...rest}, ref) {
  const c = useContext(MenuContext);
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      ref={(n: HTMLButtonElement | null) => setRefs(n, c.trigger, ref)} type={asChild ? undefined : 'button'} id={c.triggerId} aria-haspopup="menu" aria-expanded={c.open} aria-controls={c.open ? c.menuId : undefined} data-state={c.open ? 'open' : 'closed'}
      {...rest}
      onClick={(e: MouseEvent<HTMLButtonElement>) => { onClick?.(e); if (e.defaultPrevented) return; openWith(e.detail === 0 ? 'first' : 'panel'); c.setOpen(!c.open); }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => { onKeyDown?.(e); if (!e.defaultPrevented && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); openWith(e.key === 'ArrowDown' ? 'first' : 'last'); c.setOpen(true); } }}
    />
  );
});

/** Groups related entries so assistive tech announces them together. */
export const DropdownMenuGroup = MenuGroup;
/** Holds a set of `DropdownMenuRadioItem`s where one is chosen; use `value` and `onValueChange`. */
export const DropdownMenuRadioGroup = (props: MenuRadioGroupProps) => <MenuRadioGroup {...props} />;

/** The floating panel that lists the entries, rendered in a portal. Opens 6px from the trigger, aligned to its start. */
export const DropdownMenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function DropdownMenuContent({sideOffset = 6, align = 'start', ...rest}, ref) {
  return <MenuContent ref={ref} sideOffset={sideOffset} align={align} {...rest} />;
});

export interface DropdownMenuItemProps extends MenuItemProps {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
/** One action in the menu; call `onSelect` when it is chosen. */
export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem({className, tone = 'default', ...rest}, ref) {
  return <MenuItem ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});

/** A menu entry that toggles on and off; use `checked` and `onCheckedChange`. */
export const DropdownMenuCheckboxItem = (props: MenuCheckboxItemProps) => <MenuCheckboxItem {...props} />;
/** A menu entry that is one choice among a `DropdownMenuRadioGroup`; give it a `value`. */
export const DropdownMenuRadioItem = MenuRadioItem;
/** A non-interactive heading for a group of entries. */
export const DropdownMenuLabel = MenuLabel;
/** A thin line that separates groups of entries. */
export const DropdownMenuSeparator = MenuSeparator;
