import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Toggle as RadixToggle} from 'radix-ui';
import {cx} from '../../utils/cx';

/** A two-state button (pressed or not), for things like Bold. Use a Switch for a setting. */
export const Toggle = forwardRef<ElementRef<typeof RadixToggle.Root>, ComponentPropsWithoutRef<typeof RadixToggle.Root>>(function Toggle({className, ...rest}, ref) {
  return <RadixToggle.Root ref={ref} className={cx('toggle', className)} {...rest} />;
});
