'use client';
import {forwardRef, type HTMLAttributes, type ReactElement} from 'react';
import {ChartShell, fillFor, type Hit} from '../../utils/chart-parts';
import {arcCentroid, arcPath, formatFull, normalize, pieArcs, SERIES_STYLES, type ChartDatum} from '../../utils/chart';

export interface PieChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Accessible name and table caption. Required. */
  title: string;
  /** Slices: `[{label: 'Search', value: 40}]`. Negative values count as 0. */
  data: ChartDatum[];
  /** Hole size as a fraction of the radius, from 0 (pie) to just under 1. 0.6 makes a donut. Default 0. */
  innerRadius?: number;
  /** Chart height in px. Default 240. */
  height?: number;
  /** Format a value for the legend, tooltip and table. */
  valueFormat?: (value: number) => string;
}

const pct = (f: number) => `${Math.round(f * 1000) / 10}%`;

/** Pie or donut chart in plain SVG. Slices differ by fill pattern as well as colour; the legend lists every slice with its value and share. */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(function PieChart({title, data, innerRadius = 0, height = 240, valueFormat, ...rest}, ref) {
  const {labels, series} = normalize(data, undefined, undefined, 'Value');
  const arcs = pieArcs(series[0]?.values ?? []);
  const total = arcs.reduce((a, s) => a + s.value, 0);
  const fmt = valueFormat ?? formatFull;
  const hole = Math.min(0.95, Math.max(0, innerRadius));

  return (
    <ChartShell
      ref={ref} title={title} height={height} empty={labels.length === 0 || total <= 0} {...rest}
      legend={labels.map((l, i) => ({name: l, k: i, kind: 'fill' as const, detail: `${fmt(arcs[i]!.value)} · ${pct(arcs[i]!.fraction)}`}))}
      table={{head: ['Slice', 'Value', 'Share'], rows: labels.map((l, i) => [l, fmt(arcs[i]!.value), pct(arcs[i]!.fraction)])}}
      build={(w, active, uid) => {
        const cx = w / 2, cy = height / 2, r = Math.max(8, Math.min(w, height) / 2 - 6), inner = r * hole;
        const slices: ReactElement[] = [], hits: Hit[] = [];
        arcs.forEach((a, i) => {
          if (a.value <= 0) return;
          const d = arcPath(cx, cy, r, inner, a.start, a.end);
          slices.push(<path key={i} className="chart-slice chart-outline" data-active={active === `c${i}` ? '' : undefined} d={d} style={{fill: fillFor(uid, i)}} />);
          const c = arcCentroid(cx, cy, (r + inner) / 2, a.start, a.end);
          hits.push({id: `c${i}`, label: `${labels[i]}: ${fmt(a.value)} (${pct(a.fraction)})`, x: c.x, y: c.y, shape: {kind: 'path', d}, title: labels[i]!, rows: [{value: `${fmt(a.value)} · ${pct(a.fraction)}`, k: i % SERIES_STYLES}]});
        });
        return {visual: <g className="chart-marks">{slices}</g>, hits};
      }}
    />
  );
});
