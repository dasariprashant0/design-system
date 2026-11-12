'use client';
import {useEffect, useState} from 'react';

/** Pass the element ids in page order. Returns the id of the last one scrolled past `offset` pixels from the top. */
export function useScrollSpy(ids: readonly string[], offset = 80): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');
  useEffect(() => {
    const list = key ? key.split('|') : [];
    const update = () => {
      let current: string | null = null;
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [key, offset]);
  return active;
}
