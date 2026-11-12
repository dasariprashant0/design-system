import {forwardRef, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Container} from '../container';
import {Heading} from '../heading';
import {Text} from '../text';

export interface BlockHeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or links. Make one of them the solid Button. */
  actions?: ReactNode;
  /** An image, screenshot or illustration shown beside (wide) or below (narrow) the copy. */
  media?: ReactNode;
  align?: 'start' | 'center';
  /** Outline level of the title. A hero is usually the page's h1. */
  headingLevel?: 1 | 2 | 3;
}

/** A page opener: eyebrow, title, description, actions and optional media. Copy comes from props. */
export const BlockHero = forwardRef<HTMLElement, BlockHeroProps>(function BlockHero({eyebrow, title, description, actions, media, align = 'start', headingLevel = 1, className, ...rest}, ref) {
  const id = useId();
  return (
    <section ref={ref} className={cx('block-hero', className)} data-align={align} aria-labelledby={id} {...rest}>
      <Container className="block-hero-inner">
        <div className="block-hero-copy">
          {eyebrow && <p className="block-hero-eyebrow">{eyebrow}</p>}
          <Heading id={id} level={headingLevel} size="display">{title}</Heading>
          {description && <Text size="lg" tone="muted" className="block-hero-description">{description}</Text>}
          {actions && <div className="block-hero-actions">{actions}</div>}
        </div>
        {media && <div className="block-hero-media">{media}</div>}
      </Container>
    </section>
  );
});
