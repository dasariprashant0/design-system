import {Children, forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the group, for example "Project members". */
  'aria-label': string;
  /** Show at most this many avatars, then "+N". */
  max?: number;
}

/** A row of overlapping Avatars. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({max = 4, className, children, ...rest}, ref) {
  const items = Children.toArray(children);
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div ref={ref} role="group" className={cx('avatar-group', className)} {...rest}>
      {shown}
      {extra > 0 && <span className="avatar avatar-line">+{extra}</span>}
    </div>
  );
});
