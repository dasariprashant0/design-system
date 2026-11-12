import {Children, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';

export interface OrbitingCirclesProps extends HTMLAttributes<HTMLDivElement> {
  /** Orbit radius in px. Default 96. */
  radius?: number;
  /** Seconds for one full turn. Default 20. */
  duration?: number;
  /** Turn the other way. */
  reverse?: boolean;
  /** Draw the orbit as a thin ring. Default true. */
  ring?: boolean;
  /** Fixed content in the centre. */
  center?: ReactNode;
}

/**
 * Small items (icons, logos) circling a centre. Purely decorative: the whole thing is `aria-hidden`, so do not put anything
 * users must read or operate inside it. Items sit evenly spaced and stay still under reduced motion.
 */
export const OrbitingCircles = forwardRef<HTMLDivElement, OrbitingCirclesProps>(function OrbitingCircles({radius = 96, duration = 20, reverse, ring = true, center, className, style, children, ...rest}, ref) {
  const items = Children.toArray(children);
  return (
    <div ref={ref} aria-hidden="true" className={cx('orbit', reverse && 'orbit-reverse', className)} style={{'--orbit-radius': `${radius}px`, '--orbit-duration': `${duration}s`, '--n': items.length, ...style} as CSSProperties} {...rest}>
      {ring && <span className="orbit-ring" />}
      {center != null && <span className="orbit-center">{center}</span>}
      {items.map((child, i) => (
        <span key={i} className="orbit-item" style={{'--i': i} as CSSProperties}>{child}</span>
      ))}
    </div>
  );
});
