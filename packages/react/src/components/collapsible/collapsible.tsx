import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Collapsible as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

/** A single open-and-close region. Holds the open state (`open`, `defaultOpen`, `onOpenChange`); put a `CollapsibleTrigger` and `CollapsibleContent` inside. */
export const Collapsible = Radix.Root;
/** The button that toggles the region; use `asChild` to render your own element. */
export const CollapsibleTrigger = Radix.Trigger;

/** The region that is shown or hidden. */
export const CollapsibleContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function CollapsibleContent({className, ...rest}, ref) {
  return <Radix.Content ref={ref} className={cx('collapsible-content', className)} {...rest} />;
});
