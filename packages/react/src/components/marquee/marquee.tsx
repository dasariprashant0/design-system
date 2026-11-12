import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  /** Stop when the pointer is over it or focus is inside. Default true. */
  pauseOnHover?: boolean;
}

/** Children scroll left (or right with `reverse`). Keep the items short. */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee({duration = 30, reverse, pauseOnHover = true, className, style, children, ...rest}, ref) {
  return (
    <div ref={ref} className={cx('marquee', reverse && 'marquee-reverse', pauseOnHover && 'marquee-pause', className)} style={{'--marquee-duration': `${duration}s`, ...style} as CSSProperties} {...rest}>
      <div className="marquee-track">{children}</div>
      <div className="marquee-track" aria-hidden="true">{children}</div>
    </div>
  );
});
