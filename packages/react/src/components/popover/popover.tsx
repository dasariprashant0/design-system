import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Popover as RadixPopover} from 'radix-ui';
import {cx} from '../../utils/cx';

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;

/** A floating panel anchored to its trigger. Focus moves in, Escape closes and returns focus to the trigger. */
export const PopoverContent = forwardRef<ElementRef<typeof RadixPopover.Content>, ComponentPropsWithoutRef<typeof RadixPopover.Content>>(function PopoverContent({className, sideOffset = 8, align = 'start', ...rest}, ref) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content ref={ref} sideOffset={sideOffset} align={align} className={cx('popover', className)} {...rest} />
    </RadixPopover.Portal>
  );
});
