import {forwardRef, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Container} from '../container';
import {Heading} from '../heading';

export interface Testimonial {
  quote: ReactNode;
  name: ReactNode;
  /** Role and company, for example "Design lead, Example Co". */
  role?: ReactNode;
  /** An `Avatar` or image, decorative. */
  avatar?: ReactNode;
}

export interface BlockTestimonialsProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  items: Testimonial[];
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** A row of quotes with their authors. Each is a `figure` with a `blockquote` and a `figcaption`. */
export const BlockTestimonials = forwardRef<HTMLElement, BlockTestimonialsProps>(function BlockTestimonials({title, items, headingLevel = 2, className, ...rest}, ref) {
  const id = useId();
  return (
    <section ref={ref} className={cx('block-testimonials', className)} aria-labelledby={id} {...rest}>
      <Container>
        <Heading id={id} level={headingLevel} className="block-testimonials-title">{title}</Heading>
        <div className="block-testimonials-grid">
          {items.map((t, i) => (
            <figure key={i} className="block-testimonial">
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                {t.avatar && <span className="block-testimonial-avatar" aria-hidden="true">{t.avatar}</span>}
                <span>
                  <span className="block-testimonial-name">{t.name}</span>
                  {t.role && <span className="block-testimonial-role">{t.role}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
});
