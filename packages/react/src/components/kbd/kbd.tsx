import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export type KbdProps = HTMLAttributes<HTMLElement>;

/** One key: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({className, ...rest}, ref) {
  return <kbd ref={ref} className={cx('kbd', className)} {...rest} />;
});
