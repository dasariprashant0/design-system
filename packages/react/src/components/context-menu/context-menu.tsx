import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {ContextMenu as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const ContextMenu = Radix.Root;
export const ContextMenuTrigger = Radix.Trigger;

export const ContextMenuContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function ContextMenuContent({className, ...rest}, ref) {
  return <Radix.Portal><Radix.Content ref={ref} className={cx('menu-content', className)} {...rest} /></Radix.Portal>;
});

export const ContextMenuSeparator = forwardRef<ElementRef<typeof Radix.Separator>, ComponentPropsWithoutRef<typeof Radix.Separator>>(function ContextMenuSeparator({className, ...rest}, ref) {
  return <Radix.Separator ref={ref} className={cx('menu-sep', className)} {...rest} />;
});
export const ContextMenuLabel = forwardRef<ElementRef<typeof Radix.Label>, ComponentPropsWithoutRef<typeof Radix.Label>>(function ContextMenuLabel({className, ...rest}, ref) {
  return <Radix.Label ref={ref} className={cx('menu-label', className)} {...rest} />;
});
export interface ContextMenuItemProps extends ComponentPropsWithoutRef<typeof Radix.Item> {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
export const ContextMenuItem = forwardRef<ElementRef<typeof Radix.Item>, ContextMenuItemProps>(function ContextMenuItem({className, tone = 'default', ...rest}, ref) {
  return <Radix.Item ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});
