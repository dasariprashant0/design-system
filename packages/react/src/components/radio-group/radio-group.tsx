import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode} from 'react';
import {RadioGroup as RadixRadioGroup} from 'radix-ui';
import {cx} from '../../utils/cx';

/** A set of radios where exactly one can be chosen. Use `value` and `onValueChange` (or `defaultValue`); put `RadioGroupItem`s inside and name the group with `aria-label` or a `Fieldset` legend. */
export const RadioGroup = forwardRef<ElementRef<typeof RadixRadioGroup.Root>, ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>>(function RadioGroup({className, ...rest}, ref) {
  return <RadixRadioGroup.Root ref={ref} className={cx('radio-group', className)} {...rest} />;
});

export interface RadioGroupItemProps extends Omit<ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>, 'children'> {
  /** Visible label shown next to the radio. Without it, give the item an `aria-label`. */
  label?: ReactNode;
}

/** One option in a RadioGroup. Arrow keys move between options; only the selected one is a Tab stop. */
export const RadioGroupItem = forwardRef<ElementRef<typeof RadixRadioGroup.Item>, RadioGroupItemProps>(function RadioGroupItem({label, className, ...rest}, ref) {
  const item = (
    <RadixRadioGroup.Item ref={ref} className={cx('radio', className)} {...rest}>
      <RadixRadioGroup.Indicator className="radio-dot" />
    </RadixRadioGroup.Item>
  );
  return label ? <label className="choice">{item}<span>{label}</span></label> : item;
});
