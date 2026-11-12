import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Menubar as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** One menu in the bar. Put a `MenubarTrigger` and a `MenubarContent` inside. */
export const MenubarMenu = Radix.Menu;

/** A horizontal bar of menus, like the File and Edit menus of a desktop app. Arrow keys move between triggers. */
export const Menubar = forwardRef<ElementRef<typeof Radix.Root>, ComponentPropsWithoutRef<typeof Radix.Root>>(function Menubar({className, ...rest}, ref) {
  return <Radix.Root ref={ref} className={cx('menubar', className)} {...rest} />;
});
/** The button in the bar that opens its menu. */
export const MenubarTrigger = forwardRef<ElementRef<typeof Radix.Trigger>, ComponentPropsWithoutRef<typeof Radix.Trigger>>(function MenubarTrigger({className, ...rest}, ref) {
  return <Radix.Trigger ref={ref} className={cx('menubar-trigger', className)} {...rest} />;
});
/** The floating panel that lists the menu entries, rendered in a portal. Opens 4px below the trigger, aligned to its start. */
export const MenubarContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function MenubarContent({className, align = 'start', sideOffset = 4, ...rest}, ref) {
  return <Radix.Portal><Radix.Content ref={ref} align={align} sideOffset={sideOffset} className={cx('menu-content', className)} {...rest} /></Radix.Portal>;
});

/** A thin line that separates groups of entries. */
export const MenubarSeparator = forwardRef<ElementRef<typeof Radix.Separator>, ComponentPropsWithoutRef<typeof Radix.Separator>>(function MenubarSeparator({className, ...rest}, ref) {
  return <Radix.Separator ref={ref} className={cx('menu-sep', className)} {...rest} />;
});
/** A non-interactive heading for a group of entries. */
export const MenubarLabel = forwardRef<ElementRef<typeof Radix.Label>, ComponentPropsWithoutRef<typeof Radix.Label>>(function MenubarLabel({className, ...rest}, ref) {
  return <Radix.Label ref={ref} className={cx('menu-label', className)} {...rest} />;
});
export interface MenubarItemProps extends ComponentPropsWithoutRef<typeof Radix.Item> {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
/** One action in the menu; call `onSelect` when it is chosen. */
export const MenubarItem = forwardRef<ElementRef<typeof Radix.Item>, MenubarItemProps>(function MenubarItem({className, tone = 'default', ...rest}, ref) {
  return <Radix.Item ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});
