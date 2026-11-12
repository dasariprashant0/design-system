import {forwardRef, type FieldsetHTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface FieldsetProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'title'> {
  /** The group's name. Required so the fieldset always has an accessible name. */
  legend: ReactNode;
}

/** A group of controls. Use it for radios, checkboxes or a block like "Billing address". */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset({legend, className, children, ...rest}, ref) {
  return (
    <fieldset ref={ref} className={cx('fieldset', className)} {...rest}>
      <legend className="fieldset-legend">{legend}</legend>
      {children}
    </fieldset>
  );
});
