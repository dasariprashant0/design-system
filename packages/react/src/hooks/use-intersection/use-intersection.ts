'use client';
import {useCallback, useEffect, useRef, useState, type RefCallback} from 'react';

export interface UseIntersectionOptions extends IntersectionObserverInit {
  /** Stop observing after the first time it is visible. */
  once?: boolean;
}

/** Returns `[ref, entry]`; `entry?.isIntersecting` says if it is in view. */
export function useIntersection<T extends Element = Element>({once, root, rootMargin, threshold}: UseIntersectionOptions = {}): [RefCallback<T>, IntersectionObserverEntry | null] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const ref = useCallback<RefCallback<T>>((el) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    observer.current = new IntersectionObserver(([e]) => {
      if (!e) return;
      setEntry(e);
      if (once && e.isIntersecting) observer.current?.disconnect();
    }, {root, rootMargin, threshold});
    observer.current.observe(el);
  }, [once, root, rootMargin, threshold]);
  useEffect(() => () => observer.current?.disconnect(), []);
  return [ref, entry];
}
