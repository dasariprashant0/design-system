import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {Slot} from '../../utils/slot';
import {cx} from '../../utils/cx';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  /** Main axis: `row` (default), `column`, `row-reverse` or `column-reverse`. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Lets children wrap onto new lines instead of shrinking. Default false. */
  wrap?: boolean;
  /** Cross-axis alignment (`align-items`): `start`, `center`, `end`, `stretch` or `baseline`. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis distribution (`justify-content`): `start`, `center`, `end`, `between` or `around`. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Step on the spacing scale: 1 = --s1 up to 9. */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  /** `inline-flex` instead of `flex`. */
  inline?: boolean;
  /** Render the child element (a `ul`, `nav`, `section`) with the flex styles instead of a `div`. */
  asChild?: boolean;
}

/**
 * A flex container with every flex direction, `baseline` and `around`, and an inline form.
 * Prefer `Stack` for the common case (a column or row with one gap); use `Flex` when you need reversed order,
 * baseline alignment, space-around or an inline container.
 */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex({direction = 'row', wrap, align, justify, gap, inline, asChild, className, style, ...rest}, ref) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      className={cx('flex', inline && 'flex-inline', wrap && 'flex-wrap', className)}
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      style={{...(gap ? {'--flex-gap': `var(--s${gap})`} : {}), ...style} as CSSProperties}
      {...rest}
    />
  );
});
