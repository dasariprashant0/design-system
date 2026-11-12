import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `accent` only for "new" or "now". */
  variant?: 'outline' | 'solid' | 'accent';
}

/** A short status word or count. Never rely on its colour alone: the text carries the meaning. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({variant = 'outline', className, ...rest}, ref) {
  return <span ref={ref} className={cx('badge', variant === 'solid' && 'badge-solid', variant === 'accent' && 'badge-accent', className)} {...rest} />;
});
