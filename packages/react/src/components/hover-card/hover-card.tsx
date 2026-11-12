import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {HoverCard as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** The root of a card that shows extra detail when its trigger is hovered or focused. Put a `HoverCardTrigger` and `HoverCardContent` inside. */
export const HoverCard = Radix.Root;
/** The element (usually a link) that shows the card on hover or focus; use `asChild` to render your own element. */
export const HoverCardTrigger = Radix.Trigger;

/** The floating card, rendered in a portal. Opens 8px from the trigger, aligned to its start. Keep it supplementary: it is not reachable by touch. */
export const HoverCardContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function HoverCardContent({className, sideOffset = 8, align = 'start', ...rest}, ref) {
  return (
    <Radix.Portal>
      <Radix.Content ref={ref} sideOffset={sideOffset} align={align} className={cx('popover', className)} {...rest} />
    </Radix.Portal>
  );
});
