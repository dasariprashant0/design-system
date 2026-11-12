import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {DropdownMenu as RadixMenu} from 'radix-ui';
import {cx} from '../../utils/cx';

export const DropdownMenu = RadixMenu.Root;
export const DropdownMenuTrigger = RadixMenu.Trigger;
export const DropdownMenuGroup = RadixMenu.Group;
export const DropdownMenuRadioGroup = RadixMenu.RadioGroup;

export const DropdownMenuContent = forwardRef<ElementRef<typeof RadixMenu.Content>, ComponentPropsWithoutRef<typeof RadixMenu.Content>>(function DropdownMenuContent({className, sideOffset = 6, align = 'start', ...rest}, ref) {
  return <RadixMenu.Portal><RadixMenu.Content ref={ref} sideOffset={sideOffset} align={align} className={cx('menu-content', className)} {...rest} /></RadixMenu.Portal>;
});

export interface DropdownMenuItemProps extends ComponentPropsWithoutRef<typeof RadixMenu.Item> {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
export const DropdownMenuItem = forwardRef<ElementRef<typeof RadixMenu.Item>, DropdownMenuItemProps>(function DropdownMenuItem({className, tone = 'default', ...rest}, ref) {
  return <RadixMenu.Item ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});

export const DropdownMenuCheckboxItem = forwardRef<ElementRef<typeof RadixMenu.CheckboxItem>, ComponentPropsWithoutRef<typeof RadixMenu.CheckboxItem>>(function DropdownMenuCheckboxItem({className, children, ...rest}, ref) {
  return <RadixMenu.CheckboxItem ref={ref} className={cx('menu-item', className)} {...rest}><span className="menu-item-check"><span className="menu-indicator"><RadixMenu.ItemIndicator>✓</RadixMenu.ItemIndicator></span>{children}</span></RadixMenu.CheckboxItem>;
});

export const DropdownMenuRadioItem = forwardRef<ElementRef<typeof RadixMenu.RadioItem>, ComponentPropsWithoutRef<typeof RadixMenu.RadioItem>>(function DropdownMenuRadioItem({className, children, ...rest}, ref) {
  return <RadixMenu.RadioItem ref={ref} className={cx('menu-item', className)} {...rest}><span className="menu-item-check"><span className="menu-indicator"><RadixMenu.ItemIndicator>●</RadixMenu.ItemIndicator></span>{children}</span></RadixMenu.RadioItem>;
});

export const DropdownMenuLabel = forwardRef<ElementRef<typeof RadixMenu.Label>, ComponentPropsWithoutRef<typeof RadixMenu.Label>>(function DropdownMenuLabel({className, ...rest}, ref) {
  return <RadixMenu.Label ref={ref} className={cx('menu-label', className)} {...rest} />;
});
export const DropdownMenuSeparator = forwardRef<ElementRef<typeof RadixMenu.Separator>, ComponentPropsWithoutRef<typeof RadixMenu.Separator>>(function DropdownMenuSeparator({className, ...rest}, ref) {
  return <RadixMenu.Separator ref={ref} className={cx('menu-sep', className)} {...rest} />;
});
