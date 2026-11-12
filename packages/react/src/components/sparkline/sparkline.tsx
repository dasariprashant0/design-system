'use client';
import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {formatFull, linearScale, polyline, r2} from '../../utils/chart';

export interface SparklineProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'title'> {
  /** Accessible name. Required. */
  title: string;
  /** Values in order. Non-finite values count as 0. */
  data: number[];
  /** Names for the values, used in the screen reader table. Default: 1, 2, 3... */
  labels?: string[];
  /** Fill under the line. */
  area?: boolean;
  /** Width in px. Default 96. */
  width?: number;
  /** Height in px. Default 24. */
  height?: number;
  /** Format a value for the screen reader table. */
  valueFormat?: (value: number) => string;
}

/** A tiny inline trend: no axes, no tooltip, the last value marked. The full values are in a visually hidden table. */
export const Sparkline = forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline({title, data, labels, area = false, width = 96, height = 24, valueFormat, className, ...rest}, ref) {
  const vals = data.map((v) => (Number.isFinite(v) ? v : 0));
  if (!vals.length) return <span ref={ref} className={cx('sparkline', 'sparkline-empty', className)} role="img" aria-label={`${title}: no data`} {...rest}>No data</span>;
  const fmt = valueFormat ?? formatFull;
  const pad = 3, n = vals.length;
  const y = linearScale(Math.min(...vals), Math.max(...vals), height - pad, pad);
  const xs = vals.map((_, i) => (n === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (n - 1)));
  const ys = vals.map(y);
  const line = polyline(xs, ys);
  return (
    <span ref={ref} className={cx('sparkline', className)} {...rest}>
      <svg role="img" aria-label={title} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {area && <path className="sparkline-area" d={`${line}L${r2(xs[n - 1]!)} ${height}L${r2(xs[0]!)} ${height}Z`} />}
        <path className="sparkline-line" d={line} />
        <circle className="sparkline-dot" cx={r2(xs[n - 1]!)} cy={r2(ys[n - 1]!)} r="2.5" />
      </svg>
      {/* Spans with table roles, not a <table>: a sparkline sits inside a paragraph, where a real table is invalid HTML. */}
      <span role="table" aria-label={title} className="sr-only">
        <span role="rowgroup"><span role="row"><span role="columnheader">Point</span><span role="columnheader">Value</span></span></span>
        <span role="rowgroup">{vals.map((v, i) => <span role="row" key={i}><span role="rowheader">{labels?.[i] ?? String(i + 1)}</span><span role="cell">{fmt(v)}</span></span>)}</span>
      </span>
    </span>
  );
});
