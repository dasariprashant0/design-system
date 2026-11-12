'use client';
import {forwardRef, useEffect, useRef, useState, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {usePrefersReducedMotion} from './use-reduced-motion';

export interface NumberTickerProps extends HTMLAttributes<HTMLSpanElement> {
  /** The number to count to. Screen readers get this, never the frames in between. */
  value: number;
  /** Where the count starts. Default 0. */
  from?: number;
  /** Milliseconds for the count. Default 1500. */
  duration?: number;
  /** Digits after the decimal point. Default 0. */
  decimals?: number;
  /** Custom formatting, for currency or units. Overrides `decimals`. */
  format?: (n: number) => string;
}

/**
 * Counts up to `value` once it scrolls into view. With `prefers-reduced-motion` it shows the final number straight away.
 * The visible digits are `aria-hidden`; an `sr-only` copy holds the final number.
 * @example <NumberTicker value={1200} format={(n) => n.toLocaleString()} />
 */
export const NumberTicker = forwardRef<HTMLSpanElement, NumberTickerProps>(function NumberTicker({value, from = 0, duration = 1500, decimals = 0, format, className, ...rest}, ref) {
  const [shown, setShown] = useState(value);
  const reduced = usePrefersReducedMotion();
  const local = useRef<HTMLSpanElement | null>(null);
  const fmt = format ?? ((n: number) => n.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}));

  useEffect(() => {
    if (reduced || typeof requestAnimationFrame === 'undefined') { setShown(value); return; }
    let raf = 0;
    let io: IntersectionObserver | undefined;
    const run = () => {
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setShown(from + (value - from) * (1 - (1 - p) ** 3));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    setShown(from);
    if (local.current && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { io?.disconnect(); run(); } });
      io.observe(local.current);
    } else run();
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, [value, from, duration, reduced]);

  return (
    <span ref={(node) => { local.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }} className={cx('number-ticker', className)} {...rest}>
      <span className="sr-only">{fmt(value)}</span>
      <span aria-hidden="true">{fmt(shown)}</span>
    </span>
  );
});
