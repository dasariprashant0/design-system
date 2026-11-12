/** Chart maths shared by BarChart, LineChart, AreaChart, PieChart and Sparkline. Pure functions, no React. */

export interface ChartDatum { label: string; value: number }
export interface ChartSeries { name: string; values: number[] }

/** How many distinct series styles exist (colour + pattern + dash + marker). Series beyond this cycle. */
export const SERIES_STYLES = 5;

const finite = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
/** Round to 2 decimals so SVG paths stay short. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Turn the two input shapes into one: `data` (single series of {label, value}) or `series` + `labels`.
 * Non-finite values become 0. Short series are padded with 0.
 */
export function normalize(data: ChartDatum[] | undefined, series: ChartSeries[] | undefined, labels: string[] | undefined, fallbackName: string): {labels: string[]; series: ChartSeries[]} {
  if (series && series.length) {
    const n = Math.max(labels?.length ?? 0, ...series.map((s) => s.values.length));
    return {
      labels: Array.from({length: n}, (_, i) => labels?.[i] ?? String(i + 1)),
      series: series.map((s) => ({name: s.name, values: Array.from({length: n}, (_, i) => finite(s.values[i]))})),
    };
  }
  const d = data ?? [];
  return {labels: d.map((x) => x.label), series: d.length ? [{name: fallbackName, values: d.map((x) => finite(x.value))}] : []};
}

/** Round a raw step up to 1, 2, 5 or 10 times a power of ten. */
function niceStep(raw: number): number {
  const exp = Math.floor(Math.log10(raw));
  const f = raw / 10 ** exp;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * 10 ** exp;
}

/**
 * Axis ticks that start and end on round numbers and cover [min, max].
 * `niceTicks(0, 97)` gives 0, 20, 40, 60, 80, 100. `count` is the wanted number of ticks, not a guarantee.
 */
export function niceTicks(min: number, max: number, count = 5): {ticks: number[]; min: number; max: number; step: number} {
  let lo = finite(min), hi = finite(max);
  if (lo > hi) [lo, hi] = [hi, lo];
  if (lo === hi) { if (lo === 0) hi = 1; else if (lo > 0) lo = 0; else hi = 0; }
  const step = niceStep((hi - lo) / Math.max(1, count - 1));
  const nlo = Math.floor(lo / step + 1e-9) * step;
  const nhi = Math.ceil(hi / step - 1e-9) * step;
  const dec = Math.max(0, -Math.floor(Math.log10(step)));
  const ticks: number[] = [];
  for (let i = 0, v = nlo; v <= nhi + step / 1e6 && i < 200; i++, v = nlo + i * step) ticks.push(Number(v.toFixed(Math.min(dec, 12))));
  return {ticks, min: ticks[0]!, max: ticks[ticks.length - 1]!, step};
}

/** A function mapping [d0, d1] onto [r0, r1]. A zero-width domain maps to the middle of the range. */
export function linearScale(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  const span = d1 - d0;
  return (v) => (span === 0 ? (r0 + r1) / 2 : r0 + ((v - d0) / span) * (r1 - r0));
}

/**
 * Stack values per category. Positives pile up from 0, negatives pile down from 0.
 * Returns [series][category] of {lo, hi} with lo <= hi.
 */
export function stack(values: number[][]): {lo: number; hi: number}[][] {
  const n = Math.max(0, ...values.map((s) => s.length));
  const pos = new Array<number>(n).fill(0), neg = new Array<number>(n).fill(0);
  return values.map((s) => s.map((v, i) => {
    if (v >= 0) { const lo = pos[i]!; pos[i] = lo + v; return {lo, hi: pos[i]!}; }
    const hi = neg[i]!; neg[i] = hi + v; return {lo: neg[i]!, hi};
  }));
}

/** The value range a set of series needs on its axis, always including 0. */
export function extent(values: number[][], stacked: boolean): {min: number; max: number} {
  if (stacked) {
    const s = stack(values).flat();
    return {min: Math.min(0, ...s.map((x) => x.lo)), max: Math.max(0, ...s.map((x) => x.hi))};
  }
  const all = values.flat();
  return {min: Math.min(0, ...all), max: Math.max(0, ...all)};
}

export interface PieArc { value: number; fraction: number; start: number; end: number }

