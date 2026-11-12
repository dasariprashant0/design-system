import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode} from 'react';
import {Checkbox as RadixCheckbox} from 'radix-ui';
import {cx} from '../../utils/cx';
import {invalidAttrs, useFieldControl} from '../field';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, 'children'> {
  /** Visible label. Without it, give the checkbox an `aria-label`. */
  label?: ReactNode;
  /** Marks the checkbox as having an error: sets `aria-invalid` and shows the error border. */
  invalid?: boolean;
}

const Check = () => <svg className="checkbox-mark" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1.5 5.5l2.5 2.5 4.5-5.5" /></svg>;
const Dash = () => <svg className="checkbox-mark" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 5h6" /></svg>;

/**
 * Checkbox with indeterminate support. `checked` is `boolean | 'indeterminate'`.
 * @example <Checkbox label="Replies" defaultChecked onCheckedChange={setOn} />
 */
export const Checkbox = forwardRef<ElementRef<typeof RadixCheckbox.Root>, CheckboxProps>(function Checkbox({label, invalid, className, id, ...rest}, ref) {
  const f = useFieldControl();
  const box = (
    <RadixCheckbox.Root ref={ref} id={id ?? f.id} className={cx('checkbox', className)} {...invalidAttrs(invalid || Boolean(f['aria-invalid']))} aria-describedby={f['aria-describedby']} {...rest}>
      <RadixCheckbox.Indicator>{rest.checked === 'indeterminate' ? <Dash /> : <Check />}</RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
  return label ? <label className="choice">{box}<span>{label}</span></label> : box;
});
