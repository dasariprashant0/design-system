import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface StatProps extends HTMLAttributes<HTMLDListElement> {
  label: ReactNode;
  value: ReactNode;
  /** A short note: a change, a period, a unit. */
  note?: ReactNode;
}

/** A single metric. Group several in a grid. */
export const Stat = forwardRef<HTMLDListElement, StatProps>(function Stat({label, value, note, className, ...rest}, ref) {
  return (
    <dl ref={ref} className={cx('stat', className)} {...rest}>
      <dt className="label">{label}</dt>
      <dd className="stat-value">{value}</dd>
      {note && <dd className="stat-note">{note}</dd>}
    </dl>
  );
});
