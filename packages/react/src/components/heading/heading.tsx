import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Document outline level, 1 to 6. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Look. Defaults follow the level. `display` uses the display font. */
  size?: 'display' | 'xl' | 'lg' | 'md' | 'sm';
}

const defaults = {1: 'display', 2: 'xl', 3: 'lg', 4: 'md', 5: 'sm', 6: 'sm'} as const;

/** `<Heading level={2}>Pricing</Heading>`. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading({level = 2, size, className, ...rest}, ref) {
  const Tag = `h${level}` as 'h2';
  return <Tag ref={ref} className={cx('heading', `heading-${size ?? defaults[level]}`, className)} {...rest} />;
});
