import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {buildTokens, classify, cssBlocks, figmaVariables, flatten, parseSources, tokensCss, typesDts} from '../scripts/lib.mjs';

const here = import.meta.dirname;
const read = (p) => readFileSync(join(here, p), 'utf8');
const sources = {tokens: read('../../css/src/tokens.css'), accents: read('../../css/src/accents.css'), options: read('../../css/src/options.css')};
const src = parseSources(sources);
const json = JSON.parse(read('../dist/tokens.json'));
const THEMES = ['warm', 'dark', 'midnight'];

// The token stored for a CSS custom property in one scope: base, theme.<t>, accent.<a>.<t>, option.<kind>.<value>.
const valueAt = (scope, name) => {
  const {group, leaf} = classify(name);
  return scope.reduce((tree, key) => tree?.[key], json)?.[group]?.[leaf]?.$value;
};

test('every custom property in tokens.css is in tokens.json, with the same value', () => {
  for (const {selector, decls} of cssBlocks(sources.tokens)) {
    const theme = selector.match(/data-theme="(\w+)"/)?.[1] ?? 'warm';
    const scope = selector.includes(':root') && !selector.includes('data-theme') ? ['base'] : ['theme', theme];
    for (const [name, value] of decls) {
      assert.equal(valueAt(scope, name), value, `${selector} ${name}`);
    }
  }
});

test('accent presets round-trip: generic rule is the warm look, theme rules override it', () => {
  const accentBlocks = cssBlocks(sources.accents);
  assert.equal(Object.keys(json.accent).length, Object.keys(src.accents).length);
  for (const {selector, decls} of accentBlocks) {
    const name = selector.match(/data-accent="([\w-]+)"/)[1];
    const theme = selector.match(/data-theme="(\w+)"/)?.[1] ?? 'warm';
    for (const [prop, value] of decls) assert.equal(valueAt(['accent', name, theme], prop), value, `${selector} ${prop}`);
  }
});

test('option presets (font, radius, density) round-trip', () => {
  for (const {selector, decls} of cssBlocks(sources.options)) {
    const m = selector.match(/^\[data-(\w+)="([\w-]+)"\]$/);
    if (!m) continue;
    for (const [prop, value] of decls) assert.equal(valueAt(['option', m[1], m[2]], prop), value, `${selector} ${prop}`);
  }
});

test('themes are warm, dark and midnight; there are eight accents and three densities', () => {
  assert.deepEqual(Object.keys(json.theme), THEMES);
  assert.equal(Object.keys(json.accent).length, 8);
  assert.deepEqual(Object.keys(json.option.density).sort(), ['compact', 'spacious']);
});

test('tokens.css re-export parses back to the same values as tokens.json', () => {
  const css = cssBlocks(tokensCss(json));
  const base = css.find((b) => b.selector === ':root');
  assert.deepEqual(Object.fromEntries(base.decls), Object.fromEntries(flatten(json.base)));
  const dark = css.find((b) => b.selector === '[data-theme="dark"]');
  assert.deepEqual(Object.fromEntries(dark.decls), Object.fromEntries(flatten(json.theme.dark)));
  const options = Object.values(json.option).reduce((n, values) => n + Object.keys(values).length, 0);
  assert.equal(css.length, 1 + THEMES.length + Object.keys(json.accent).length * THEMES.length + options);
});

test('tokens.css in dist is the same re-export that the build writes', () => {
  assert.equal(read('../dist/tokens.css').trim(), tokensCss(json).trim());
});

test('figma variables: four collections, colours per theme and accent, values as the browser computes them', () => {
  const fig = figmaVariables(src);
  assert.deepEqual(fig.collections.map((c) => c.name), ['Colors', 'Spacing', 'Radius', 'Typography']);
  const colors = fig.collections[0];
  assert.equal(colors.modes.length, 3 * 8);
  for (const v of colors.variables) {
    assert.equal(v.resolvedType, 'COLOR');
    assert.deepEqual(Object.keys(v.valuesByMode).sort(), [...colors.modes].sort(), v.name);
    for (const c of Object.values(v.valuesByMode)) for (const k of ['r', 'g', 'b', 'a']) assert.ok(c[k] >= 0 && c[k] <= 1, `${v.name} ${k}`);
  }
  const ink2 = colors.variables.find((v) => v.name === 'color/ink-2').valuesByMode['warm / orange'];
  assert.deepEqual([ink2.r.toFixed(3), ink2.g.toFixed(3), ink2.b.toFixed(3), ink2.a], ['0.086', '0.071', '0.055', 0.7]);
  const accentMidnightGreen = colors.variables.find((v) => v.name === 'color/accent').valuesByMode['midnight / green'];
  assert.equal(Math.round(accentMidnightGreen.g * 255), 0xd6);
});

test('figma spacing, radius and typography: px become numbers, calc is evaluated, clamp stays a string', () => {
  const fig = figmaVariables(src);
  const [, spacing, radius, typography] = fig.collections;
  assert.equal(spacing.variables.find((v) => v.name === 'control/sm').valuesByMode.comfortable, 36);
  assert.equal(spacing.variables.find((v) => v.name === 'space/s2').valuesByMode.compact, 6);
  assert.deepEqual(radius.variables.find((v) => v.name === 'radius/radius').valuesByMode, {square: 0, soft: 6, round: 12});
  assert.equal(typography.modes.length, 9);
  assert.equal(typography.variables.find((v) => v.name === 'type/text-base').valuesByMode['mono / compact'], 14);
  assert.equal(typography.variables.find((v) => v.name === 'type/display-md').resolvedType, 'STRING');
  assert.ok(fig.$skipped.includes('--z-drawer') && fig.$skipped.includes('--hatch'));
});

test('typescript types list the token names and themes', () => {
  const dts = read('../dist/tokens.d.ts');
  assert.match(dts, /export type Theme = "warm" \| "dark" \| "midnight";/);
  const colorToken = dts.match(/export type ColorToken = (.*);/)[1];
  for (const name of ['background', 'ink-1', 'code-keyword']) assert.ok(colorToken.includes(`"${name}"`), name);
  assert.match(dts, /export type CssVariable = .*"--control-sm"/);
  assert.equal(typesDts(json), dts);
});

test('a missing reference fails the build instead of writing a wrong value', () => {
  const broken = {...sources, tokens: sources.tokens.replace('--ink-1:', '--ink-1: var(--nope);\n  --x:')};
  assert.throws(() => figmaVariables(parseSources(broken)), /undefined token --nope/);
});

test('build output matches a fresh build of the sources (dist is not stale)', () => {
  assert.equal(read('../dist/tokens.json'), JSON.stringify(buildTokens(src), null, 2) + '\n');
});
