import {forwardRef} from 'react';
import {Button, type ButtonProps} from '../button';
import {cx} from '../../utils/cx';

export interface IconButtonProps extends Omit<ButtonProps, 'aria-label' | 'children'> {
  /** Required: what the button does, because there is no visible text. */
  'aria-label': string;
  /** An inline SVG with `currentColor` and `aria-hidden`. */
  children: React.ReactNode;
}

/** A square button for one icon. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({className, ...rest}, ref) {
  return <Button ref={ref} className={cx('btn-icon', className)} {...rest} />;
});
