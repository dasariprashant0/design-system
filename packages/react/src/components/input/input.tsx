import {forwardRef, type InputHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}

/** A native text input. Inside a Field it picks up the id, description and invalid state automatically. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({size = 'md', invalid, className, ...rest}, ref) {
  const f = useFieldControl();
  return (
    <input
      ref={ref}
      className={cx('input', size === 'sm' && 'input-sm', className)}
      {...f}
      {...(invalid ? {'aria-invalid': true as const} : {})}
      {...rest}
    />
  );
});
