import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Popover as RadixPopover} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a floating panel. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `PopoverTrigger` and `PopoverContent` inside. */
export const Popover = RadixPopover.Root;
/** The element (usually a `Button`) that toggles the popover; use `asChild` to render your own element. */
export const PopoverTrigger = RadixPopover.Trigger;
/** Positions the popover against this element instead of the trigger. */
export const PopoverAnchor = RadixPopover.Anchor;
/** An element that closes the popover when activated; use `asChild` to wrap your own button. */
export const PopoverClose = RadixPopover.Close;

/** A floating panel anchored to its trigger. Focus moves in, Escape closes and returns focus to the trigger. */
export const PopoverContent = forwardRef<ElementRef<typeof RadixPopover.Content>, ComponentPropsWithoutRef<typeof RadixPopover.Content>>(function PopoverContent({className, sideOffset = 8, align = 'start', ...rest}, ref) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content ref={ref} sideOffset={sideOffset} align={align} className={cx('popover', className)} {...rest} />
    </RadixPopover.Portal>
  );
});
