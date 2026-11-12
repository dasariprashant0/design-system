import {forwardRef, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Container} from '../container';
import {Heading} from '../heading';
import {Text} from '../text';

export interface Feature {
  title: ReactNode;
  description: ReactNode;
  /** Inline SVG, `aria-hidden`. */
  icon?: ReactNode;
}

export interface BlockFeatureGridProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section heading shown above the grid. */
  title: ReactNode;
  /** Optional muted line under the section heading. */
  description?: ReactNode;
  /** The items to show, each with a `title`, `description` and optional `icon`. */
  features: Feature[];
  /** Number of columns on wide screens: 2, 3 (default) or 4. Fewer columns are used on narrow screens. */
  columns?: 2 | 3 | 4;
  /** Outline level of the section title; each feature title is one level lower. */
  headingLevel?: 1 | 2 | 3 | 4 | 5;
}

/** A section title above a grid of short features. */
export const BlockFeatureGrid = forwardRef<HTMLElement, BlockFeatureGridProps>(function BlockFeatureGrid({title, description, features, columns = 3, headingLevel = 2, className, ...rest}, ref) {
  const id = useId();
  const sub = Math.min(headingLevel + 1, 6) as 2 | 3 | 4 | 5 | 6;
  return (
    <section ref={ref} className={cx('block-features', className)} aria-labelledby={id} {...rest}>
      <Container>
        <div className="block-features-head">
          <Heading id={id} level={headingLevel}>{title}</Heading>
          {description && <Text tone="muted">{description}</Text>}
        </div>
        <ul className="block-features-grid" data-columns={columns} role="list">
          {features.map((f, i) => (
            <li key={i} className="block-feature">
              {f.icon && <span className="block-feature-icon" aria-hidden="true">{f.icon}</span>}
              <Heading level={sub} size="md">{f.title}</Heading>
              <Text size="sm" tone="muted">{f.description}</Text>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
});
