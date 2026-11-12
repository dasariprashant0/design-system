import {forwardRef, type HTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'default' | 'muted' | 'danger' | 'ok' | 'accent';
  /** One line with an ellipsis. */
  truncate?: boolean;
  /** Render the child (a span, label, li) with the text styles. */
  asChild?: boolean;
}

/** A paragraph by default. */
export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text({size = 'md', tone = 'default', truncate, asChild, className, ...rest}, ref) {
  const Comp = asChild ? Slot.Root : 'p';
  return <Comp ref={ref} className={cx('text', `text-${size}`, tone !== 'default' && `text-${tone}`, truncate && 'text-truncate', className)} {...rest} />;
});
