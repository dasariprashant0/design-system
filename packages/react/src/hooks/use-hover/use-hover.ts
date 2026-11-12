'use client';
import {useCallback, useEffect, useRef, useState, type RefCallback} from 'react';

/** Returns `[ref, hovered]`. Attach `ref` to the element. Pointer only, so keep it for decoration. */
export function useHover<T extends HTMLElement = HTMLElement>(): [RefCallback<T>, boolean] {
  const [hovered, setHovered] = useState(false);
  const node = useRef<T | null>(null);
  const on = useCallback(() => setHovered(true), []);
  const off = useCallback(() => setHovered(false), []);
  const ref = useCallback<RefCallback<T>>((el) => {
    if (node.current) { node.current.removeEventListener('mouseenter', on); node.current.removeEventListener('mouseleave', off); }
    node.current = el;
    if (el) { el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off); }
  }, [on, off]);
  useEffect(() => () => { node.current?.removeEventListener('mouseenter', on); node.current?.removeEventListener('mouseleave', off); }, [on, off]);
  return [ref, hovered];
}
