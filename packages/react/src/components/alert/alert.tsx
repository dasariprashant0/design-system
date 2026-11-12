import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Meaning of the message: `info` (default), `success`, `warning` or `danger`. `warning` and `danger` are announced at once to screen readers. */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** The headline of the message. Required: the words carry the meaning, the colour is only extra. */
  title: ReactNode;
  /** Optional longer explanation shown under the title. */
  children?: ReactNode;
}

/**
 * A message that stays on screen. `danger` and `warning` use role="alert" (announced at once); others use role="status".
 * Always has a title: the word carries the meaning, the colour is extra.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert({tone = 'info', title, children, className, ...rest}, ref) {
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div ref={ref} role={urgent ? 'alert' : 'status'} data-tone={tone} className={cx('alert', className)} {...rest}>
      <div className="alert-title">{title}</div>
      {children && <div className="alert-description">{children}</div>}
    </div>
  );
});
