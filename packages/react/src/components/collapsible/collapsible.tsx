import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Collapsible as Radix} from 'radix-ui';
import {cx} from '../../utils/cx';

export const Collapsible = Radix.Root;
export const CollapsibleTrigger = Radix.Trigger;

export const CollapsibleContent = forwardRef<ElementRef<typeof Radix.Content>, ComponentPropsWithoutRef<typeof Radix.Content>>(function CollapsibleContent({className, ...rest}, ref) {
  return <Radix.Content ref={ref} className={cx('collapsible-content', className)} {...rest} />;
});
