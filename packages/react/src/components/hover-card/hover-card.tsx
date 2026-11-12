import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {HoverCard as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const HoverCard = Radix.Root;
export const HoverCardTrigger = Radix.Trigger;

export const HoverCardContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function HoverCardContent({className, sideOffset = 8, align = 'start', ...rest}, ref) {
  return (
    <Radix.Portal>
      <Radix.Content ref={ref} sideOffset={sideOffset} align={align} className={cx('popover', className)} {...rest} />
    </Radix.Portal>
  );
});
