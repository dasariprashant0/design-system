import {forwardRef, type InputHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {invalidAttrs, useFieldControl} from '../field';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** `md` (default), `sm` for dense layouts or `lg` for prominent forms. Heights match Button and the other form controls at each size. */
  size?: 'sm' | 'md' | 'lg';
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}

/** A native text input. Inside a Field it picks up the id, description and invalid state automatically. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({size = 'md', invalid, disabled, className, ...rest}, ref) {
  const f = useFieldControl();
  return (
    <input
      ref={ref}
      className={cx('input', size !== 'md' && `input-${size}`, className)}
      disabled={disabled}
      data-disabled={disabled ? '' : undefined}
      {...f}
      {...invalidAttrs(invalid)}
      {...rest}
    />
  );
});
