'use client';
import {forwardRef, useId, useState, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Names the control, for example "Rate this article". */
  'aria-label': string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  /** Shows the score without letting anyone change it. */
  readOnly?: boolean;
  name?: string;
}

const Star = () => <svg aria-hidden="true" viewBox="0 0 20 20" width="1em" height="1em"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" /></svg>;

/** Star rating. Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`. */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating({value, defaultValue = 0, onValueChange, max = 5, readOnly, name, className, 'aria-label': label, ...rest}, ref) {
  const auto = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const set = (n: number) => { if (value === undefined) setInner(n); onValueChange?.(n); };
  if (readOnly) {
    return (
      <div ref={ref} role="img" className={cx('rating', className)} {...rest} aria-label={`${label}: ${current} out of ${max}`}>
        {Array.from({length: max}, (_, i) => <span key={i} className="rating-star" data-on={i < current || undefined}><Star /></span>)}
      </div>
    );
  }
  return (
    <div ref={ref} role="radiogroup" aria-label={label} className={cx('rating', className)} {...rest}>
      {Array.from({length: max}, (_, i) => (
        <label key={i} className="rating-star" data-on={i < current || undefined}>
          <input type="radio" className="sr-only" name={name ?? auto} value={i + 1} checked={current === i + 1} onChange={() => set(i + 1)} aria-label={`${i + 1} of ${max}`} />
          <Star />
        </label>
      ))}
    </div>
  );
});
