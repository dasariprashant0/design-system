'use client';
import {forwardRef, type HTMLAttributes, type ReactElement} from 'react';
import {ChartShell, fillFor, YAxis, type Hit} from '../../utils/chart-parts';
import {axisLeft, extent, formatCompact, formatFull, labelStride, linearScale, niceTicks, normalize, r2, stack, textWidth, truncate, SERIES_STYLES, type ChartDatum, type ChartSeries} from '../../utils/chart';

export interface BarChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Accessible name and table caption. Required. */
  title: string;
  /** One series: `[{label: 'Mon', value: 3}]`. */
  data?: ChartDatum[];
  /** Several series: `[{name: 'Visits', values: [3, 5]}]`, with `labels` for the categories. */
  series?: ChartSeries[];
  /** Category labels for the x axis (or y axis when horizontal), one per value in `series`. */
  labels?: string[];
  /** Name of the single series when `data` is used. Default "Value". */
  seriesName?: string;
  /** `vertical` draws columns, `horizontal` draws rows (better for long labels). Default `vertical`. */
  orientation?: 'vertical' | 'horizontal';
  /** Stack series on top of each other instead of side by side. */
  stacked?: boolean;
  /** Print each value at the end of its bar (the total for stacked bars). */
  showValues?: boolean;
  /** Chart height in px. Horizontal charts size themselves to the number of rows when omitted. Default 280. */
  height?: number;
  /** Format a value for labels, tooltips and the table. */
  valueFormat?: (value: number) => string;
}

