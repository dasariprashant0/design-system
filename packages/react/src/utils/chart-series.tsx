'use client';
import {forwardRef, type HTMLAttributes, type ReactElement} from 'react';
import {ChartShell, fillFor, YAxis, type Hit} from './chart-parts';
import {DASHES, axisLeft, formatCompact, formatFull, labelStride, linearScale, markerPath, niceTicks, normalize, polyline, r2, stack, truncate, SERIES_STYLES, type ChartDatum, type ChartSeries} from './chart';

export interface SeriesChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Accessible name and table caption. Required. */
  title: string;
  /** One series: `[{label: 'Mon', value: 3}]`. */
  data?: ChartDatum[];
  /** Several series: `[{name: 'Visits', values: [3, 5]}]`, with `labels` for the x positions. */
  series?: ChartSeries[];
  labels?: string[];
  /** Name of the single series when `data` is used. Default "Value". */
  seriesName?: string;
  /** `linear` joins points with straight lines; `step` holds each value until the next point. */
  curve?: 'linear' | 'step';
  /** Chart height in px. Default 240. */
  height?: number;
  /** Format a value for labels, tooltips and the table. */
  valueFormat?: (value: number) => string;
}

/** Internal: the one chart body behind LineChart and AreaChart. */
export const SeriesChart = forwardRef<HTMLDivElement, SeriesChartProps & {kind: 'line' | 'area'; stacked?: boolean; showPoints?: boolean}>(function SeriesChart(
  {kind, stacked = false, showPoints = false, title, data, series: seriesProp, labels: labelsProp, seriesName = 'Value', curve = 'linear', height = 240, valueFormat, ...rest}, ref) {
  const {labels, series} = normalize(data, seriesProp, labelsProp, seriesName);
  const n = labels.length, S = series.length;
  const area = kind === 'area';
  const stk = stack(series.map((s) => s.values));
  const all = (area && stacked ? stk.flat().flatMap((x) => [x.lo, x.hi]) : series.flatMap((s) => s.values));
  const t = niceTicks(area ? Math.min(0, ...all) : Math.min(...all), area ? Math.max(0, ...all) : Math.max(...all));
  const fmt = valueFormat ?? formatFull;
  const axisFmt = valueFormat ?? formatCompact;
  const step = curve === 'step';

  return (
    <ChartShell
      ref={ref} title={title} height={height} empty={n === 0} {...rest}
      legend={S > 1 ? series.map((s, k) => ({name: s.name, k, kind: area ? ('fill' as const) : ('line' as const)})) : undefined}
      table={{head: ['Category', ...series.map((s) => s.name)], rows: labels.map((l, i) => [l, ...series.map((s) => fmt(s.values[i]!))])}}
      build={(w, active, uid) => {
        const x0 = axisLeft(t.ticks, axisFmt), x1 = Math.max(x0 + 1, w - 14), y0 = 10, y1 = Math.max(y0 + 1, height - 26);
        const yv = linearScale(t.min, t.max, y1, y0);
        const inset = Math.min(10, (x1 - x0) / 4);
        const xs = labels.map((_, i) => (n === 1 ? (x0 + x1) / 2 : x0 + inset + (i * (x1 - x0 - 2 * inset)) / (n - 1)));
        const stride = labelStride(n, x1 - x0, 56);
        const base = yv(Math.max(t.min, Math.min(0, t.max)));
        const ai = active ? Number(active.slice(1)) : -1;
        const fills: ReactElement[] = [], lines: ReactElement[] = [], dots: ReactElement[] = [], texts: ReactElement[] = [], hits: Hit[] = [];

        series.forEach((s, k) => {
          const i = k % SERIES_STYLES;
          const top = s.values.map((v, j) => yv(stacked && area ? stk[k]![j]!.hi : v));
          if (area) {
            const bot = s.values.map((_, j) => (stacked ? yv(stk[k]![j]!.lo) : base));
            fills.push(<path key={`a${k}`} className={`chart-area chart-s${i}`} d={`${polyline(xs, top, step)}${polyline(xs, bot, step, true, 'L')}Z`} style={{fill: fillFor(uid, k)}} />);
          }
          lines.push(<path key={`l${k}`} className={`chart-line chart-s${i}`} d={polyline(xs, top, step)} strokeDasharray={DASHES[i] || undefined} />);
          if (showPoints || n === 1) top.forEach((y, j) => dots.push(<path key={`p${k}-${j}`} className={`chart-point chart-s${i}`} d={markerPath(k, r2(xs[j]!), r2(y), 3.5)} />));
          if (ai >= 0) dots.push(<path key={`h${k}`} className={`chart-point chart-s${i}`} d={markerPath(k, r2(xs[ai]!), r2(top[ai]!), 5)} />);
        });

        labels.forEach((label, i) => {
          if (i % stride === 0) texts.push(<text key={`x${i}`} className="chart-tick" x={xs[i]} y={y1 + 16} textAnchor="middle">{truncate(label, Math.max(3, Math.floor(((x1 - x0) / n * stride) / 7)))}</text>);
          const half = n === 1 ? (x1 - x0) / 2 : (x1 - x0 - 2 * inset) / (n - 1) / 2;
          const hx = Math.max(x0, xs[i]! - half), hw = Math.min(x1, xs[i]! + half) - hx;
          const total = series.reduce((a, s) => a + s.values[i]!, 0);
          hits.push({
            id: `c${i}`,
            label: `${label}: ${S === 1 ? fmt(series[0]!.values[i]!) : series.map((s) => `${s.name} ${fmt(s.values[i]!)}`).join(', ')}`,
            x: xs[i]!, y: Math.min(...series.map((s, k) => yv(stacked && area ? stk[k]![i]!.hi : s.values[i]!))),
            shape: {kind: 'rect', x: hx, y: y0, w: Math.max(hw, 1), h: y1 - y0},
            title: label,
            rows: [...series.map((s, k) => ({name: S > 1 ? s.name : undefined, value: fmt(s.values[i]!), k: S > 1 ? k % SERIES_STYLES : undefined})), ...(area && stacked && S > 1 ? [{name: 'Total', value: fmt(total)}] : [])],
          });
        });

        return {
          visual: <>
            <YAxis ticks={t.ticks} y={yv} left={x0} right={x1} format={axisFmt} />
            {ai >= 0 && <line className="chart-guide" x1={xs[ai]} x2={xs[ai]} y1={y0} y2={y1} />}
            <g className="chart-marks">{fills}{lines}</g>
            {dots}{texts}
          </>,
          hits,
        };
      }}
    />
  );
});