/** Slice angles in degrees, clockwise from 12 o'clock. Negative values count as 0; angles sum to 360 unless the total is 0. */
export function pieArcs(values: number[]): PieArc[] {
  const v = values.map((x) => Math.max(0, finite(x)));
  const total = v.reduce((a, b) => a + b, 0);
  let acc = 0;
  return v.map((value) => {
    const fraction = total > 0 ? value / total : 0;
    const start = acc;
    acc += fraction * 360;
    return {value, fraction, start, end: acc};
  });
}

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;

/** SVG path for a pie slice (inner = 0) or donut segment, angles in degrees clockwise from the top. */
export function arcPath(cx: number, cy: number, r: number, inner: number, start: number, end: number): string {
  const sweep = Math.min(end - start, 359.99);
  if (sweep <= 0) return '';
  const e = start + sweep;
  const p = (rr: number, a: number) => `${r2(cx + rr * Math.cos(rad(a)))} ${r2(cy + rr * Math.sin(rad(a)))}`;
  const large = sweep > 180 ? 1 : 0;
  if (inner <= 0) return `M${cx} ${cy}L${p(r, start)}A${r} ${r} 0 ${large} 1 ${p(r, e)}Z`;
  return `M${p(r, start)}A${r} ${r} 0 ${large} 1 ${p(r, e)}L${p(inner, e)}A${inner} ${inner} 0 ${large} 0 ${p(inner, start)}Z`;
}

/** Centre of a slice at radius `r`, for tooltip anchors. */
export function arcCentroid(cx: number, cy: number, r: number, start: number, end: number): {x: number; y: number} {
  const a = rad((start + end) / 2);
  return {x: r2(cx + r * Math.cos(a)), y: r2(cy + r * Math.sin(a))};
}

/**
 * SVG path through points. `step` holds each value until the next x (step-after).
 * `reverse` walks the points backwards with the mirrored step, so a top edge plus a reversed bottom edge closes an area.
 */
export function polyline(xs: number[], ys: number[], step = false, reverse = false, cmd: 'M' | 'L' = 'M'): string {
  const n = xs.length;
  let d = '';
  for (let k = 0; k < n; k++) {
    const i = reverse ? n - 1 - k : k;
    const x = r2(xs[i]!), y = r2(ys[i]!);
    if (k === 0) d += `${cmd}${x} ${y}`;
    else d += step ? (reverse ? `V${y}H${x}` : `H${x}V${y}`) : `L${x} ${y}`;
  }
  return d;
}

/** Marker outline for series k, centred on (x, y) with radius r. Shapes differ so series do not rely on colour. */
export function markerPath(k: number, x: number, y: number, r: number): string {
  switch (k % SERIES_STYLES) {
    case 0: return `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    case 1: return `M${x - r} ${y - r}h${2 * r}v${2 * r}h${-2 * r}Z`;
    case 2: return `M${x} ${y - r * 1.3}L${x + r * 1.3} ${y}L${x} ${y + r * 1.3}L${x - r * 1.3} ${y}Z`;
    case 3: return `M${x} ${y - r * 1.2}L${x + r * 1.2} ${y + r}L${x - r * 1.2} ${y + r}Z`;
    default: return `M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}`;
  }
}

/** Dash pattern for series k (solid first). */
export const DASHES = ['', '6 3', '2 3', '8 3 2 3', '1 4'] as const;

/** Compact number for axes: 1200 → "1.2K", 3400000 → "3.4M". */
export function formatCompact(n: number): string {
  const a = Math.abs(n);
  if (a < 1000) return String(Number(n.toFixed(2)));
  return new Intl.NumberFormat('en-US', {notation: 'compact', maximumFractionDigits: 1}).format(n);
}

/** Full number for tooltips and tables: 1234567 → "1,234,567". */
export function formatFull(n: number): string {
  return new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(n);
}

/** Show every `stride`-th category label so they do not overlap. */
export function labelStride(count: number, room: number, labelSize: number): number {
  if (count <= 1) return 1;
  return Math.max(1, Math.ceil((count * labelSize) / Math.max(1, room)));
}

/** Estimated text width in px for the monospace face at the tick size (about 0.6em of 11px). */
export const textWidth = (s: string, size = 7): number => s.length * size;

/** Cut a label to `max` characters with an ellipsis. */
export const truncate = (s: string, max: number): string => (s.length > max ? `${s.slice(0, Math.max(1, max - 1))}…` : s);

/** Left margin that fits the widest y tick label. */
export const axisLeft = (ticks: number[], fmt: (n: number) => string): number => Math.max(...ticks.map((t) => textWidth(fmt(t)))) + 14;
