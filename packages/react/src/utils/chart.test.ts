import {arcPath, extent, formatCompact, linearScale, niceTicks, normalize, pieArcs, polyline, stack} from './chart';

describe('niceTicks', () => {
  it('rounds 0..97 to 0, 20, ..., 100', () => {
    expect(niceTicks(0, 97).ticks).toEqual([0, 20, 40, 60, 80, 100]);
  });
  it('handles negatives, fractions and a single value', () => {
    expect(niceTicks(-8, 11).ticks).toEqual([-10, -5, 0, 5, 10, 15]);
    expect(niceTicks(0, 0.7).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8]);
    expect(niceTicks(0, 0).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(5, 5).ticks[0]).toBe(0);
  });
  it('covers the data and stays small for very large numbers', () => {
    const t = niceTicks(0, 4_130_000_000);
    expect(t.min).toBe(0);
    expect(t.max).toBeGreaterThanOrEqual(4_130_000_000);
    expect(t.ticks.length).toBeLessThan(10);
  });
  it('never returns NaN for bad input', () => {
    expect(niceTicks(NaN, Infinity).ticks.every(Number.isFinite)).toBe(true);
  });
});

describe('linearScale', () => {
  it('maps the domain onto the range, including inverted ranges', () => {
    const y = linearScale(0, 100, 200, 0);
    expect([y(0), y(50), y(100)]).toEqual([200, 100, 0]);
  });
  it('maps a zero-width domain to the middle', () => {
    expect(linearScale(3, 3, 0, 10)(3)).toBe(5);
  });
});

describe('stack', () => {
  it('stacks positives up and negatives down, separately', () => {
    const s = stack([[2, -1], [3, -2], [-4, 5]]);
    expect(s[0]).toEqual([{lo: 0, hi: 2}, {lo: -1, hi: 0}]);
    expect(s[1]).toEqual([{lo: 2, hi: 5}, {lo: -3, hi: -1}]);
    expect(s[2]).toEqual([{lo: -4, hi: 0}, {lo: 0, hi: 5}]);
  });
  it('extent includes 0 and the stacked total', () => {
    expect(extent([[2, 3], [4, 1]], true)).toEqual({min: 0, max: 6});
    expect(extent([[2, 3], [4, 1]], false)).toEqual({min: 0, max: 4});
    expect(extent([[-2], [-3]], true)).toEqual({min: -5, max: 0});
  });
});

describe('pieArcs', () => {
  it('sums to 360 degrees', () => {
    const a = pieArcs([1, 2, 3, 4]);
    expect(a[a.length - 1]!.end).toBeCloseTo(360);
    expect(a.reduce((s, x) => s + (x.end - x.start), 0)).toBeCloseTo(360);
    expect(a[0]!.start).toBe(0);
  });
  it('treats negatives as 0 and an all-zero set as no angle', () => {
    expect(pieArcs([5, -5]).map((x) => x.fraction)).toEqual([1, 0]);
    expect(pieArcs([0, 0]).every((x) => x.end === 0)).toBe(true);
  });
  it('draws a full circle as one valid path', () => {
    expect(arcPath(50, 50, 40, 0, 0, 360)).toMatch(/^M50 50L/);
    expect(arcPath(50, 50, 40, 20, 0, 90)).toContain('A');
    expect(arcPath(50, 50, 40, 0, 10, 10)).toBe('');
  });
});

describe('normalize', () => {
  it('reads data, pads short series and drops non-finite values', () => {
    expect(normalize([{label: 'a', value: NaN}, {label: 'b', value: 2}], undefined, undefined, 'V')).toEqual({labels: ['a', 'b'], series: [{name: 'V', values: [0, 2]}]});
    const n = normalize(undefined, [{name: 'x', values: [1]}, {name: 'y', values: [1, 2, 3]}], ['p'], 'V');
    expect(n.labels).toEqual(['p', '2', '3']);
    expect(n.series[0]!.values).toEqual([1, 0, 0]);
  });
  it('is empty without input', () => {
    expect(normalize(undefined, undefined, undefined, 'V').labels).toEqual([]);
  });
});

describe('polyline and format', () => {
  it('joins points straight or stepped', () => {
    expect(polyline([0, 10], [5, 7])).toBe('M0 5L10 7');
    expect(polyline([0, 10], [5, 7], true)).toBe('M0 5H10V7');
    expect(polyline([0, 10], [5, 7], true, true, 'L')).toBe('L10 7V5H0');
  });
  it('shortens large numbers', () => {
    expect(formatCompact(950)).toBe('950');
    expect(formatCompact(1200)).toBe('1.2K');
    expect(formatCompact(3_400_000)).toBe('3.4M');
  });
});
