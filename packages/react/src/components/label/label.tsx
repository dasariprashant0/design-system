import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {Label as RadixLabel} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface LabelProps extends ComponentPropsWithoutRef<typeof RadixLabel.Root> {
  /** Adds a required marker. Pair with `required` on the control. */
  required?: boolean;
}

/** A `<label>` styled as a Monoline label. Clicking it focuses the control it points to with `htmlFor`. */
export const Label = forwardRef<ElementRef<typeof RadixLabel.Root>, LabelProps>(function Label({className, required, ...rest}, ref) {
  return <RadixLabel.Root ref={ref} className={cx('label', required && 'field-required', className)} {...rest} />;
});
