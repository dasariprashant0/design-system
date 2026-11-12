import {forwardRef, type AnchorHTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Opens in a new tab with `rel="noopener noreferrer"` and announces that. */
  external?: boolean;
  /** Use the child (a router link) instead of an anchor. */
  asChild?: boolean;
}

/** An anchor with the Monoline underline. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({external, asChild, className, children, ...rest}, ref) {
  const Comp = asChild ? Slot.Root : 'a';
  const extra = external ? {target: '_blank', rel: 'noopener noreferrer'} : {};
  return (
    <Comp ref={ref} className={cx('link', className)} {...extra} {...rest}>
      {asChild ? children : <>{children}{external && <span className="sr-only"> (opens in a new tab)</span>}</>}
    </Comp>
  );
});
