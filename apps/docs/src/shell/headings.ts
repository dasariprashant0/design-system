// The right-hand "On this page" rail is built by scanning the rendered page, so content authors only write
// <h2> and <h3>. Headings without an id get one from their text; each gets a hover "#" anchor link.
import {useEffect, useState, type RefObject} from 'react';

export interface Heading {id: string; text: string; level: 2 | 3}

const slug = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
const textOf = (h: Element) => [...h.childNodes].filter((n) => !(n instanceof Element && n.classList.contains('h-anchor'))).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();

/** Give every h2/h3 outside live demos an id and an anchor link; return them in page order. Safe to call repeatedly. */
function decorate(root: HTMLElement): Heading[] {
  const out: Heading[] = [];
  root.querySelectorAll<HTMLHeadingElement>('h2, h3').forEach((h) => {
    if (h.closest('.stage, [data-no-toc]')) return;
    const text = textOf(h);
    if (!text) return;
    if (!h.id) {
      const base = slug(text);
      let id = base, n = 2;
      while (document.getElementById(id)) id = `${base}-${n++}`;
      h.id = id;
    }
    if (!h.querySelector(':scope > .h-anchor')) {
      const a = document.createElement('a');
      a.className = 'h-anchor';
      a.href = `#${h.id}`;
      a.setAttribute('aria-label', `Link to ${text}`);
      a.textContent = '#';
      h.append(a);
    }
    out.push({id: h.id, text, level: h.tagName === 'H3' ? 3 : 2});
  });
  return out;
}

const same = (a: Heading[], b: Heading[]) => a.length === b.length && a.every((h, i) => h.id === b[i]!.id && h.text === b[i]!.text);

/** Headings of the page inside `ref`, rescanned when the page changes (`key`) or its content does. */
export function useHeadings(ref: RefObject<HTMLElement | null>, key: string): Heading[] {
  const [list, setList] = useState<Heading[]>([]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let raf = 0;
    const scan = () => { const next = decorate(root); setList((p) => (same(p, next) ? p : next)); };
    scan();
    // ponytail: one scan per animation frame while content mutates; debounce if a demo ever animates its children.
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); });
    mo.observe(root, {childList: true, subtree: true});
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, [ref, key]);
  return list;
}

/** Copy the full URL of a heading when its "#" anchor is clicked; the browser also sets the hash and scrolls. */
export function installAnchorCopy() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a.h-anchor') as HTMLAnchorElement | null;
    if (a) navigator.clipboard?.writeText(a.href).catch(() => {});
  });
}
