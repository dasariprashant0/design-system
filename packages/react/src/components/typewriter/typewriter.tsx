'use client';
import {forwardRef, useEffect, useRef, useState, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {usePrefersReducedMotion} from '../number-ticker/use-reduced-motion';

export interface TypewriterProps extends HTMLAttributes<HTMLSpanElement> {
  /** The string to type. Screen readers get all of it at once. */
  text: string;
  /** Milliseconds per character. Default 40. */
  speed?: number;
  /** Milliseconds to wait before the first character. Default 0. */
  delay?: number;
  /** Show a blinking caret. Default true. */
  cursor?: boolean;
  /** Called once the last character is shown (also straight away for reduced motion). */
  onComplete?: () => void;
}

/**
 * Types `text` one character at a time. With `prefers-reduced-motion` the full string shows at once.
 * The typed characters are `aria-hidden`; an `sr-only` copy holds the whole text.
 */
export const Typewriter = forwardRef<HTMLSpanElement, TypewriterProps>(function Typewriter({text, speed = 40, delay = 0, cursor = true, onComplete, className, ...rest}, ref) {
  const [count, setCount] = useState(text.length);
  const reduced = usePrefersReducedMotion();
  const done = useRef(onComplete);
  done.current = onComplete;

  useEffect(() => {
    if (reduced) { setCount(text.length); done.current?.(); return; }
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    const tick = () => {
      n += 1;
      setCount(n);
      if (n < text.length) timer = setTimeout(tick, speed); else done.current?.();
    };
    setCount(0);
    timer = setTimeout(tick, delay || speed);
    return () => clearTimeout(timer);
  }, [text, speed, delay, reduced]);

  return (
    <span ref={ref} className={cx('typewriter', className)} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{text.slice(0, count)}{cursor && <span className="typewriter-caret" />}</span>
    </span>
  );
});
