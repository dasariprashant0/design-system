import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding on all sides: a step on the spacing scale (1 = --s1 up to 9). */
  padding?: Step;
  paddingX?: Step;
  paddingY?: Step;
  /** A thin rule on every side (`true`) or on one side. */
  border?: boolean | 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end';
  /** Render the child (a `section`, `aside`, `li`) with the box styles. */
  asChild?: boolean;
}

const v = (s: Step | undefined) => (s ? `var(--s${s})` : undefined);

/**
 * A div with padding and a border mapped to spacing tokens. Use it for a one-off inset;
 * reach for `Card` when the thing is a bordered object, `Stack` or `Flex` for spacing between children.
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box({padding, paddingX, paddingY, border, asChild, className, style, ...rest}, ref) {
  const Comp = asChild ? Slot.Root : 'div';
  const vars = {'--box-px': v(paddingX ?? padding), '--box-py': v(paddingY ?? padding)};
  return (
    <Comp
      ref={ref}
      className={cx('box', border && 'box-border', className)}
      data-border={typeof border === 'string' ? border : undefined}
      style={{...vars, ...style} as CSSProperties}
      {...rest}
    />
  );
});
