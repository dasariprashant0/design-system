import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {DropdownMenu as RadixMenu} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a menu opened by a button. Put a `DropdownMenuTrigger` and `DropdownMenuContent` inside. */
export const DropdownMenu = RadixMenu.Root;
/** The button that opens the menu; use `asChild` to render your own element. */
export const DropdownMenuTrigger = RadixMenu.Trigger;
/** Groups related entries so assistive tech announces them together. */
export const DropdownMenuGroup = RadixMenu.Group;
/** Holds a set of `DropdownMenuRadioItem`s where one is chosen; use `value` and `onValueChange`. */
export const DropdownMenuRadioGroup = RadixMenu.RadioGroup;

/** The floating panel that lists the entries, rendered in a portal. Opens 6px from the trigger, aligned to its start. */
export const DropdownMenuContent = forwardRef<ElementRef<typeof RadixMenu.Content>, ComponentPropsWithoutRef<typeof RadixMenu.Content>>(function DropdownMenuContent({className, sideOffset = 6, align = 'start', ...rest}, ref) {
  return <RadixMenu.Portal><RadixMenu.Content ref={ref} sideOffset={sideOffset} align={align} className={cx('menu-content', className)} {...rest} /></RadixMenu.Portal>;
});

export interface DropdownMenuItemProps extends ComponentPropsWithoutRef<typeof RadixMenu.Item> {
  /** `danger` highlights in the danger colour. */
  tone?: 'default' | 'danger';
}
/** One action in the menu; call `onSelect` when it is chosen. */
export const DropdownMenuItem = forwardRef<ElementRef<typeof RadixMenu.Item>, DropdownMenuItemProps>(function DropdownMenuItem({className, tone = 'default', ...rest}, ref) {
  return <RadixMenu.Item ref={ref} data-variant={tone} className={cx('menu-item', className)} {...rest} />;
});

/** A menu entry that toggles on and off; use `checked` and `onCheckedChange`. */
export const DropdownMenuCheckboxItem = forwardRef<ElementRef<typeof RadixMenu.CheckboxItem>, ComponentPropsWithoutRef<typeof RadixMenu.CheckboxItem>>(function DropdownMenuCheckboxItem({className, children, ...rest}, ref) {
  return <RadixMenu.CheckboxItem ref={ref} className={cx('menu-item', className)} {...rest}><span className="menu-item-check"><span className="menu-indicator"><RadixMenu.ItemIndicator>✓</RadixMenu.ItemIndicator></span>{children}</span></RadixMenu.CheckboxItem>;
});

/** A menu entry that is one choice among a `DropdownMenuRadioGroup`; give it a `value`. */
export const DropdownMenuRadioItem = forwardRef<ElementRef<typeof RadixMenu.RadioItem>, ComponentPropsWithoutRef<typeof RadixMenu.RadioItem>>(function DropdownMenuRadioItem({className, children, ...rest}, ref) {
  return <RadixMenu.RadioItem ref={ref} className={cx('menu-item', className)} {...rest}><span className="menu-item-check"><span className="menu-indicator"><RadixMenu.ItemIndicator>●</RadixMenu.ItemIndicator></span>{children}</span></RadixMenu.RadioItem>;
});

/** A non-interactive heading for a group of entries. */
export const DropdownMenuLabel = forwardRef<ElementRef<typeof RadixMenu.Label>, ComponentPropsWithoutRef<typeof RadixMenu.Label>>(function DropdownMenuLabel({className, ...rest}, ref) {
  return <RadixMenu.Label ref={ref} className={cx('menu-label', className)} {...rest} />;
});
/** A thin line that separates groups of entries. */
export const DropdownMenuSeparator = forwardRef<ElementRef<typeof RadixMenu.Separator>, ComponentPropsWithoutRef<typeof RadixMenu.Separator>>(function DropdownMenuSeparator({className, ...rest}, ref) {
  return <RadixMenu.Separator ref={ref} className={cx('menu-sep', className)} {...rest} />;
});
