import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'column' | 'row';
  /** Step on the spacing scale: 1 = --s1 (4px) up to 9. */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
}

/** A flex container. Use it instead of one-off margins. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack({direction = 'column', gap = 3, align, justify, wrap, className, style, ...rest}, ref) {
  return (
    <div
      ref={ref}
      className={cx('stack', direction === 'row' && 'stack-row', wrap && 'stack-wrap', className)}
      data-align={align}
      data-justify={justify}
      style={{'--stack-gap': `var(--s${gap})`, ...style} as CSSProperties}
      {...rest}
    />
  );
});
