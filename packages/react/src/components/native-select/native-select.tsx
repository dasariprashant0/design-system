import {forwardRef, type SelectHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}

/** A styled <select>. Pass <option> children. Prefer it to the custom Select for plain lists. */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect({invalid, className, ...rest}, ref) {
  const f = useFieldControl();
  return <select ref={ref} className={cx('select', className)} {...f} {...(invalid ? {'aria-invalid': true as const} : {})} {...rest} />;
});
