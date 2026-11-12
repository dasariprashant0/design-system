import {forwardRef, useId, type SVGAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface DotPatternProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Distance between dot centres, in px. Default 16. */
  gap?: number;
  /** Dot radius, in px. Default 1. */
  radius?: number;
  /** Fade the pattern out towards the edges. */
  fade?: boolean;
}

/** A decorative dot grid that fills its positioned parent. Colour comes from `currentColor` (default `--rule`). Always `aria-hidden`. */
export const DotPattern = forwardRef<SVGSVGElement, DotPatternProps>(function DotPattern({gap = 16, radius = 1, fade, className, ...rest}, ref) {
  const id = `dot-${useId().replace(/:/g, '')}`;
  return (
    <svg ref={ref} aria-hidden="true" focusable="false" className={cx('dot-pattern', fade && 'dot-pattern-fade', className)} {...rest}>
      <defs>
        <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={gap / 2} cy={gap / 2} r={radius} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
});
