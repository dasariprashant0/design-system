import {forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode} from 'react';
import {Switch as RadixSwitch} from 'radix-ui';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, 'children'> {
  /** Visible label. Without it, give the switch an `aria-label`. */
  label?: ReactNode;
}

/** An on/off setting that applies at once. Use a Checkbox for a choice you submit later. */
export const Switch = forwardRef<ElementRef<typeof RadixSwitch.Root>, SwitchProps>(function Switch({label, className, id, ...rest}, ref) {
  const f = useFieldControl();
  const sw = (
    <RadixSwitch.Root ref={ref} id={id ?? f.id} className={cx('sw', className)} aria-describedby={f['aria-describedby']} {...rest}>
      <RadixSwitch.Thumb className="sw-thumb" />
    </RadixSwitch.Root>
  );
  return label ? <label className="choice" style={{alignItems: 'center'}}>{sw}<span>{label}</span></label> : sw;
});