/** Bar chart in plain SVG. Several series are told apart by fill pattern as well as colour. Chart-wide choices follow shadcn/Recharts: one tooltip per category. */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {title, data, series: seriesProp, labels: labelsProp, seriesName = 'Value', orientation = 'vertical', stacked = false, showValues = false, height, valueFormat, ...rest}, ref) {
  const {labels, series} = normalize(data, seriesProp, labelsProp, seriesName);
  const n = labels.length, S = series.length;
  const horizontal = orientation === 'horizontal';
  const values = series.map((s) => s.values);
  const ext = extent(values, stacked);
  const t = niceTicks(ext.min, ext.max, horizontal ? 4 : 5);
  const fmt = valueFormat ?? formatFull;
  const axisFmt = valueFormat ?? formatCompact;
  const stk = stack(values);
  const h = height ?? (horizontal ? Math.max(120, n * ((stacked ? 1 : S) * 14 + 12) + 40) : 280);

  return (
    <ChartShell
      ref={ref} title={title} height={h} empty={n === 0} {...rest}
      legend={S > 1 ? series.map((s, k) => ({name: s.name, k, kind: 'fill' as const})) : undefined}
      table={{head: ['Category', ...series.map((s) => s.name)], rows: labels.map((l, i) => [l, ...series.map((s) => fmt(s.values[i]!))])}}
      build={(w, active, uid) => {
        const labelW = horizontal ? Math.min(Math.max(...labels.map((l) => textWidth(l))), w * 0.35) : 0;
        const left = horizontal ? labelW + 14 : axisLeft(t.ticks, axisFmt);
        const right = horizontal && showValues ? 52 : 12, top = !horizontal && showValues ? 20 : 8, bottom = horizontal ? 24 : 26;
        const x0 = left, x1 = Math.max(x0 + 1, w - right), y0 = top, y1 = Math.max(y0 + 1, h - bottom);
        const yv = linearScale(t.min, t.max, y1, y0), xv = linearScale(t.min, t.max, x0, x1);
        const band = ((horizontal ? y1 - y0 : x1 - x0)) / n;
        const inner = band * 0.7, gap = !stacked && S > 1 ? 2 : 0;
        const bw = stacked ? inner : (inner - gap * (S - 1)) / S;
        const stride = labelStride(n, x1 - x0, 48);
        const bars: ReactElement[] = [], texts: ReactElement[] = [], hits: Hit[] = [];

        labels.forEach((label, i) => {
          const cat = (horizontal ? y0 : x0) + i * band;
          const on = active === `c${i}` ? '' : undefined;
          series.forEach((s, k) => {
            const v = s.values[i]!;
            const a = stacked ? stk[k]![i]!.lo : Math.min(0, v), b = stacked ? stk[k]![i]!.hi : Math.max(0, v);
            const pos = cat + (band - inner) / 2 + (stacked ? 0 : k * (bw + gap));
            const rect = horizontal
              ? {x: xv(a), y: pos, width: Math.abs(xv(b) - xv(a)), height: bw}
              : {x: pos, y: yv(b), width: bw, height: Math.abs(yv(a) - yv(b))};
            bars.push(<rect key={`${i}-${k}`} className="chart-bar chart-outline" data-active={on} {...{x: r2(rect.x), y: r2(rect.y), width: r2(rect.width), height: r2(rect.height)}} style={{fill: fillFor(uid, k)}} />);
            if (showValues && !stacked) {
              texts.push(horizontal
                ? <text key={`v${i}-${k}`} className="chart-value" x={v >= 0 ? xv(v) + 4 : xv(v) - 4} y={pos + bw / 2} textAnchor={v >= 0 ? 'start' : 'end'} dominantBaseline="central">{fmt(v)}</text>
                : <text key={`v${i}-${k}`} className="chart-value" x={pos + bw / 2} y={v >= 0 ? yv(v) - 4 : yv(v) + 12} textAnchor="middle">{fmt(v)}</text>);
            }
          });
          const hi = Math.max(...series.map((_, k) => (stacked ? stk[k]![i]!.hi : Math.max(0, series[k]!.values[i]!))));
          const total = series.reduce((a, s) => a + s.values[i]!, 0);
          if (showValues && stacked) {
            texts.push(horizontal
              ? <text key={`t${i}`} className="chart-value" x={xv(hi) + 4} y={cat + band / 2} dominantBaseline="central">{fmt(total)}</text>
              : <text key={`t${i}`} className="chart-value" x={cat + band / 2} y={yv(hi) - 4} textAnchor="middle">{fmt(total)}</text>);
          }
          if (horizontal) {
            texts.push(<text key={`l${i}`} className="chart-tick" x={x0 - 8} y={cat + band / 2} textAnchor="end" dominantBaseline="central">{truncate(label, Math.floor(labelW / 7))}</text>);
          } else if (i % stride === 0) {
            texts.push(<text key={`l${i}`} className="chart-tick" x={cat + band / 2} y={y1 + 16} textAnchor="middle">{truncate(label, Math.max(3, Math.floor((band * stride) / 7)))}</text>);
          }
          hits.push({
            id: `c${i}`,
            label: `${label}: ${S === 1 ? fmt(series[0]!.values[i]!) : series.map((s) => `${s.name} ${fmt(s.values[i]!)}`).join(', ')}`,
            x: horizontal ? xv(hi) : cat + band / 2, y: horizontal ? cat + band / 2 : yv(hi),
            shape: horizontal ? {kind: 'rect', x: x0, y: cat, w: x1 - x0, h: band} : {kind: 'rect', x: cat, y: y0, w: band, h: y1 - y0},
            title: label,
            rows: [...series.map((s, k) => ({name: S > 1 ? s.name : undefined, value: fmt(s.values[i]!), k: S > 1 ? k % SERIES_STYLES : undefined})), ...(stacked && S > 1 ? [{name: 'Total', value: fmt(total)}] : [])],
          });
        });

        const grid = horizontal ? (
          <g className="chart-grid">
            {t.ticks.map((tk) => (
              <g key={tk}>
                <line className={tk === 0 ? 'chart-zero' : 'chart-rule'} x1={xv(tk)} x2={xv(tk)} y1={y0} y2={y1} />
                <text className="chart-tick" x={xv(tk)} y={y1 + 16} textAnchor="middle">{axisFmt(tk)}</text>
              </g>
            ))}
          </g>
        ) : <YAxis ticks={t.ticks} y={yv} left={x0} right={x1} format={axisFmt} />;
        return {visual: <>{grid}<g className="chart-marks">{bars}</g>{texts}</>, hits};
      }}
    />
  );
});
