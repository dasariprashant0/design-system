'use client';
import {forwardRef, useEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent} from 'react';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';
import {useFieldControl} from '../field';

export interface TimeFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'role'> {
  /** The time as 24-hour `"HH:mm"` when controlled; `""` means none. Pair with `onValueChange`. */
  value?: string;
  /** The initial time as `"HH:mm"` when uncontrolled. Default none. */
  defaultValue?: string;
  /** Called with `"HH:mm"` once hour and minute are both set, or `""` when either is cleared. */
  onValueChange?: (value: string) => void;
  /** Show hours 1-12 with an AM/PM segment (`12`) or 0-23 (`24`). Default 12. */
  hourCycle?: 12 | 24;
  /** Minutes the arrow keys move by. Default 1. */
  step?: number;
  /** Stops all input. */
  disabled?: boolean;
  /** Marks the field as having an error: sets `aria-invalid` and shows the error border. */
  invalid?: boolean;
  /** Form field name; a hidden input submits the 24-hour `"HH:mm"` value. */
  name?: string;
  /** Names the group when it is not inside a Field. Default "Time". */
  'aria-label'?: string;
}

type Part = 'hour' | 'minute' | 'period';
const pad = (n: number) => String(n).padStart(2, '0');
const parse = (v: string | undefined) => { const m = /^(\d{1,2}):(\d{2})$/.exec(v ?? ''); return m && +m[1]! < 24 && +m[2]! < 60 ? {h: +m[1]!, m: +m[2]!} : {h: null, m: null}; };

