import {forwardRef, type HTMLAttributes} from 'react';
import {Slot} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Type size: `xs`, `sm`, `md` (default) or `lg`. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Colour role: `default`, `muted`, `success`, `warning`, `danger` or `accent`, the same names as Alert. Never rely on colour alone to carry meaning.
   * `ok` still works.
   * @deprecated use `success` instead of `ok`.
   */
  tone?: 'default' | 'muted' | 'success' | 'warning' | 'danger' | 'accent' | 'ok';
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
