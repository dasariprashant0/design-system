import {forwardRef, useId, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Container} from '../container';
import {Heading} from '../heading';
import {Text} from '../text';

export interface BlockCtaProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The one-sentence call to action, rendered as the section heading. */
  title: ReactNode;
  /** Optional muted supporting line under the title. */
  description?: ReactNode;
  /** The next step: a solid Button and maybe a line one. */
  actions: ReactNode;
  /** Outline level of the title, 1 to 5. Default 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5;
}

/** A closing call to action: one sentence, one next step. */
export const BlockCta = forwardRef<HTMLElement, BlockCtaProps>(function BlockCta({title, description, actions, headingLevel = 2, className, ...rest}, ref) {
  const id = useId();
  return (
    <section ref={ref} className={cx('block-cta', className)} aria-labelledby={id} {...rest}>
      <Container>
        <div className="block-cta-box">
          <div className="block-cta-copy">
            <Heading id={id} level={headingLevel}>{title}</Heading>
            {description && <Text tone="muted">{description}</Text>}
          </div>
          <div className="block-cta-actions">{actions}</div>
        </div>
      </Container>
    </section>
  );
});
