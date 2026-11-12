'use client';
import {forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent} from 'react';
import {cx} from '../../utils/cx';

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date) => void;
  /** First day of the week: 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  min?: Date;
  max?: Date;
  /** BCP 47 locale for month and day names. */
  locale?: string;
}

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const add = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => { const t = new Date(d.getFullYear(), d.getMonth() + n, 1); const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last)); };

/** Pick a date. Controlled with `value` + `onValueChange`, or uncontrolled. */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar({value, defaultValue = null, onValueChange, weekStartsOn = 0, min, max, locale, className, ...rest}, ref) {
  const [inner, setInner] = useState<Date | null>(defaultValue);
  const selected = value === undefined ? inner : value;
  const [focus, setFocus] = useState<Date>(() => day(selected ?? new Date()));
  const grid = useRef<HTMLTableElement>(null);
  const today = day(new Date());
  const first = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = add(first, -offset);
  const weeks = Array.from({length: 6}, (_, w) => Array.from({length: 7}, (_, d) => add(start, w * 7 + d)));
  const month = new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'}).format(focus);
  const weekday = (d: Date, style: 'short' | 'long') => new Intl.DateTimeFormat(locale, {weekday: style}).format(d);
  const full = (d: Date) => new Intl.DateTimeFormat(locale, {dateStyle: 'full'}).format(d);
  const off = (d: Date) => (min && d < day(min)) || (max && d > day(max));
  const choose = (d: Date) => { if (off(d)) return; if (value === undefined) setInner(d); onValueChange?.(d); };
  const go = (d: Date) => { setFocus(d); requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()); };

  const keydown = (e: KeyboardEvent<HTMLTableElement>) => {
    const k: Record<string, Date> = {
      ArrowLeft: add(focus, -1), ArrowRight: add(focus, 1), ArrowUp: add(focus, -7), ArrowDown: add(focus, 7),
      Home: add(focus, -((focus.getDay() - weekStartsOn + 7) % 7)), End: add(focus, 6 - ((focus.getDay() - weekStartsOn + 7) % 7)),
      PageUp: addMonths(focus, -1), PageDown: addMonths(focus, 1),
    };
    const next = k[e.key];
    if (next) { e.preventDefault(); go(next); }
  };

  return (
    <div ref={ref} className={cx('calendar', className)} {...rest}>
      <div className="calendar-head">
        <button type="button" className="calendar-nav" aria-label="Previous month" onClick={() => setFocus(addMonths(focus, -1))}>‹</button>
        <div className="calendar-title" aria-live="polite">{month}</div>
        <button type="button" className="calendar-nav" aria-label="Next month" onClick={() => setFocus(addMonths(focus, 1))}>›</button>
      </div>
      <table ref={grid} role="grid" aria-label={month} className="calendar-grid" onKeyDown={keydown}>
        <thead>
          <tr>{weeks[0]!.map((d) => <th key={d.getDay()} scope="col" abbr={weekday(d, 'long')}>{weekday(d, 'short').slice(0, 2)}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={i}>
              {w.map((d) => {
                const outside = d.getMonth() !== focus.getMonth();
                const isSel = !!selected && same(d, selected);
                return (
                  <td key={d.toISOString()} role="gridcell" aria-selected={isSel || undefined}>
                    <button
                      type="button"
                      tabIndex={same(d, focus) ? 0 : -1}
                      className="calendar-day"
                      data-outside={outside || undefined}
                      data-today={same(d, today) || undefined}
                      aria-label={full(d)}
                      aria-pressed={isSel}
                      aria-current={same(d, today) ? 'date' : undefined}
                      disabled={!!off(d)}
                      onClick={() => { choose(d); setFocus(d); }}
                    >{d.getDate()}</button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
