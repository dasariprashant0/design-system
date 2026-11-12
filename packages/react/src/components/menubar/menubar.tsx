import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Menubar as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const MenubarMenu = Radix.Menu;

export const Menubar = forwardRef<ElementRef<typeof Radix.Root>, ComponentPropsWithoutRef<typeof Radix.Root>>(function Menubar({className, ...rest}, ref) {
  return <Radix.Root ref={ref} className={cx('menubar', className)} {...rest} />;
});
export const MenubarTrigger = forwardRef<ElementRef<typeof Radix.Trigger>, ComponentPropsWithoutRef<typeof Radix.Trigger>>(function MenubarTrigger({className, ...rest}, ref) {
  return <Radix.Trigger ref={ref} className={cx('menubar-trigger', className)} {...rest} />;
});
export const MenubarContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function MenubarContent({className, align = 'start', sideOffset = 4, ...rest}, ref) {
  return <Radix.Portal><Radix.Content ref={ref} align={align} sideOffset={sideOffset} className={cx('menu-content', className)} {...rest} /></Radix.Portal>;
});

export const MenubarSeparator = forwardRef<ElementRef<typeof Radix.Separator>, ComponentPropsWithoutRef<typeof Radix.Separator>>(function MenubarSeparator({className, ...rest}, ref) {
  return <Radix.Separator ref={ref} className={cx('menu-sep', className)} {...rest} />;
});
export const MenubarLabel = forwardRef<ElementRef<typeof Radix.Label>, ComponentPropsWithoutRef<typeof Radix.Label>>(function MenubarLabel({className, ...rest}, ref) {
  return <Radix.Label ref={ref} className={cx('menu-label', className)} {...rest} />;
});
export interface MenubarItemProps extends ComponentPropsWithoutRef<typeof Radix.Item> {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
export const MenubarItem = forwardRef<ElementRef<typeof Radix.Item>, MenubarItemProps>(function MenubarItem({className, tone = 'default', ...rest}, ref) {
  return <Radix.Item ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});
