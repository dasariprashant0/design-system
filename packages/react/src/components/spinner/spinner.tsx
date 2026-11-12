import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** What is loading, read by screen readers. */
  label?: string;
}

/** A small stepped spinner. It stops under reduced motion (base styles). */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner({label = 'Loading', className, ...rest}, ref) {
  return <span ref={ref} role="status" aria-label={label} className={cx('spinner', className)} {...rest} />;
});
