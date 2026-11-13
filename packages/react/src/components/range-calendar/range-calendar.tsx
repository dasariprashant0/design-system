'use client';
import {forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent} from 'react';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';

/** A date range. `end` is `null` while the user has only picked the start. */
export interface DateRange {
  /** First day of the range, or `null` when none is chosen. */
  start: Date | null;
  /** Last day of the range (inclusive), or `null` while it is still to be chosen. */
  end: Date | null;
}

export interface RangeCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The selected range when controlled. Pair with `onValueChange`. */
  value?: DateRange;
  /** The initially selected range when uncontrolled. Default empty. */
  defaultValue?: DateRange;
  /** Called after every pick. The first pick gives `{start, end: null}`; the second completes the range. */
  onValueChange?: (range: DateRange) => void;
  /** First day of the week: 0 = Sunday, 1 = Monday. Default 0. */
  weekStartsOn?: 0 | 1;
  /** Earliest selectable date; earlier days are disabled. */
  min?: Date;
  /** Latest selectable date; later days are disabled. */
  max?: Date;
  /** Return true for a day that cannot be picked, such as a holiday. */
  isDateDisabled?: (date: Date) => boolean;
  /** BCP 47 locale for month and day names. */
  locale?: string;
}

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a: Date | null, b: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const add = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => { const t = new Date(d.getFullYear(), d.getMonth() + n, 1); const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last)); };
const EMPTY: DateRange = {start: null, end: null};

/** Pick a start and an end date on one month grid. The first click sets the start, the second the end; the days between are previewed on hover and keyboard focus. Controlled with `value` + `onValueChange`, or uncontrolled. */
export const RangeCalendar = forwardRef<HTMLDivElement, RangeCalendarProps>(function RangeCalendar({value, defaultValue = EMPTY, onValueChange, weekStartsOn = 0, min, max, isDateDisabled, locale, className, ...rest}, ref) {
  const [inner, setInner] = useState<DateRange>(defaultValue);
  const range = value ?? inner;
  const [focus, setFocus] = useState<Date>(() => day(range.start ?? new Date()));
  const [hover, setHover] = useState<Date | null>(null);
  const grid = useRef<HTMLTableElement>(null);
  const isRtl = useIsRtl();
  const today = day(new Date());
  const first = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const start = add(first, -((first.getDay() - weekStartsOn + 7) % 7));
  const weeks = Array.from({length: 6}, (_, w) => Array.from({length: 7}, (_, d) => add(start, w * 7 + d)));
  const month = new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'}).format(focus);
  const weekday = (d: Date, style: 'short' | 'long') => new Intl.DateTimeFormat(locale, {weekday: style}).format(d);
  const full = (d: Date) => new Intl.DateTimeFormat(locale, {dateStyle: 'full'}).format(d);
  const off = (d: Date) => !!((min && d < day(min)) || (max && d > day(max)) || isDateDisabled?.(d));
  const picking = !!range.start && !range.end;
  // While picking the end, the preview runs from the start to the hovered (or keyboard-focused) day.
  const previewEnd = picking ? hover ?? focus : null;
  const lo = range.start && (range.end ?? previewEnd) ? (range.start < (range.end ?? previewEnd)! ? range.start : (range.end ?? previewEnd)!) : range.start;
  const hi = range.start && (range.end ?? previewEnd) ? (range.start < (range.end ?? previewEnd)! ? (range.end ?? previewEnd)! : range.start) : range.start;

  const commit = (r: DateRange) => { if (value === undefined) setInner(r); onValueChange?.(r); };
  const choose = (d: Date) => {
    if (off(d)) return;
    if (!picking) commit({start: d, end: null});
    else commit(d < range.start! ? {start: d, end: range.start} : {start: range.start, end: d});
    setHover(null);
  };
  const go = (d: Date) => { setFocus(d); setHover(null); requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()); };

  const keydown = (e: KeyboardEvent<HTMLTableElement>) => {
    if (e.key === 'Escape' && picking) { e.preventDefault(); e.stopPropagation(); commit(EMPTY); return; }
    const h = isRtl(e.currentTarget) ? -1 : 1;
    const wd = (focus.getDay() - weekStartsOn + 7) % 7;
    const k: Record<string, Date> = {
      ArrowLeft: add(focus, -h), ArrowRight: add(focus, h), ArrowUp: add(focus, -7), ArrowDown: add(focus, 7),
      Home: add(focus, -wd), End: add(focus, 6 - wd), PageUp: addMonths(focus, -1), PageDown: addMonths(focus, 1),
    };
    const next = k[e.key];
    if (next) { e.preventDefault(); go(next); }
  };

  const status = range.start && range.end ? `${full(range.start)} to ${full(range.end)}` : range.start ? `Start ${full(range.start)}. Choose an end date.` : '';

  return (
    <div ref={ref} className={cx('calendar range-calendar', className)} {...rest}>
      <div className="calendar-head">
        <button type="button" className="calendar-nav" aria-label="Previous month" onClick={() => setFocus(addMonths(focus, -1))}>‹</button>
        <div className="calendar-title" aria-live="polite">{month}</div>
        <button type="button" className="calendar-nav" aria-label="Next month" onClick={() => setFocus(addMonths(focus, 1))}>›</button>
      </div>
      <table ref={grid} role="grid" aria-label={month} className="calendar-grid" onKeyDown={keydown} onMouseLeave={() => setHover(null)}>
        <thead>
          <tr>{weeks[0]!.map((d) => <th key={d.getDay()} scope="col" abbr={weekday(d, 'long')}>{weekday(d, 'short').slice(0, 2)}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={i}>
              {w.map((d) => {
                const isStart = same(d, range.start);
                const isEnd = same(d, range.end);
                const inside = !!lo && !!hi && d >= lo && d <= hi;
                return (
                  <td key={d.toISOString()} role="gridcell" aria-selected={isStart || isEnd || undefined} className="range-cell" data-in-range={inside || undefined} data-range-start={same(d, lo) || undefined} data-range-end={same(d, hi) || undefined} data-preview={(inside && picking) || undefined}>
                    <button
                      type="button"
                      tabIndex={same(d, focus) ? 0 : -1}
                      className="calendar-day"
                      data-outside={d.getMonth() !== focus.getMonth() || undefined}
                      data-today={same(d, today) || undefined}
                      aria-label={full(d)}
                      aria-pressed={isStart || isEnd}
                      aria-current={same(d, today) ? 'date' : undefined}
                      disabled={off(d)}
                      onMouseEnter={() => picking && setHover(d)}
                      onClick={() => { choose(d); setFocus(d); }}
                    >{d.getDate()}</button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div role="status" className="sr-only">{status}</div>
    </div>
  );
});
