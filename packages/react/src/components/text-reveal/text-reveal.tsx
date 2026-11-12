import {forwardRef, type CSSProperties, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface TextRevealProps extends HTMLAttributes<HTMLParagraphElement> {
  /** The sentence to reveal, word by word. */
  text: string;
  /** Milliseconds between words. Default 80. */
  stagger?: number;
}

/** Words fade in one after another on mount. Pure CSS, so the text is ordinary text to assistive tech. Static under reduced motion. */
export const TextReveal = forwardRef<HTMLParagraphElement, TextRevealProps>(function TextReveal({text, stagger = 80, className, style, ...rest}, ref) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p ref={ref} className={cx('text-reveal', className)} style={{'--text-reveal-step': `${stagger}ms`, ...style} as CSSProperties} {...rest}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="text-reveal-word" style={{'--i': i} as CSSProperties}>{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  );
});
