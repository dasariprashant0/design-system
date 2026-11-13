'use client';
import {forwardRef, useEffect, useId, useState} from 'react';
import {Popover as Radix} from 'radix-ui';
import {RangeCalendar, type RangeCalendarProps, type DateRange} from '../range-calendar';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

export interface DateRangePickerProps extends Omit<RangeCalendarProps, 'className' | 'aria-label'> {
  /** Text shown on the button while no range is chosen. Default "Pick dates". */
  placeholder?: string;
  /** Intl options for the dates on the button. Default: medium date. */
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

const pad = (n: number) => String(n).padStart(2, '0');
const toText = (d: Date | null) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '');
/** Parses YYYY-MM-DD strictly; returns null for anything that is not a real date. */
const parse = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(+m[1]!, +m[2]! - 1, +m[3]!);
  return d.getMonth() === +m[2]! - 1 && d.getDate() === +m[3]! ? d : null;
};

/** Pick a date range from a popover. It holds two typed fields (YYYY-MM-DD) and a range calendar that stay in sync. Value is `{start, end}`. Same `value` / `defaultValue` / `onValueChange` as RangeCalendar. */
export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(function DateRangePicker({value, defaultValue, onValueChange, placeholder = 'Pick dates', format = {dateStyle: 'medium'}, locale, disabled, invalid, className, 'aria-label': label, min, max, isDateDisabled, ...cal}, ref) {
  const f = useFieldControl();
  const errId = useId();
  const [inner, setInner] = useState<DateRange>(defaultValue ?? {start: null, end: null});
  const [open, setOpen] = useState(false);
  const current = value ?? inner;
  const fmt = (d: Date) => new Intl.DateTimeFormat(locale, format).format(d);
  const text = current.start ? `${fmt(current.start)}${current.end ? ` – ${fmt(current.end)}` : ' –'}` : '';
  const [typed, setTyped] = useState({start: toText(current.start), end: toText(current.end)});
  useEffect(() => setTyped({start: toText(current.start), end: toText(current.end)}), [current.start, current.end]);
  const [bad, setBad] = useState<'start' | 'end' | null>(null);

  const commit = (r: DateRange) => { if (value === undefined) setInner(r); onValueChange?.(r); };
  const allowed = (d: Date) => !((min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) || (max && d > max) || isDateDisabled?.(d));
  const apply = (which: 'start' | 'end') => {
    const raw = typed[which];
    if (raw.trim() === '') { setBad(null); commit({...current, [which]: null}); return; }
    const d = parse(raw);
    if (!d || !allowed(d)) { setBad(which); return; }
    setBad(null);
    const next = {...current, [which]: d};
    commit(next.start && next.end && next.start > next.end ? {start: next.end, end: next.start} : next);
  };
  const field = (which: 'start' | 'end', name: string) => (
    <label className="date-range-field">
      <span>{name}</span>
      <input
        type="text"
        inputMode="numeric"
        className="input"
        placeholder="YYYY-MM-DD"
        autoComplete="off"
        value={typed[which]}
        aria-invalid={bad === which || undefined}
        aria-describedby={bad === which ? errId : undefined}
        onChange={(e) => setTyped({...typed, [which]: e.target.value})}
        onBlur={() => apply(which)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(which); } }}
      />
    </label>
  );

  return (
    <Radix.Root open={open} onOpenChange={setOpen}>
      <Radix.Trigger asChild>
        <button ref={ref} type="button" disabled={disabled} className={cx('input date-trigger', className)} {...f} aria-label={label} aria-invalid={invalid || f['aria-invalid']} data-empty={!current.start || undefined}>
          {text || placeholder}
        </button>
      </Radix.Trigger>
      <Radix.Portal>
        <Radix.Content className="popover date-popover date-range-popover" sideOffset={6} align="start" aria-label="Choose a date range">
          <div className="date-range-fields">
            {field('start', 'Start')}
            {field('end', 'End')}
          </div>
          <p id={errId} className="date-range-error" role="alert">{bad ? 'Enter a date as YYYY-MM-DD that can be picked.' : ''}</p>
          <RangeCalendar value={current} locale={locale} min={min} max={max} isDateDisabled={isDateDisabled} {...cal} onValueChange={(r) => { commit(r); setBad(null); if (r.start && r.end) setOpen(false); }} />
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
});
