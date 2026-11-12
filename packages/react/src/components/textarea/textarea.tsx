import {forwardRef, type TextareaHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {invalidAttrs, useFieldControl} from '../field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}

/** A native multi-line text field. Inside a Field it is labelled and described automatically. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({invalid, disabled, className, ...rest}, ref) {
  const f = useFieldControl();
  return <textarea ref={ref} className={cx('textarea', className)} disabled={disabled} data-disabled={disabled ? '' : undefined} {...f} {...invalidAttrs(invalid)} {...rest} />;
});
