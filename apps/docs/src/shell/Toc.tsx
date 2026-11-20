// "On this page", built the way the Twigs rail is built (it is a Fumadocs-style TOC): every link has a faint 1px rule of its
// own (depth 2 at the edge, depth 3 one step in, a short diagonal where the depth changes), and ONE accent "thumb" slides
// along the whole line. The thumb is a coloured block clipped by an SVG mask that traces the same line, so the accent
// follows the diagonals too. Geometry is measured from the rendered links, so it stays right when fonts or widths change.
import {useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import {useScrollSpy} from '@monoline/react';
import type {Heading} from './headings';

const GAP = 6; // a link's own block padding: the line stops this far from the link's edge
const X2 = 1, X3 = 11; // x of the depth 2 and depth 3 line inside the 12px wide mask

type Geo = {height: number; path: string; top: number; length: number};

function measure(body: HTMLElement, headings: Heading[], activeId: string | null | undefined): Geo | null {
  const links = [...body.querySelectorAll<HTMLElement>(':scope > a')];
  if (!links.length) return null;
  let path = '';
  let top = 0, length = 0;
  links.forEach((a, i) => {
    const x = headings[i]?.level === 3 ? X3 : X2;
    const y0 = a.offsetTop + (i === 0 ? 0 : GAP);
    const y1 = a.offsetTop + a.offsetHeight - (i === links.length - 1 ? 0 : GAP);
    path += `${i === 0 ? 'M' : 'L'}${x} ${y0} L${x} ${y1} `;
    if (headings[i]?.id === activeId) { top = y0; length = y1 - y0; }
  });
  return {height: body.scrollHeight, path: path.trim(), top, length};
}

export function Toc({headings, extra}: {headings: Heading[]; extra?: ReactNode}) {
  const active = useScrollSpy(headings.map((h) => h.id), 140);
  const body = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const run = () => setGeo(measure(el, headings, active));
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    document.fonts?.ready.then(run);
    return () => ro.disconnect();
  }, [headings, active]);

  const mask = geo ? `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 ${geo.height}"><path d="${geo.path}" stroke="black" stroke-width="1" fill="none"/></svg>`)}")` : undefined;

  return (
    <aside className="docs-rail" aria-label="On this page">
      <h2 className="toc-title">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M15 18H3" /><path d="M17 6H3" /><path d="M21 12H3" /></svg>
        On this page
      </h2>
      <div className="toc-body" ref={body}>
        {geo && (
          <div className="toc-thumb" aria-hidden="true" style={{width: 12, height: geo.height, maskImage: mask, WebkitMaskImage: mask}}>
            <div style={{marginTop: geo.top, height: geo.length}} />
          </div>
        )}
        {headings.map((h, i) => {
          const prev = headings[i - 1], next = headings[i + 1];
          const out = prev && prev.level !== h.level;
          const toNext = next && next.level !== h.level;
          return (
            <a key={h.id} href={`#${h.id}`} data-depth={h.level} data-active={h.id === active || undefined} aria-current={h.id === active ? 'location' : undefined}>
              {out && (
                <svg className="toc-bend" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  {h.level > prev.level ? <line x1="0" y1="0" x2="10" y2="12" /> : <line x1="10" y1="0" x2="0" y2="12" />}
                </svg>
              )}
              <span className="toc-rule" style={{top: out ? GAP : 0, bottom: toNext ? GAP : 0}} aria-hidden="true" />
              {h.text}
            </a>
          );
        })}
      </div>
      {extra}
    </aside>
  );
}
