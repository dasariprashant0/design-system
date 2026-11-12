import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface BorderBeamProps extends HTMLAttributes<HTMLDivElement> {
  /** Seconds for the light to travel once around. Default 6. */
  duration?: number;
}

/** A box with a thin rule and a light that travels around it. CSS only; the beam is decorative and off for reduced motion. */
export const BorderBeam = forwardRef<HTMLDivElement, BorderBeamProps>(function BorderBeam({duration = 6, className, style, children, ...rest}, ref) {
  return (
    <div ref={ref} className={cx('border-beam', className)} style={{'--border-beam-duration': `${duration}s`, ...style} as CSSProperties} {...rest}>
      <span className="border-beam-light" aria-hidden="true" />
      {children}
    </div>
  );
});
