import {forwardRef, type HTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a hover outline. Use with `asChild` on a link or button so the whole card is one control. */
  interactive?: boolean;
  asChild?: boolean;
}

/** A bordered group for one thing you can pick up or open. Prefer rules and space over cards for everything else. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({interactive, asChild, className, ...rest}, ref) {
  const Comp = asChild ? Slot.Root : 'div';
  return <Comp ref={ref} className={cx('card', interactive && 'card-hover', className)} {...rest} />;
});

const part = (name: string, tag: 'div' | 'h3' | 'p', cls: string) => {
  const C = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Part({className, ...rest}, ref) {
    const T = tag as 'div';
    return <T ref={ref as never} className={cx(cls, className)} {...rest} />;
  });
  C.displayName = name;
  return C;
};

export const CardHeader = part('CardHeader', 'div', 'card-header');
export const CardTitle = part('CardTitle', 'h3', 'card-title');
export const CardDescription = part('CardDescription', 'p', 'card-description');
export const CardContent = part('CardContent', 'div', 'card-content');
export const CardFooter = part('CardFooter', 'div', 'card-footer');
