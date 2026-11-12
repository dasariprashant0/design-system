'use client';
import {forwardRef, useRef, type CSSProperties, type HTMLAttributes, type PointerEvent} from 'react';
import {cx} from '../../utils/cx';

export interface SpotlightProps extends HTMLAttributes<HTMLDivElement> {
  /** Radius of the glow in px. Default 240. */
  size?: number;
}

/**
 * A surface with a soft highlight that follows the pointer. Pointer only: keyboard and touch users see the plain surface and lose nothing.
 * The glow is a pseudo-element, so it is never read aloud. No transition under reduced motion.
 */
export const Spotlight = forwardRef<HTMLDivElement, SpotlightProps>(function Spotlight({size = 240, className, style, onPointerMove, children, ...rest}, ref) {
  const local = useRef<HTMLDivElement | null>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = local.current;
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`);
      el.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`);
    }
    onPointerMove?.(e);
  };
  return (
    <div ref={(node) => { local.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }} className={cx('spotlight', className)} style={{'--spotlight-size': `${size}px`, ...style} as CSSProperties} onPointerMove={move} {...rest}>
      {children}
    </div>
  );
});
