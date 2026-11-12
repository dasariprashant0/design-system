'use client';
import {forwardRef, useState} from 'react';
import {Popover as Radix} from 'radix-ui';
import {Calendar, type CalendarProps} from '../calendar';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface DatePickerProps extends Omit<CalendarProps, 'className' | 'aria-label'> {
  /** Text shown on the button while no date is chosen. Default "Pick a date". */
  placeholder?: string;
  /** Intl options for the text on the button. Default: medium date. */
  format?: Intl.DateTimeFormatOptions;
  /** Stops the user opening the calendar. */
  disabled?: boolean;
  /** Marks the field as having an error: sets `aria-invalid` and shows the error border. */
  invalid?: boolean;
  /** Extra class name for the trigger button. */
  className?: string;
  /** Names the control when it is not inside a Field. */
  'aria-label'?: string;
}

/**
 * Pick a date from a popover calendar. Same `value` / `defaultValue` / `onValueChange` as Calendar.
 * Add `clearable` to put a "Clear date" button in the popover; it calls `onValueChange(null)` and closes.
 * @example <DatePicker clearable value={date} onValueChange={setDate} aria-label="Due" />
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker({value, defaultValue = null, onValueChange, placeholder = 'Pick a date', format = {dateStyle: 'medium'}, locale, disabled, invalid, className, 'aria-label': label, ...cal}, ref) {
  const f = useFieldControl();
  const [inner, setInner] = useState<Date | null>(defaultValue);
  const [open, setOpen] = useState(false);
  const current = value === undefined ? inner : value;
  const text = current ? new Intl.DateTimeFormat(locale, format).format(current) : '';
  return (
    <Radix.Root open={open} onOpenChange={setOpen}>
      <Radix.Trigger asChild>
        <button ref={ref} type="button" disabled={disabled} className={cx('input date-trigger', className)} {...f} aria-label={label} aria-invalid={invalid || f['aria-invalid']} data-empty={!current || undefined}>
          {text || placeholder}
        </button>
      </Radix.Trigger>
      <Radix.Portal>
        <Radix.Content className="popover date-popover" sideOffset={6} align="start" aria-label="Choose a date">
          <Calendar value={current} locale={locale} {...cal} onValueChange={(d) => { if (value === undefined) setInner(d); onValueChange?.(d); setOpen(false); }} />
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
});
