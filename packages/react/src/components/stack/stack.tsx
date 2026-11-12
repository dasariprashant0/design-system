import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** `column` (default) stacks children vertically; `row` lays them out horizontally. */
  direction?: 'column' | 'row';
  /** Step on the spacing scale: 1 = --s1 (4px) up to 9. */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  /** Cross-axis alignment (`align-items`): `start`, `center`, `end` or `stretch`. */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Main-axis distribution (`justify-content`): `start`, `center`, `end` or `between`. */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Lets children wrap onto new lines. Useful with `direction="row"`. Default false. */
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
