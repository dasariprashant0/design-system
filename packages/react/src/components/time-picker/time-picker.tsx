'use client';
import {forwardRef, useState, type InputHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  /** 24-hour "HH:mm" (or "HH:mm:ss" when `step` is under 60), or '' for no time. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
}

/**
 * A time field built on the native `<input type="time">`: the browser supplies the hour,
 * minute and AM/PM segments (spinbuttons), the picker and the keyboard handling. Whether
 * AM/PM is shown follows the user's locale, as the platform decides. The value is always 24-hour.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker({value, defaultValue = '', onValueChange, invalid, className, ...rest}, ref) {
  const f = useFieldControl();
  const [inner, setInner] = useState(defaultValue);
  return (
    <input
      ref={ref}
      type="time"
      className={cx('input time-picker', className)}
      {...f}
      {...(invalid ? {'aria-invalid': true as const} : {})}
      value={value ?? inner}
      onChange={(e) => { if (value === undefined) setInner(e.target.value); onValueChange?.(e.target.value); }}
      {...rest}
    />
  );
});
