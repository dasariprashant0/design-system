import {forwardRef, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Heading} from '../heading';
import {Text} from '../text';

export interface BlockEmptyPageProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** A short code such as "404" or "Empty". Decorative. */
  code?: ReactNode;
  /** The message headline, for example "Page not found". */
  title: ReactNode;
  /** Optional muted sentence explaining what happened or what to do next. */
  description?: ReactNode;
  /** The way out: a solid Button or link, and maybe a second. */
  actions?: ReactNode;
  /** Outline level of the title. A full-page empty state is usually the page's h1. */
  headingLevel?: 1 | 2 | 3;
}

/** A full-page message: not found, nothing here yet, access denied. For a list or table with no rows use `EmptyState`. */
export const BlockEmptyPage = forwardRef<HTMLElement, BlockEmptyPageProps>(function BlockEmptyPage({code, title, description, actions, headingLevel = 1, className, ...rest}, ref) {
  const id = useId();
  return (
    <section ref={ref} className={cx('block-empty-page', className)} aria-labelledby={id} {...rest}>
      {code && <p className="block-empty-page-code" aria-hidden="true">{code}</p>}
      <Heading id={id} level={headingLevel} size="xl">{title}</Heading>
      {description && <Text tone="muted" className="block-empty-page-description">{description}</Text>}
      {actions && <div className="block-empty-page-actions">{actions}</div>}
    </section>
  );
});
