import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed number of equal columns. Omit for an auto-fit grid. */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** With auto-fit: the smallest a column may be, as a CSS length such as `16rem`. */
  minColumn?: string;
  /** Step on the spacing scale, 1 to 9. */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

/** Equal columns that collapse on small screens when auto-fit. Fixed columns stack at 40rem. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid({columns, minColumn = '16rem', gap = 4, className, style, ...rest}, ref) {
  return (
    <div
      ref={ref}
      className={cx('grid', columns ? 'grid-fixed' : 'grid-auto', className)}
      style={{'--grid-gap': `var(--s${gap})`, '--grid-cols': columns, '--grid-min': minColumn, ...style} as CSSProperties}
      {...rest}
    />
  );
});
