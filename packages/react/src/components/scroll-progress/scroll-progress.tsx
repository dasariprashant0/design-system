'use client';
import {forwardRef, useEffect, useState, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface ScrollProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Give the bar a name to expose it as a `progressbar` (reading progress). Without it the bar is decorative and `aria-hidden`. */
  label?: string;
}

/** A thin bar fixed to the top of the window that fills as the page scrolls. Decorative unless you pass `label`. */
export const ScrollProgress = forwardRef<HTMLDivElement, ScrollProgressProps>(function ScrollProgress({label, className, style, ...rest}, ref) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.round(Math.min(1, Math.max(0, window.scrollY / max)) * 100) : 0);
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  const a11y = label
    ? {role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct}
    : {'aria-hidden': true as const};
  return (
    <div ref={ref} className={cx('scroll-progress', className)} style={{'--scroll-progress': pct / 100, ...style} as CSSProperties} {...a11y} {...rest}>
      <div className="scroll-progress-bar" />
    </div>
  );
});
