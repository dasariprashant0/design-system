import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Shows a remove button and calls this when it is pressed. */
  onRemove?: () => void;
  /** Text used in the remove button's name: "Remove <label>". Defaults to the child text. */
  label?: string;
}

/** A label for a category, filter or value. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({onRemove, label, className, children, ...rest}, ref) {
  const text = label ?? (typeof children === 'string' ? children : '');
  return (
    <span ref={ref} className={cx('tag', className)} {...rest}>
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${text}`.trim()}>
          <svg aria-hidden="true" viewBox="0 0 10 10" width="10" height="10"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" fill="none" /></svg>
        </button>
      )}
    </span>
  );
});
