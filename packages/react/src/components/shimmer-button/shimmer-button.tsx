import {forwardRef} from 'react';
import {Button, type ButtonProps} from '../button';
import {cx} from '../../utils/cx';

export type ShimmerButtonProps = ButtonProps;

/** The regular `Button` with a light sweep across it now and then. Same props, same native `<button>`. The sweep is off for reduced motion. Defaults to the `solid` variant. */
export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(function ShimmerButton({variant = 'solid', className, ...rest}, ref) {
  return <Button ref={ref} variant={variant} className={cx('shimmer-button', className)} {...rest} />;
});
