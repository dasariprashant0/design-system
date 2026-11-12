import {forwardRef, type HTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** `text` is a reading column, `page` the widest main column, `full` no limit. */
  size?: 'text' | 'page' | 'full';
  /** Render the child (a `main`, `section`) with the container styles. */
  asChild?: boolean;
}

/** Centres content and limits its width. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container({size = 'page', asChild, className, ...rest}, ref) {
  const Comp = asChild ? Slot.Root : 'div';
  return <Comp ref={ref} className={cx('container', `container-${size}`, className)} {...rest} />;
});
