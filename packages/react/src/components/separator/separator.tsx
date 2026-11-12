import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Separator as RadixSeparator} from 'radix-ui';
import {cx} from '../../utils/cx';

/** A thin rule. Decorative by default (hidden from assistive tech); pass `decorative={false}` when it really divides content. */
export const Separator = forwardRef<ElementRef<typeof RadixSeparator.Root>, ComponentPropsWithoutRef<typeof RadixSeparator.Root>>(function Separator({className, orientation = 'horizontal', decorative = true, ...rest}, ref) {
  return <RadixSeparator.Root ref={ref} orientation={orientation} decorative={decorative} className={cx('separator', className)} {...rest} />;
});
