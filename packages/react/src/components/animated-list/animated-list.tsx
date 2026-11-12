import {Children, forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface AnimatedListProps extends HTMLAttributes<HTMLUListElement> {
  /** Milliseconds between one item entering and the next. Default 300. */
  interval?: number;
}

/**
 * A list whose items fade in one after another when it mounts. Every item holds its place from the first frame (opacity only),
 * so nothing shifts. A real `<ul>`; one item per child. Static under reduced motion.
 */
export const AnimatedList = forwardRef<HTMLUListElement, AnimatedListProps>(function AnimatedList({interval = 300, className, style, children, ...rest}, ref) {
  return (
    <ul ref={ref} className={cx('animated-list', className)} style={{'--animated-list-step': `${interval}ms`, ...style} as CSSProperties} {...rest}>
      {Children.toArray(children).map((child, i) => (
        <li key={i} className="animated-list-item" style={{'--i': i} as CSSProperties}>{child}</li>
      ))}
    </ul>
  );
});
