import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** `block` is a tall panel; `hatch` shows the hatch pattern. */
  variant?: 'line' | 'block' | 'hatch';
}

/** A still placeholder for content that is loading. Hidden from assistive tech: announce loading elsewhere (a Spinner or aria-busy region). */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton({variant = 'line', className, ...rest}, ref) {
  return <span ref={ref} aria-hidden="true" className={cx('skeleton', variant === 'block' && 'skeleton-block', variant === 'hatch' && 'skeleton-hatch skeleton-block', className)} {...rest} />;
});
