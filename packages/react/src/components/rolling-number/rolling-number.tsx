'use client';
import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface RollingNumberProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The number to show. When it changes, each digit rolls to its new value. */
  value: number;
  /** BCP 47 locale for the digits and separators, such as "de-DE". Default the browser's locale. */
  locale?: string;
  /** `Intl.NumberFormat` options, for example `{style: 'currency', currency: 'USD'}`. */
  format?: Intl.NumberFormatOptions;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * A number whose digits roll up or down when `value` changes. Screen readers get the final formatted value as plain text,
 * never the rolling strip; with `prefers-reduced-motion` the digits switch at once.
 * @example <RollingNumber value={1204} format={{style: 'currency', currency: 'USD'}} />
 */
export const RollingNumber = forwardRef<HTMLSpanElement, RollingNumberProps>(function RollingNumber({value, locale, format, className, ...rest}, ref) {
  const text = new Intl.NumberFormat(locale, format).format(value);
  const chars = Array.from(text);
  return (
    <span ref={ref} className={cx('rolling-number', className)} {...rest}>
      <span className="sr-only">{text}</span>
      <span className="rolling-number-visual" aria-hidden="true">
        {chars.map((ch, i) => {
          // Keyed from the right so a digit keeps its column when the number gains or loses a place.
          const key = chars.length - i;
          return /[0-9]/.test(ch) ? (
            <span key={key} className="rolling-number-digit" style={{'--digit': ch} as CSSProperties}>
              <span className="rolling-number-strip">{DIGITS.map((d) => <span key={d}>{d}</span>)}</span>
            </span>
          ) : <span key={key} className="rolling-number-char">{ch}</span>;
        })}
      </span>
    </span>
  );
});
