import {forwardRef, useId, type SVGAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface GridPatternProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Cell size in px. Default 32. */
  size?: number;
  /** Fade the lines out towards the edges. */
  fade?: boolean;
}

/** A decorative line grid that fills its positioned parent. Colour comes from `currentColor` (default `--rule`). Always `aria-hidden`. */
export const GridPattern = forwardRef<SVGSVGElement, GridPatternProps>(function GridPattern({size = 32, fade, className, ...rest}, ref) {
  const id = `grid-${useId().replace(/:/g, '')}`;
  return (
    <svg ref={ref} aria-hidden="true" focusable="false" className={cx('grid-pattern', fade && 'grid-pattern-fade', className)} {...rest}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={`M ${size} 0 H 0 V ${size}`} fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
});
