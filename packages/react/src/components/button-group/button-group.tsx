import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the group for assistive tech, for example "Text alignment". */
  'aria-label': string;
}

/** Buttons that act on the same thing, sharing borders. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({className, ...rest}, ref) {
  return <div ref={ref} role="group" className={cx('btn-group', className)} {...rest} />;
});
