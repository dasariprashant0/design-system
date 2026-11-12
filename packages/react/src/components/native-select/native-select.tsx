import {forwardRef, type SelectHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {invalidAttrs, useFieldControl} from '../field';

export interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** `md` (default), `sm` for dense layouts or `lg` for prominent forms. Heights match Button and the other form controls at each size. */
  size?: 'sm' | 'md' | 'lg';
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}

/** A styled <select>. Pass <option> children. Prefer it to the custom Select for plain lists. */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect({size = 'md', invalid, disabled, className, ...rest}, ref) {
  const f = useFieldControl();
  return <select ref={ref} className={cx('select', size !== 'md' && `input-${size}`, className)} disabled={disabled} data-disabled={disabled ? '' : undefined} {...f} {...invalidAttrs(invalid)} {...rest} />;
});