/** Type a time in separate hour, minute and AM/PM segments. Each segment is a spin button: ArrowUp/ArrowDown step it, PageUp/PageDown step by ten, Home/End go to the limits, digits type into it, and ArrowLeft/ArrowRight move between segments. The value is a 24-hour `"HH:mm"` string. */
export const TimeField = forwardRef<HTMLDivElement, TimeFieldProps>(function TimeField({value, defaultValue, onValueChange, hourCycle = 12, step = 1, disabled, invalid, name, className, 'aria-label': label = 'Time', ...rest}, ref) {
  const f = useFieldControl();
  const isRtl = useIsRtl();
  const init = parse(value ?? defaultValue);
  const [t, setT] = useState<{h: number | null; m: number | null; p: 'AM' | 'PM'}>({...init, p: init.h !== null && init.h >= 12 ? 'PM' : 'AM'});
  const buf = useRef('');
  const root = useRef<HTMLDivElement>(null);
  const twelve = hourCycle === 12;
  const stepBy = Math.max(1, step);

  // Follow a changed controlled value without wiping a half-typed time.
  useEffect(() => {
    if (value === undefined) return;
    const p = parse(value);
    if (p.h !== null) setT({h: p.h, m: p.m, p: p.h >= 12 ? 'PM' : 'AM'});
    else setT((s) => (s.h !== null && s.m !== null ? {...s, h: null, m: null} : s));
  }, [value]);

  const out = (n: typeof t) => { setT(n); onValueChange?.(n.h !== null && n.m !== null ? `${pad(n.h)}:${pad(n.m)}` : ''); };
  const hour12 = t.h === null ? null : t.h % 12 || 12;
  const to24 = (h12: number, p: 'AM' | 'PM') => (h12 % 12) + (p === 'PM' ? 12 : 0);
  const setHour = (n: number | null, base = t) => out({...base, h: n === null ? null : twelve ? to24(n, base.p) : n});
  const setPeriod = (p: 'AM' | 'PM') => out({...t, p, h: t.h === null ? null : to24(t.h % 12 || 12, p)});

  const limits = (part: Part) => (part === 'hour' ? (twelve ? [1, 12] : [0, 23]) : [0, 59]) as [number, number];
  const current = (part: Part) => (part === 'hour' ? (twelve ? hour12 : t.h) : t.m);
  const set = (part: Part, n: number | null) => (part === 'hour' ? setHour(n) : out({...t, m: n}));
  const bump = (part: Part, dir: 1 | -1, amount: number) => {
    if (part === 'period') { setPeriod(t.p === 'AM' ? 'PM' : 'AM'); return; }
    const [lo, hi] = limits(part);
    const c = current(part);
    if (c === null) { set(part, dir === 1 ? lo : hi); return; }
    const size = hi - lo + 1;
    set(part, lo + ((((c - lo + dir * amount) % size) + size) % size));
  };

  const parts: Part[] = twelve ? ['hour', 'minute', 'period'] : ['hour', 'minute'];
  const move = (part: Part, d: 1 | -1) => {
    const el = root.current?.querySelectorAll<HTMLElement>('[role="spinbutton"]')[parts.indexOf(part) + d];
    el?.focus();
  };

  const keydown = (part: Part) => (e: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const amt = part === 'minute' ? stepBy : 1;
    const fwd = isRtl(e.currentTarget) ? 'ArrowLeft' : 'ArrowRight';
    const back = fwd === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
    if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); buf.current = ''; bump(part, k === 'ArrowUp' ? 1 : -1, amt); }
    else if (k === 'PageUp' || k === 'PageDown') { e.preventDefault(); buf.current = ''; bump(part, k === 'PageUp' ? 1 : -1, part === 'period' ? 1 : part === 'minute' ? Math.max(10, stepBy) : 3); }
    else if (k === 'Home' || k === 'End') { if (part === 'period') { e.preventDefault(); setPeriod(k === 'Home' ? 'AM' : 'PM'); } else { e.preventDefault(); set(part, limits(part)[k === 'Home' ? 0 : 1]); } }
    else if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); buf.current = ''; if (part !== 'period') set(part, null); }
    else if (k === fwd) { e.preventDefault(); buf.current = ''; move(part, 1); }
    else if (k === back) { e.preventDefault(); buf.current = ''; move(part, -1); }
    else if (part === 'period' && /^[apAP]$/.test(k)) { e.preventDefault(); setPeriod(k.toLowerCase() === 'a' ? 'AM' : 'PM'); }
    else if (part !== 'period' && /^\d$/.test(k)) {
      e.preventDefault();
      const [lo, hi] = limits(part);
      let next = buf.current + k;
      if (+next > hi) next = k; // restart with the new digit
      const n = +next;
      buf.current = next;
      const done = next.length >= 2 || n * 10 > hi;
      if (n >= lo) set(part, n);
      if (done) { buf.current = ''; if (n >= lo) move(part, 1); }
    }
  };

  const text = (part: Part) => (part === 'period' ? t.p : (() => { const c = current(part); return c === null ? '––' : pad(c); })());
  const names: Record<Part, string> = {hour: 'Hour', minute: 'Minute', period: 'AM or PM'};
  const cycle = t.h !== null && t.m !== null ? `${pad(t.h)}:${pad(t.m)}` : '';

  return (
    <div ref={(el) => { root.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }} role="group" aria-label={label} className={cx('input time-field', className)} data-disabled={disabled || undefined} data-invalid={invalid || undefined} {...f} aria-invalid={invalid || f['aria-invalid']} {...rest}>
      {parts.map((part, i) => {
        const c = part === 'period' ? null : current(part);
        const [lo, hi] = part === 'period' ? [0, 1] : limits(part);
        return (
          <span key={part} style={{display: 'contents'}}>
            {i === 1 && <span aria-hidden="true" className="time-sep">:</span>}
            {i === 2 && <span aria-hidden="true" className="time-sep"> </span>}
            <span
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
              className="time-segment"
              aria-label={names[part]}
              aria-valuemin={lo}
              aria-valuemax={hi}
              aria-valuenow={part === 'period' ? (t.p === 'AM' ? 0 : 1) : c ?? undefined}
              aria-valuetext={part === 'period' ? t.p : c === null ? 'Empty' : pad(c)}
              aria-disabled={disabled || undefined}
              data-empty={(part !== 'period' && c === null) || undefined}
              onKeyDown={keydown(part)}
              onBlur={() => { buf.current = ''; }}
            >{text(part)}</span>
          </span>
        );
      })}
      {name && <input type="hidden" name={name} value={cycle} />}
    </div>
  );
});
