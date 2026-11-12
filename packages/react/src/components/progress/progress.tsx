import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Progress as RadixProgress} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface ProgressProps extends Omit<ComponentPropsWithoutRef<typeof RadixProgress.Root>, 'children'> {
  /** Accessible name. Required: a progress bar without one is meaningless to assistive tech. */
  'aria-label': string;
}

/** Determinate with a `value` (0 to `max`), indeterminate when `value` is null or omitted. */
export const Progress = forwardRef<ElementRef<typeof RadixProgress.Root>, ProgressProps>(function Progress({value = null, max = 100, className, ...rest}, ref) {
  const pct = value == null ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <RadixProgress.Root ref={ref} value={value} max={max} className={cx('progress-bar', className)} {...rest}>
      <RadixProgress.Indicator className="progress-fill" style={value == null ? undefined : {width: `${pct}%`}} />
    </RadixProgress.Root>
  );
});
