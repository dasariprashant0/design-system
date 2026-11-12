'use client';
import {forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode} from 'react';
import {cx} from './cx';
import {DASHES, SERIES_STYLES} from './chart';

/** Shared frame for the chart components: measured width, pattern defs, hit layer, tooltip, legend and the screen reader table. Not part of the public API. */

export type HitShape = {kind: 'rect'; x: number; y: number; w: number; h: number} | {kind: 'circle'; cx: number; cy: number; r: number} | {kind: 'path'; d: string};

export interface Hit {
  id: string;
  /** Spoken name of this stop, e.g. "Mon: Visits 3, Signups 5". */
  label: string;
  /** Tooltip anchor in chart coordinates. */
  x: number;
  y: number;
  shape: HitShape;
  title: string;
  rows: {name?: string; value: string; k?: number}[];
}

export interface LegendItem { name: string; k: number; kind: 'fill' | 'line'; detail?: string }

export interface ChartShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  height: number;
  empty?: boolean;
  legend?: LegendItem[];
  table: {head: string[]; rows: string[][]};
  build: (w: number, active: string | null, uid: string) => {visual: ReactNode; hits: Hit[]};
}

/** Fill for series k: solid accent first, then patterns defined in ChartDefs. */
export const fillFor = (uid: string, k: number): string => (k % SERIES_STYLES === 0 ? 'var(--accent)' : `url(#${uid}-p${k % SERIES_STYLES})`);

export function ChartDefs({uid}: {uid: string}) {
  return (
    <defs>
      <pattern id={`${uid}-p1`} className="chart-s1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line className="chart-pat" x1="0" y1="0" x2="0" y2="6" strokeWidth="1.5" /></pattern>
      <pattern id={`${uid}-p2`} className="chart-s2" width="6" height="6" patternUnits="userSpaceOnUse"><circle className="chart-pat-dot" cx="3" cy="3" r="1.2" /></pattern>
      <pattern id={`${uid}-p3`} className="chart-s3" width="6" height="5" patternUnits="userSpaceOnUse"><line className="chart-pat" x1="0" y1="2.5" x2="6" y2="2.5" strokeWidth="1.5" /></pattern>
      <pattern id={`${uid}-p4`} className="chart-s4" width="6" height="6" patternUnits="userSpaceOnUse"><path className="chart-pat" d="M0 0L6 6M6 0L0 6" strokeWidth="1" /></pattern>
    </defs>
  );
}

function Swatch({uid, k, kind}: {uid: string; k: number; kind: 'fill' | 'line'}) {
  const i = k % SERIES_STYLES;
  return (
    <svg className={cx('chart-swatch', `chart-s${i}`)} width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
      {kind === 'fill'
        ? <rect className="chart-outline" x="0.5" y="0.5" width="17" height="11" style={{fill: fillFor(uid, k)}} />
        : <line className="chart-line" x1="0" y1="6" x2="18" y2="6" strokeDasharray={DASHES[i] || undefined} />}
    </svg>
  );
}

function useWidth(initial: number): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = (n: number) => { const r = Math.round(n); if (r > 0) setW(r); };
    set(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((e) => set(e[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export const ChartShell = forwardRef<HTMLDivElement, ChartShellProps>(function ChartShell({title, height, empty, legend, table, build, className, ...rest}, ref) {
  const uid = 'c' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [plotRef, w] = useWidth(480);
  const [active, setActive] = useState<string | null>(null);

  if (empty) return <div ref={ref} className={cx('chart', 'chart-empty', className)} role="img" aria-label={`${title}: no data`} {...rest}>No data</div>;

  const {visual, hits} = build(w, active, uid);
  const tip = hits.find((h) => h.id === active);

  const move = (e: KeyboardEvent<SVGSVGElement>) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (e.key === 'Escape') { setActive(null); return; }
    if (!delta) return;
    const all = Array.from(e.currentTarget.querySelectorAll<SVGElement>('[data-hit]'));
    const next = all[all.indexOf(document.activeElement as SVGElement) + delta];
    if (next) { e.preventDefault(); next.focus(); }
  };

  return (
    <div ref={ref} className={cx('chart', className)} {...rest}>
      <div className="chart-plot" ref={plotRef}>
        <svg className="chart-svg" role="img" aria-label={title} width={w} height={height} viewBox={`0 0 ${w} ${height}`}>
          <ChartDefs uid={uid} />
          {visual}
        </svg>
        <svg className="chart-hits" role="group" aria-label={`${title}, values`} width={w} height={height} viewBox={`0 0 ${w} ${height}`} onKeyDown={move}>
          {hits.map((h) => {
            const common = {
              className: 'chart-hit', 'data-hit': '', 'data-active': h.id === active ? '' : undefined, role: 'img', 'aria-label': h.label, tabIndex: 0,
              onMouseEnter: () => setActive(h.id), onMouseLeave: () => setActive((a) => (a === h.id ? null : a)),
              onFocus: () => setActive(h.id), onBlur: () => setActive((a) => (a === h.id ? null : a)),
            };
            const s = h.shape;
            return s.kind === 'rect' ? <rect key={h.id} {...common} x={s.x} y={s.y} width={s.w} height={s.h} />
              : s.kind === 'circle' ? <circle key={h.id} {...common} cx={s.cx} cy={s.cy} r={s.r} />
              : <path key={h.id} {...common} d={s.d} />;
          })}
        </svg>
        {tip && (
          <div className="chart-tip" aria-hidden="true" data-align={tip.x < w * 0.2 ? 'start' : tip.x > w * 0.8 ? 'end' : 'center'} style={{left: `${(tip.x / w) * 100}%`, top: `${(tip.y / height) * 100}%`}}>
            <div className="chart-tip-title">{tip.title}</div>
            {tip.rows.map((r, i) => (
              <div className="chart-tip-row" key={i}>
                {r.k !== undefined && <Swatch uid={uid} k={r.k} kind="fill" />}
                {r.name && <span>{r.name}</span>}
                <span className="chart-tip-value">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {legend && legend.length > 0 && (
        <ul className="chart-legend">
          {legend.map((l) => (
            <li key={l.name}>
              <Swatch uid={uid} k={l.k} kind={l.kind} />
              <span>{l.name}</span>
              {l.detail && <span className="chart-legend-detail">{l.detail}</span>}
            </li>
          ))}
        </ul>
      )}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead><tr>{table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
      </table>
    </div>
  );
});

/** Horizontal gridlines with value labels down the left side. */
export function YAxis({ticks, y, left, right, format}: {ticks: number[]; y: (v: number) => number; left: number; right: number; format: (v: number) => string}) {
  return (
    <g className="chart-grid">
      {ticks.map((t) => (
        <g key={t}>
          <line className={t === 0 ? 'chart-zero' : 'chart-rule'} x1={left} x2={right} y1={y(t)} y2={y(t)} />
          <text className="chart-tick" x={left - 6} y={y(t)} textAnchor="end" dominantBaseline="central">{format(t)}</text>
        </g>
      ))}
    </g>
  );
}
